// The backend caps uploads at 16 megapixels and every operation internally
// works at 384-768px anyway (see canvas_size in generate_style/furnish_room),
// so a full-resolution phone photo (commonly 20-50+ megapixels) never buys
// any real quality — it just risks tripping that cap with a generic
// "Invalid image" error. Downscale client-side before upload so that never
// happens, and uploads are smaller/faster on top of it.
const MAX_DIMENSION = 2400;

// Neither threshold claims to know "is this actually a room photo" (that needs
// a real model, only available on the Colab/Kaggle GPU side) -- these are cheap
// client-side sanity checks so a genuinely unusable upload (a thumbnail, a photo
// taken in near-darkness) gets flagged instead of silently producing a bad
// generation with no explanation.
const MIN_DIMENSION = 200; // below this even the backend's own downscaling has nothing to work with
const DARK_LUMINANCE_THRESHOLD = 40; // 0-255 average; a normally-lit photo sits well above this

// A tiny canvas is enough for a rough average -- this is a sanity check, not a
// precise measurement, so there's no reason to sample the full-resolution image.
function averageLuminance(img) {
  const SAMPLE = 48;
  const canvas = document.createElement('canvas');
  canvas.width = SAMPLE;
  canvas.height = SAMPLE;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
  const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  return sum / (data.length / 4);
}

function assessQuality(img) {
  const { width, height } = img;
  if (Math.min(width, height) < MIN_DIMENSION) return 'This image is very low-resolution — results may look blurry or low quality.';
  try {
    if (averageLuminance(img) < DARK_LUMINANCE_THRESHOLD) return 'This photo looks quite dark — a brighter photo usually gives better results.';
  } catch { /* sampling failed (unusual format/tainted canvas) -- not worth blocking the upload over */ }
  return null;
}

// Resolves { file, warning } -- warning is a non-blocking hint (or null), never a
// reason to reject the upload: a heuristic false positive shouldn't stop someone
// from using a photo that's actually fine.
export function downscaleImage(file, maxDimension = MAX_DIMENSION) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      const warning = assessQuality(img);
      if (Math.max(width, height) <= maxDimension) {
        resolve({ file, warning }); // already small enough, no re-encoding needed
        return;
      }
      const scale = maxDimension / Math.max(width, height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Could not process this image')); return; }
          resolve({ file: new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }), warning });
        },
        'image/jpeg',
        0.92
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this image file')); };
    img.src = url;
  });
}
