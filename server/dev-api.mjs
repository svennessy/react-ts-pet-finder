/**
 * Dev API: bbox-filtered pets with separate lightweight map + paginated sidebar routes.
 * Caches upstream users once, then serves filtered results from memory.
 * Other /api/* routes proxy to pet-info-db on Render.
 */
import express from "express";

const PORT = Number(process.env.API_PORT) || 3001;
const UPSTREAM = (
  process.env.API_UPSTREAM ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://pet-info-db.onrender.com"
).replace(/\/$/, "");
const PAGE_SIZE = 200;
const MAX_MAP_RESULTS = 5000;
const MAX_BBOX_RESULTS = 500;

const COLORS = [
  "golden",
  "black",
  "brown",
  "white",
  "brindle",
  "gray",
  "cream",
  "tricolor",
];

function offsetCoordinate(lat, lng, index, spread = 0.025) {
  const angle = (index * 137.5 * Math.PI) / 180;
  const radius = spread * (0.3 + (index % 7) / 7);
  return {
    lat: lat + radius * Math.cos(angle),
    lng: lng + radius * Math.sin(angle),
  };
}

function normalizeReportStatus(value) {
  if (value === "found" || value === "Found") return "found";
  if (value === "resolved" || value === "Resolved") return "resolved";
  return "lost";
}

function mapPhotos(pet, petId) {
  if (!Array.isArray(pet.photos)) return [];

  return pet.photos.map((photo, index) => ({
    id: photo.id ?? index + 1,
    petId: Number(petId),
    imagePath: photo.imagePath ?? photo.path ?? "",
    imageUrl: photo.imageUrl ?? photo.url,
    resolvedUrl: photo.resolvedUrl ?? photo.imageUrl ?? photo.url,
    sortOrder: photo.sortOrder ?? index,
    createdAt: photo.createdAt,
  }));
}

function mapUserToListing(user, cityById) {
  const city = cityById.get(user.cityId);
  const pet = user.pet;
  if (!city || !pet) return null;

  const { lat, lng } = offsetCoordinate(
    city.latitude,
    city.longitude,
    pet.id,
    0.025,
  );
  const reportStatus = normalizeReportStatus(pet.reportStatus);
  const statusLabel = reportStatus === "found" ? "Found" : "Lost";
  const location = `${user.city.name}, ${user.city.stateCode}`;
  let species = pet.species;
  if (species !== "dog" && species !== "cat") species = "other";

  const breedLabel = pet.breedLabel ?? pet.breed ?? "Unknown";
  const name =
    pet.name === "Unknown"
      ? `${breedLabel} (${statusLabel.toLowerCase()})`
      : pet.name;

  return {
    id: String(pet.id),
    name,
    species,
    breedLabel,
    color: COLORS[pet.id % COLORS.length],
    reportStatus,
    reportType: reportStatus,
    description:
      pet.description ||
      `${statusLabel} in ${location}. Contact ${user.firstName} ${user.lastName}.`,
    latitude: lat,
    longitude: lng,
    cityName: user.city.name,
    stateCode: user.city.stateCode,
    locationLabel: location,
    createdAt: pet.createdAt || user.createdAt || new Date(0).toISOString(),
    photos: mapPhotos(pet, pet.id),
  };
}

function toMapMarker(listing) {
  return {
    id: listing.id,
    name: listing.name,
    species: listing.species,
    reportStatus: listing.reportStatus,
    latitude: listing.latitude,
    longitude: listing.longitude,
  };
}

function toSidebarPet(listing) {
  return {
    id: listing.id,
    name: listing.name,
    description: listing.description,
    species: listing.species,
    reportStatus: listing.reportStatus,
    reportType: listing.reportStatus,
    breed: listing.breedLabel,
    breedLabel: listing.breedLabel,
    color: listing.color,
    latitude: listing.latitude,
    longitude: listing.longitude,
    cityName: listing.cityName,
    stateCode: listing.stateCode,
    locationLabel: listing.locationLabel,
    createdAt: listing.createdAt,
    photos: listing.photos,
  };
}

let listingsCache = null;
let cachePromise = null;

async function upstreamJson(path) {
  const res = await fetch(`${UPSTREAM}${path}`);
  if (!res.ok) {
    throw new Error(`Upstream ${res.status} for ${path}`);
  }
  return res.json();
}

async function loadAllListings() {
  const cities = await upstreamJson("/api/cities");
  const cityById = new Map(cities.map((c) => [c.id, c]));

  const first = await upstreamJson(`/api/users?page=1&limit=${PAGE_SIZE}`);
  const users = [...first.users];

  for (let page = 2; page <= first.totalPages; page++) {
    const res = await upstreamJson(`/api/users?page=${page}&limit=${PAGE_SIZE}`);
    users.push(...res.users);
    if (page % 20 === 0) {
      console.log(`[dev-api] cached users page ${page}/${first.totalPages}`);
    }
  }

  const listings = [];
  for (const user of users) {
    const mapped = mapUserToListing(user, cityById);
    if (mapped) listings.push(mapped);
  }
  console.log(`[dev-api] cache ready: ${listings.length} pets`);
  return listings;
}

