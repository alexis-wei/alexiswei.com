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
    recipeId?: string;
    contentType?: string;
    filename?: string;
  };
  const contentType = body.contentType ?? "";
  // Recipes may also be PDFs (scanned or saved pages).
  const allowed =
    body.purpose === "recipe"
      ? /^(image\/[\w.+-]+|application\/pdf)$/
      : /^(image|video)\/[\w.+-]+$/;
  if (!allowed.test(contentType)) {
    return NextResponse.json(
      { error: "That file type isn't supported" },
      { status: 400 },
    );
  }

  const name = `${randomUUID()}.${extensionFor(contentType, body.filename)}`;
  const logId = /^[\w-]+$/.test(body.logId ?? "") ? body.logId : null;
  const recipeId = /^[\w-]+$/.test(body.recipeId ?? "") ? body.recipeId : null;
  let key: string;
  if (body.purpose === "ingredient") {
    key = `baking/ingredients/${name}`;
  } else if (body.purpose === "media" && logId) {
    key = `baking/media/${logId}/${name}`;
  } else if (body.purpose === "recipe" && recipeId) {
    key = `baking/recipes/${recipeId}/${name}`;
  } else {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  return NextResponse.json({ key, uploadUrl: await presignUpload(key) });
}
