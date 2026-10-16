import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isEditor } from "@/lib/baking/auth";
import { LOCAL_DIR } from "@/lib/baking/db";
import { storesLocally } from "@/lib/baking/storage";

// Development-only stand-in for R2, used when R2 credentials aren't set.

const TYPES: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  heic: "image/heic",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

type Context = { params: Promise<{ key: string[] }> };

async function resolve({ params }: Context) {
  if (!storesLocally) return null;
  const { key } = await params;
  if (key.some((part) => !/^[\w.-]+$/.test(part) || part.startsWith("."))) {
    return null;
  }
  return path.join(LOCAL_DIR, "uploads", ...key);
}

export async function PUT(request: Request, context: Context) {
  const file = await resolve(context);
  if (!file) return new Response("Not found", { status: 404 });
  if (!(await isEditor())) return new Response("Unauthorized", { status: 401 });
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(await request.arrayBuffer()));
  return new Response(null, { status: 200 });
}

export async function GET(request: Request, context: Context) {
  const file = await resolve(context);
  if (!file) return new Response("Not found", { status: 404 });
  let data: Buffer;
  try {
    data = await readFile(file);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const ext = path.extname(file).slice(1).toLowerCase();
  const headers = {
    "Content-Type": TYPES[ext] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
  };

  // Safari won't play video without byte-range support.
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (range) {
    const start = range[1] ? Number(range[1]) : data.length - Number(range[2]);
    const end = range[1] && range[2] ? Number(range[2]) : data.length - 1;
    return new Response(new Uint8Array(data.subarray(start, end + 1)), {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${data.length}`,
      },
    });
  }
  return new Response(new Uint8Array(data), { headers });
}
