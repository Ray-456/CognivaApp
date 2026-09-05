export const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';
export const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UNSIGNED_PRESET_NAME';

export async function uploadImageToCloudinary(localUri: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', { uri: localUri, type: 'image/jpeg', name: 'upload.jpg' } as any);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }
  const data = await response.json();
  return data.secure_url as string;
}
