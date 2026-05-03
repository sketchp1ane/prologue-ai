import "server-only";

import { createHash } from "node:crypto";

import { del, get, put } from "@vercel/blob";

import {
  RESUME_PDF_CONTENT_TYPE,
  RESUME_PDF_MAX_BYTES,
} from "@/src/lib/validations/resume";

export type StoredResumePdf = {
  contentLength: number;
  contentType: string;
  downloadUrl: string;
  pathname: string;
  url: string;
};

export type LoadedResumePdf = {
  base64: string;
  byteLength: number;
};

function storagePathSegment(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

export function buildResumePdfPath(params: {
  fileName: string;
  pathNonce?: string;
  resumeId: string;
  userId: string;
}) {
  const suffix = storagePathSegment(
    [params.fileName || "resume.pdf", params.pathNonce]
      .filter(Boolean)
      .join(":")
  );

  return `resumes/${storagePathSegment(params.userId)}/${params.resumeId}-${suffix}.pdf`;
}

export async function uploadPrivateResumePdf(params: {
  file: File;
  pathNonce?: string;
  resumeId: string;
  userId: string;
}): Promise<StoredResumePdf> {
  const pathname = buildResumePdfPath({
    fileName: params.file.name,
    pathNonce: params.pathNonce,
    resumeId: params.resumeId,
    userId: params.userId,
  });
  const blob = await put(pathname, params.file, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: RESUME_PDF_CONTENT_TYPE,
    multipart: params.file.size > 4 * 1024 * 1024,
  });

  return {
    contentLength: params.file.size,
    contentType: blob.contentType,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    url: blob.url,
  };
}

export async function readPrivateResumePdf(
  pathname: string
): Promise<LoadedResumePdf> {
  const result = await get(pathname, {
    access: "private",
    useCache: false,
  });

  if (!result?.stream) {
    throw new Error("Stored resume PDF could not be found.");
  }

  const contentType = result.blob.contentType;
  const size = result.blob.size;

  if (contentType && contentType !== RESUME_PDF_CONTENT_TYPE) {
    throw new Error("Stored resume file is not a PDF.");
  }

  if (typeof size === "number" && size > RESUME_PDF_MAX_BYTES) {
    throw new Error("Stored resume PDF is too large.");
  }

  const arrayBuffer = await new Response(result.stream).arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.byteLength > RESUME_PDF_MAX_BYTES) {
    throw new Error("Stored resume PDF is too large.");
  }

  return {
    base64: buffer.toString("base64"),
    byteLength: buffer.byteLength,
  };
}

export async function deletePrivateResumePdf(pathname: string) {
  await del(pathname);
}
