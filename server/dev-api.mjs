/**
 * Dev API: bbox-filtered /api/pets (Zillow-style).
 * Caches upstream users once, then serves only pets in the requested bounds.
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

// converts users -> pets -> map listings
// frontend cache system is based on this old architecture
// new backend already has /api/pets with lat/lng/species/breed 
function mapUserToListing(user, cityById) {
  const city = cityById.get(user.cityId);
  const pet = user.pet;
  if (!city || !pet) return null;

  const { lat, lng } = offsetCoordinate(
    city.latitude,
    city.longitude,
    pet.id,
    0.025
  );
  const status = pet.reportStatus === "found" ? "Found" : "Lost";
  const location = `${user.city.name}, ${user.city.stateCode}`;
  let species = pet.species;
  if (species !== "dog" && species !== "cat") species = "other";

  return {
    id: String(pet.id),
    name:
      pet.name === "Unknown"
        ? `${pet.breedLabel} (${status.toLowerCase()})`
        : pet.name,
    species,
    breed: pet.breedLabel,
    color: COLORS[pet.id % COLORS.length],
    reportType: pet.reportStatus === "found" ? "found" : "lost",
    description: `${status} in ${location}. Contact ${user.firstName} ${user.lastName}.`,
    latitude: lat,
    longitude: lng,
    reportedAt: "",
  };
}

let listingsCache = null;
let cachePromise = null;

// API launches and void getListings() immediately begins caching
async function upstreamJson(path) {
  const res = await fetch(`${UPSTREAM}${path}`);
  if (!res.ok) {
    throw new Error(`Upstream ${res.status} for ${path}`);
  }
  return res.json();
}

// Cache: /api/cities, then /api/users?page=1, then /api/users?page=2, etc.
async function loadAllListings() {
  const cities = await upstreamJson("/api/cities");
  const cityById = new Map(cities.map((c) => [c.id, c]));

  const first = await upstreamJson(
    `/api/users?page=1&limit=${PAGE_SIZE}`
  );
  const users = [...first.users];

  for (let page = 2; page <= first.totalPages; page++) {
    const res = await upstreamJson(
      `/api/users?page=${page}&limit=${PAGE_SIZE}`
    );
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

const app = express();

app.get("/api/pets", async (req, res) => {
  const minLat = Number(req.query.minLat);
  const maxLat = Number(req.query.maxLat);
  const minLng = Number(req.query.minLng);
  const maxLng = Number(req.query.maxLng);
  const limit = Math.min(
    Number(req.query.limit) || MAX_BBOX_RESULTS,
    MAX_BBOX_RESULTS
  );

  const hasBbox =
    Number.isFinite(minLat) &&
    Number.isFinite(maxLat) &&
    Number.isFinite(minLng) &&
    Number.isFinite(maxLng);

  if (!hasBbox) {
    try {
      const upstream = await upstreamJson(req.originalUrl);
      return res.json(upstream);
    } catch (err) {
      return res.status(502).json({ error: String(err) });
    }
  }

  try {
    const all = await getListings();
    const pets = all
      .filter((p) => inBounds(p, minLat, maxLat, minLng, maxLng))
      .slice(0, limit);

    res.json({
      pets,
      total: pets.length,
      bounds: { minLat, maxLat, minLng, maxLng },
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
    console.warn("[dev-api] cache warm-up failed:", err.message)
  );
});
