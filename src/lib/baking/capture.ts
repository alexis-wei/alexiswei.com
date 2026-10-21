// Reads when a photo or video was taken, before upload (resizing a photo
// strips its EXIF, so this has to run on the original file). The result is
// the phone's clock time at capture, "YYYY-MM-DDTHH:MM:SS", with no time zone:
// a photo taken at 2:05 pm should read 2:05 pm wherever it's viewed.

const pad = (n: number) => String(n).padStart(2, "0");

/** A Date's wall-clock time in this browser's time zone. */
const localStamp = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

/** EXIF dates look like "2026:10:17 14:05:03". */
export function fromExif(value: unknown) {
  const match = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(
    String(value ?? ""),
  );
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  return y === "0000" ? null : `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

async function photoTakenAt(file: Blob) {
  const exifr = await import("exifr");
  const tags = await exifr.parse(file, {
    pick: ["DateTimeOriginal", "CreateDate"],
    reviveValues: false,
  });
  return fromExif(tags?.DateTimeOriginal) ?? fromExif(tags?.CreateDate);
}

async function videoTakenAt(file: Blob) {
  const mb = await import("mediabunny");
  const input = new mb.Input({
    source: new mb.BlobSource(file),
    formats: mb.ALL_FORMATS,
  });
  try {
    const { date } = await input.getMetadataTags();
    // Containers store an absolute moment; show it in the phone's local time.
    return date && !Number.isNaN(date.getTime()) ? localStamp(date) : null;
  } finally {
    input.dispose();
  }
}

/** When the photo/video was taken, or null if the file doesn't say. */
export async function takenAt(file: File, kind: "image" | "video") {
  try {
    return await (kind === "image" ? photoTakenAt(file) : videoTakenAt(file));
  } catch {
    return null;
  }
}
