export async function deleteImage(publicId) {
  try {
    const res = await fetch("https://69e1050e001449874af8.fra.appwrite.run/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });

    return await res.json();
  } catch (err) {
    console.error("Delete error:", err);
  }
}
