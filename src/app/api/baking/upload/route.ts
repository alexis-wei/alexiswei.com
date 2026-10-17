import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isEditor } from "@/lib/baking/auth";
import { extensionFor, presignUpload } from "@/lib/baking/storage";
import type { UploadPurpose } from "@/lib/baking/types";

// Hands the browser a presigned URL so it can PUT the file straight to R2.
export async function POST(request: Request) {
  if (!(await isEditor())) {
    return NextResponse.json(
      { error: "Unlock editing first" },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    purpose?: UploadPurpose;
    logId?: string;
    contentType?: string;
    filename?: string;
  };
  const contentType = body.contentType ?? "";
  if (!/^(image|video)\/[\w.+-]+$/.test(contentType)) {
    return NextResponse.json(
      { error: "Only images and videos" },
      { status: 400 },
    );
  }

  const name = `${randomUUID()}.${extensionFor(contentType, body.filename)}`;
  let key: string;
  if (body.purpose === "ingredient") {
    key = `baking/ingredients/${name}`;
  } else if (body.purpose === "media" && /^[\w-]+$/.test(body.logId ?? "")) {
    key = `baking/media/${body.logId}/${name}`;
  } else {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  return NextResponse.json({ key, uploadUrl: await presignUpload(key) });
}
