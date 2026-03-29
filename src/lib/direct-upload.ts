const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function uploadFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 10MB");
  }

  const sigRes = await fetch("/api/admin/upload-params");
  if (!sigRes.ok) throw new Error("Failed to get upload credentials");
  const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", apiKey);
  formData.append("folder", folder);

  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!cloudRes.ok) {
    const err = await cloudRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Cloudinary upload failed");
  }

  const cloudData = await cloudRes.json();
  const cloudinaryUrl: string = cloudData.secure_url;

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${cloudData.public_id.replace("zayelle/", "")}.${ext}`;

  await fetch("/api/admin/register-media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cloudinaryUrl,
      filename,
      size: file.size,
      mimeType: file.type,
    }),
  });

  return cloudinaryUrl;
}
