// Browser-side video compression, run before uploading. Phone videos are often
// 4K HEVC at 40+ Mbps; this re-encodes them to ≤1080p H.264 MP4 using the
// device's hardware encoder (WebCodecs). mediabunny is loaded only when a video
// is added, so it doesn't weigh down the pages.

import { fit1080, videoSize, type PreparedImage } from "./image";

// Below this, a ≤1080p MP4 is already small enough to upload as-is.
const MAX_BITRATE = 8_000_000;

export async function compressVideo(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<PreparedImage> {
  const original = async () => ({ blob: file, ...(await videoSize(file)) });
  const mb = await import("mediabunny").catch(() => null);
  if (!mb) return original();

  const input = new mb.Input({
    source: new mb.BlobSource(file),
    formats: mb.ALL_FORMATS,
  });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) return original();
    const source = { width: track.displayWidth, height: track.displayHeight };
    const target = fit1080(source.width, source.height);
    const duration = await input.computeDuration();
    const bitrate = duration > 0 ? (file.size * 8) / duration : Infinity;
    if (
      target.scale === 1 &&
      bitrate <= MAX_BITRATE &&
      file.type === "video/mp4"
    ) {
      return { blob: file, ...source };
    }

    const output = new mb.Output({
      format: new mb.Mp4OutputFormat({ fastStart: "in-memory" }),
      target: new mb.BufferTarget(),
    });
    const conversion = await mb.Conversion.init({
      input,
      output,
      tracks: "primary",
      video: {
        width: target.width,
        height: target.height,
        fit: "fill",
        codec: "avc",
        quality: mb.QUALITY_HIGH,
      },
      // Audio isn't configured, so it's copied as-is when possible (iPhone
      // audio is already AAC) rather than re-encoded.
      showWarnings: false,
    });
    // Never trade away the sound: if any audio would be dropped, keep the original.
    const losesAudio = conversion.discardedTracks.some(
      (d) => d.track.isAudioTrack() && d.reason !== "discarded_by_user",
    );
    if (!conversion.isValid || losesAudio) return original();

    conversion.onProgress = (progress) => onProgress?.(progress);
    await conversion.execute();
    const buffer = output.target.buffer;
    if (!buffer || buffer.byteLength >= file.size) return original();
    return {
      blob: new Blob([buffer], { type: "video/mp4" }),
      width: target.width,
      height: target.height,
    };
  } catch {
    return original();
  } finally {
    input.dispose();
  }
}
