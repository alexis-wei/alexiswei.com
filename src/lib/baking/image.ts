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
 * Turns a cut-out (PNG, or an iPhone "Copy Subject"/background-removed image)
 * into a square icon: trims the empty transparent edges, then centres the
 * subject with even padding so every ingredient tile lines up.
 */
export function toSquareIcon(file: Blob, size = 512): Promise<PreparedImage> {
  return withImage(file, async (img) => {
    const box = opaqueBounds(img);
    const padding = size * 0.08;
    const scale = (size - padding * 2) / Math.max(box.w, box.h);
    const w = box.w * scale;
    const h = box.h * scale;
    const [el, ctx] = canvas(size, size);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      img,
      box.x,
      box.y,
      box.w,
      box.h,
      (size - w) / 2,
      (size - h) / 2,
      w,
      h,
    );
    return { blob: await encode(el, true), width: size, height: size };
  });
}

/**
 * Shrinks large photos (iPhone photos are often 4000px+) before upload. If the
 * browser can't decode the file, the original is uploaded untouched.
 */
export async function preparePhoto(
  file: File,
  maxSide = 2400,
): Promise<PreparedImage> {
  try {
    return await withImage(file, async (img) => {
      const { naturalWidth: nw, naturalHeight: nh } = img;
      const scale = Math.min(1, maxSide / Math.max(nw, nh));
      const small = scale === 1 && file.size < 1.5 * 1024 * 1024;
      if (small && /^image\/(jpeg|webp)$/.test(file.type)) {
        return { blob: file, width: nw, height: nh };
      }
      const w = Math.round(nw * scale);
      const h = Math.round(nh * scale);
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