function getListings() {
  if (listingsCache) return Promise.resolve(listingsCache);
  if (!cachePromise) {
    cachePromise = loadAllListings()
      .then((data) => {
        listingsCache = data;
        return data;
      })
      .catch((err) => {
        cachePromise = null;
        throw err;
      });
  }
  return cachePromise;
}

function inBounds(pet, minLat, maxLat, minLng, maxLng) {
  if (pet.latitude < minLat || pet.latitude > maxLat) return false;
  if (minLng <= maxLng) {
    return pet.longitude >= minLng && pet.longitude <= maxLng;
  }
  return pet.longitude >= minLng || pet.longitude <= maxLng;
}

function parseBounds(query) {
  const minLat = Number(query.minLat);
  const maxLat = Number(query.maxLat);
  const minLng = Number(query.minLng);
  const maxLng = Number(query.maxLng);

  const hasBbox =
    Number.isFinite(minLat) &&
    Number.isFinite(maxLat) &&
    Number.isFinite(minLng) &&
    Number.isFinite(maxLng);

  return hasBbox ? { minLat, maxLat, minLng, maxLng } : null;
}

function filterListings(listings, query, bounds) {
  let result = listings;

  if (bounds) {
    result = result.filter((pet) =>
      inBounds(pet, bounds.minLat, bounds.maxLat, bounds.minLng, bounds.maxLng),
    );
  }

  const species = query.species;
  if (species && species !== "all") {
    result = result.filter((pet) => pet.species === species);
  }

  const reportStatus = query.reportStatus;
  if (reportStatus && reportStatus !== "all") {
    result = result.filter((pet) => pet.reportStatus === reportStatus);
  }

  const search = typeof query.search === "string" ? query.search.trim().toLowerCase() : "";
  if (search) {
    result = result.filter((pet) => {
      return (
        pet.name.toLowerCase().includes(search) ||
        pet.breedLabel.toLowerCase().includes(search) ||
        (pet.locationLabel ?? "").toLowerCase().includes(search)
      );
    });
  }

  return result;
}

function sortListings(listings, query) {
  const sort = query.sort || "createdAt";
  const order = query.order || (sort === "name" ? "asc" : "desc");
  const direction = order === "asc" ? 1 : -1;
  const sorted = [...listings];

  if (sort === "name") {
    sorted.sort((left, right) => direction * left.name.localeCompare(right.name));
    return sorted;
  }

  sorted.sort(
    (left, right) =>
      direction *
      (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()),
  );
  return sorted;
}

async function queryListings(req) {
  const all = await getListings();
  const bounds = parseBounds(req.query);
  const filtered = filterListings(all, req.query, bounds);
  const sorted = sortListings(filtered, req.query);
  return { sorted, bounds };
}

const app = express();

app.get("/api/pets/map", async (req, res) => {
  const bounds = parseBounds(req.query);
  if (!bounds) {
    return res.status(400).json({ error: "Map bounds are required" });
  }

  const limit = Math.min(Number(req.query.limit) || MAX_MAP_RESULTS, MAX_MAP_RESULTS);

  try {
    const { sorted } = await queryListings(req);
    const pets = sorted.slice(0, limit).map(toMapMarker);

    res.json({
      pets,
      total: sorted.length,
    });
  } catch (err) {
    console.error("[dev-api] /api/pets/map error", err);
    res.status(500).json({ error: "Failed to load map pets" });
  }
});

app.get("/api/pets/sidebar", async (req, res) => {
  const bounds = parseBounds(req.query);
  if (!bounds) {
    return res.status(400).json({ error: "Map bounds are required" });
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 40), 40);
  const offset = (page - 1) * limit;

  try {
    const { sorted } = await queryListings(req);
    const pets = sorted.slice(offset, offset + limit).map(toSidebarPet);

    res.json({
      pets,
      total: sorted.length,
      page,
      limit,
    });
  } catch (err) {
    console.error("[dev-api] /api/pets/sidebar error", err);
    res.status(500).json({ error: "Failed to load sidebar pets" });
  }
});

app.get("/api/pets", async (req, res) => {
  const bounds = parseBounds(req.query);

  if (!bounds) {
    try {
      const upstream = await upstreamJson(req.originalUrl);
      return res.json(upstream);
    } catch (err) {
      return res.status(502).json({ error: String(err) });
    }
  }

  const limit = Math.min(
    Number(req.query.limit) || MAX_BBOX_RESULTS,
    MAX_BBOX_RESULTS,
  );

  try {
    const { sorted } = await queryListings(req);
    const pets = sorted.slice(0, limit).map(toSidebarPet);

    res.json({
      pets,
      total: sorted.length,
      bounds,
    });
  } catch (err) {
    console.error("[dev-api] bbox error", err);
    res.status(500).json({ error: "Failed to load pets" });
  }
});

app.use("/api", async (req, res) => {
  try {
    const url = `${UPSTREAM}${req.originalUrl}`;
    const upstream = await fetch(url, {
      method: req.method,
      headers: { accept: "application/json" },
    });
    const body = await upstream.text();
    res.status(upstream.status).type(upstream.headers.get("content-type") || "json");
    res.send(body);
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`[dev-api] http://localhost:${PORT} → ${UPSTREAM}`);
  void getListings().catch((err) =>
    console.warn("[dev-api] cache warm-up failed:", err.message),
  );
});
