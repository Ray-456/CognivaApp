const env = (process.env as Record<string, string | undefined>);

export const CLOUDINARY_CLOUD_NAME = env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
export const CLOUDINARY_UPLOAD_PRESET = env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';

export async function uploadImageToCloudinary(localUri: string): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Missing Cloudinary environment variables. Add EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env file.');
  }

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
