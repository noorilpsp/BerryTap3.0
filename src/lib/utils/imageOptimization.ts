import imageCompression, { Options } from 'browser-image-compression'

/**
 * Optimizes an image file before upload
 * - Logos: Max 800px width, 85% quality
 * - Banners: Max 2000px width, 85% quality
 * - Converts to WebP format when possible
 * - Maintains aspect ratio
 */
export async function optimizeImage(
  file: File,
  type: 'logo' | 'banner',
): Promise<File> {
  const options: Options = {
    maxSizeMB: 1, // Max file size in MB (will compress to fit)
    maxWidthOrHeight: type === 'logo' ? 800 : 2000, // Max dimension
    useWebWorker: true, // Use web worker for better performance
    fileType: 'image/webp', // Convert to WebP for better compression
    initialQuality: 0.85, // 85% quality (good balance)
    alwaysKeepResolution: false, // Allow resizing
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error('[imageOptimization] Error compressing image:', error)
    // If compression fails, return original file
    // The upload will still work, just won't be optimized
    return file
  }
}

