import { AwsClient } from "aws4fetch";

// Media files live in Cloudflare R2. The browser uploads straight to R2 with a
// short-lived presigned URL, so large videos never pass through Vercel (whose
// request bodies are capped at 4.5 MB). Without R2 credentials in development,
// uploads go to a local API route instead.

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_URL,
} = process.env;

const r2Configured = Boolean(
  R2_ACCOUNT_ID &&
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  R2_BUCKET &&
  R2_PUBLIC_URL,
);

export const storesLocally =
  !r2Configured && process.env.NODE_ENV !== "production";

const LOCAL_ROUTE = "/api/baking/local";

let r2: AwsClient | undefined;

function client() {
  r2 ??= new AwsClient({
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: "auto",
  });
  return r2;
}

function objectUrl(key: string) {
  return `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`;
}

export function publicUrl(key: string) {
  if (!r2Configured) return `${LOCAL_ROUTE}/${key}`;
  return `${R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
}

export async function presignUpload(key: string) {
  if (storesLocally) return `${LOCAL_ROUTE}/${key}`;
  if (!r2Configured) throw new Error("R2 is not configured");
  const signed = await client().sign(
    new Request(`${objectUrl(key)}?X-Amz-Expires=900`, { method: "PUT" }),
    { aws: { signQuery: true } },
  );
  return signed.url;
}

export async function deleteObjects(keys: string[]) {
  if (!r2Configured || keys.length === 0) return;
  await Promise.all(
    keys.map((key) => client().fetch(objectUrl(key), { method: "DELETE" })),
  );
}

const EXTENSIONS: Record<string, string> = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export function extensionFor(contentType: string, filename?: string) {
  const fromName = filename?.split(".").pop()?.toLowerCase();
  return (
    EXTENSIONS[contentType] ??
    (fromName && /^[a-z0-9]{1,5}$/.test(fromName) ? fromName : "bin")
  );
}
