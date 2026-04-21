export async function uploadFile(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPresetName = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  //   const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPresetName);

  try {
    console.log("preset:", uploadPresetName);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();
    console.log(data);

    return { url: data.secure_url, publicId: data.public_id };
  } catch (error) {
    console.error("Cloudinary Upload error:", error);
  }
}
