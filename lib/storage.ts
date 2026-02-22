type StorageConfig = { baseUrl: string; apiKey: string };

function getStorageConfig(): StorageConfig {
  const baseUrl = process.env.BUILT_IN_FORGE_API_URL ?? "";
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY ?? "";
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

function toFormData(data: Buffer | Uint8Array | string, contentType: string, fileName: string): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });

  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Storage upload failed (${response.status} ${response.statusText}): ${message}`);
  }

  const payload = (await response.json()) as { url: string };
  return { key, url: payload.url };
}

export async function uploadFiles(
  files: { buffer: Buffer; originalname: string; mimetype: string }[],
  folder: string
): Promise<{ url: string; fileKey: string; filename: string; mimeType: string; fileSize: number }[]> {
  const uploads: { url: string; fileKey: string; filename: string; mimeType: string; fileSize: number }[] = [];

  for (const file of files) {
    const timestamp = Date.now();
    const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const relKey = `${folder}/${timestamp}-${safeFileName}`;

    const result = await storagePut(relKey, file.buffer, file.mimetype);
    uploads.push({
      url: result.url,
      fileKey: result.key,
      filename: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.buffer.byteLength,
    });
  }

  return uploads;
}
