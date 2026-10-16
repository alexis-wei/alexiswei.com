// Browser-side image prep, run before uploading.

export type PreparedImage = {
  blob: Blob;
  width: number | null;
  height: number | null;
};

async function withImage<T>(
  file: Blob,
  draw: (img: HTMLImageElement) => Promise<T>,
): Promise<T> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return await draw(img);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvas(width: number, height: number) {
  const el = document.createElement("canvas");
  el.width = width;
  el.height = height;
  return [el, el.getContext("2d")!] as const;
}

const toBlob = (el: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) =>
    el.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      type,
      quality,
    ),
  );

/**
 * Encodes as WebP, keeping transparency. Older Safari can't encode WebP and
 * silently returns PNG instead; for opaque photos fall back to JPEG, which is
 * far smaller than PNG.
 */
async function encode(el: HTMLCanvasElement, transparent: boolean) {
  const webp = await toBlob(el, "image/webp", 0.86);
  if (webp.type === "image/webp" || transparent) return webp;
  return toBlob(el, "image/jpeg", 0.86);
}

/** Bounding box of the non-transparent pixels (the whole image if opaque). */
function opaqueBounds(img: HTMLImageElement) {
  const scan = Math.min(1, 768 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scan));
  const h = Math.max(1, Math.round(img.naturalHeight * scan));
  const [, ctx] = canvas(w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) {
    return { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
  }
  return {
    x: minX / scan,
    y: minY / scan,
    w: (maxX - minX + 1) / scan,
    h: (maxY - minY + 1) / scan,
  };
}

/**
 * Where an image sits inside the square icon, in units of the square's side
 * (so the same crop works at any on-screen size and at the 720px output):
 * the image's top-left corner is at (x, y), and each image pixel spans
 * `scale` square-widths.
 */
export type Crop = { x: number; y: number; scale: number };

export type CropSource = {
  img: HTMLImageElement;
  url: string; // object URL for display; call release() when done
  auto: Crop;
  release: () => void;
};

/** Scale at which the whole image fits inside the square. */
export const containScale = (img: HTMLImageElement) =>
  1 / Math.max(img.naturalWidth, img.naturalHeight);

/**
 * Loads an image for cropping. The suggested starting crop trims empty
 * transparent edges (cut-outs, iPhone "Copy Subject") and centres the subject
 * with 8% padding, so most PNGs need no adjusting.
 */
export async function openForCrop(file: Blob): Promise<CropSource> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
  const box = opaqueBounds(img);
  const scale = (1 - 2 * 0.08) / Math.max(box.w, box.h);
  return {
    img,
    url,
    auto: {
      scale,
      x: (1 - box.w * scale) / 2 - box.x * scale,
      y: (1 - box.h * scale) / 2 - box.y * scale,
    },
    release: () => URL.revokeObjectURL(url),
  };
}

/** Draws the cropped square icon (720×720 by default), keeping transparency. */
export async function renderCrop(
  img: HTMLImageElement,
  crop: Crop,
  size = 720,
): Promise<PreparedImage> {
  const [el, ctx] = canvas(size, size);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    crop.x * size,
    crop.y * size,
    img.naturalWidth * crop.scale * size,
    img.naturalHeight * crop.scale * size,
  );
  return { blob: await encode(el, true), width: size, height: size };
}

/**
 * Size that fits 1080p: short side at most 1080, long side at most 1920,
 * never upscaled. Rounded down to even numbers, which video encoders require.
 */
export function fit1080(width: number, height: number) {
  const scale = Math.min(
    1,
    1080 / Math.min(width, height),
    1920 / Math.max(width, height),
  );
  const even = (n: number) => Math.max(2, Math.floor((n * scale) / 2) * 2);
  return scale === 1
    ? { width, height, scale }
    : { width: even(width), height: even(height), scale };
}

/**
 * Shrinks photos to 1080p before upload (iPhone photos are 4032×3024). If the
 * browser can't decode the file, the original is uploaded untouched.
 */
export async function preparePhoto(file: File): Promise<PreparedImage> {
  try {
    return await withImage(file, async (img) => {
      const { naturalWidth: nw, naturalHeight: nh } = img;
      const { width: w, height: h, scale } = fit1080(nw, nh);
      const small = scale === 1 && file.size < 600 * 1024;
      if (small && /^image\/(jpeg|webp)$/.test(file.type)) {
        return { blob: file, width: nw, height: nh };
      }
      const [el, ctx] = canvas(w, h);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      return {
        blob: await encode(el, file.type === "image/png"),
        width: w,
        height: h,
      };
    });
  } catch {
    return { blob: file, width: null, height: null };
  }
}

export function videoSize(file: File) {
  return new Promise<{ width: number | null; height: number | null }>(
    (resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      const done = (width: number | null, height: number | null) => {
        URL.revokeObjectURL(url);
        resolve({ width, height });
      };
      video.preload = "metadata";
      video.onloadedmetadata = () => done(video.videoWidth, video.videoHeight);
      video.onerror = () => done(null, null);
      video.src = url;
    },
  );
}
