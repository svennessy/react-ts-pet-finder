import { apiDelete } from "./client";
import { supabase } from "../lib/supabase";

export async function uploadPetPhotos(files: File[]) {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const extension = file.name.split(".").pop() ?? "jpg";
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = `pet-reports/${fileName}`;

    const { error } = await supabase.storage
      .from("pet-photos")
      .upload(filePath, file);

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from("pet-photos")
      .getPublicUrl(filePath);

    uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
}

export async function deletePetPhoto(photoId: string | number) {
  return apiDelete(`/api/photos/${photoId}`);
}