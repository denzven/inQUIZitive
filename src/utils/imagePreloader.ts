/**
 * Image Preloader Utility.
 * Preloads HTTP/HTTPS image URLs and Base64 Data URLs into browser memory before quiz rounds start.
 * Ensures zero lag, zero broken image blinks, and smooth offline performance during gameplay.
 */

/**
 * Preloads a single image URL or Data URL into browser cache memory.
 * Resolves true if loaded successfully, or false if failed/timed out.
 * 
 * @param src - Image URL string (http://, https://, or data:image/...).
 * @param timeoutMs - Maximum load wait duration before timing out (default: 6000ms).
 * @returns Promise<boolean>
 */
export const preloadSingleImage = (src?: string, timeoutMs = 6000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!src || typeof src !== 'string' || src.trim() === '') {
      resolve(true);
      return;
    }

    const cleanSrc = src.trim();

    // Already cached or Data URL loads almost instantly, but we still verify in Image element
    const img = new Image();
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        console.warn(`[ImagePreloader] Preload timed out: ${cleanSrc.substring(0, 60)}`);
        resolve(false); // Resolve false so broken URLs never block the app
      }
    }, timeoutMs);

    img.onload = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        console.warn(`[ImagePreloader] Failed to load image: ${cleanSrc.substring(0, 60)}`);
        resolve(false);
      }
    };

    img.src = cleanSrc;
  });
};

/**
 * Preloads an array of questions' images in parallel.
 * Provides real-time progress callbacks for loading overlays.
 * 
 * @param questions - Array of question objects containing optional image properties.
 * @param onProgress - Optional callback receiving (loadedCount, totalCount).
 * @returns Promise<void>
 */
export const preloadQuestionImages = async (
  questions: Array<{ image?: string }>,
  onProgress?: (loadedCount: number, totalCount: number) => void
): Promise<void> => {
  const imageUrls = questions
    .map(q => q.image)
    .filter((img): img is string => Boolean(img && typeof img === 'string' && img.trim() !== ''));

  if (imageUrls.length === 0) {
    if (onProgress) onProgress(0, 0);
    return;
  }

  let loadedCount = 0;
  const totalCount = imageUrls.length;

  const promises = imageUrls.map(async (url) => {
    await preloadSingleImage(url);
    loadedCount++;
    if (onProgress) onProgress(loadedCount, totalCount);
  });

  await Promise.all(promises);
};
