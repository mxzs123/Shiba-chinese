import { Buffer } from "node:buffer";

export interface TemporaryUpload {
  id: string;
  name: string;
  size: number;
  contentType: string;
  url: string;
  uploadedAt: string;
}

const temporaryUploads = new Map<string, TemporaryUpload>();

function toDataUrl(file: File, buffer: Buffer) {
  const contentType = file.type || "application/octet-stream";
  const base64 = buffer.toString("base64");
  return `data:${contentType};base64,${base64}`;
}

export async function createTemporaryUpload(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const record: TemporaryUpload = {
    id: `tmp-${crypto.randomUUID()}`,
    name: file.name,
    size: file.size,
    contentType: file.type || "application/octet-stream",
    url: toDataUrl(file, buffer),
    uploadedAt: new Date().toISOString(),
  };

  temporaryUploads.set(record.id, record);
  return { ...record };
}

export function takeTemporaryUploads(ids: string[]) {
  const results: TemporaryUpload[] = [];

  ids.forEach((id) => {
    const record = temporaryUploads.get(id);
    if (!record) {
      return;
    }

    temporaryUploads.delete(id);
    results.push({ ...record });
  });

  return results;
}

export function deleteTemporaryUpload(id: string) {
  return temporaryUploads.delete(id);
}

export function getTemporaryUpload(id: string) {
  const record = temporaryUploads.get(id);
  return record ? { ...record } : undefined;
}
