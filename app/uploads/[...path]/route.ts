import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { contentTypeForFilename, uploadsDir } from "@/lib/uploads";

/**
 * Liefert hochgeladene Dateien zur Laufzeit aus. Notwendig, weil Next.js in
 * Production aus `public/` nur Build-Zeit-Dateien serviert — zur Laufzeit
 * geschriebene Uploads wuerden sonst 404 liefern.
 *
 * Dynamische Route-Handler bekommen von Next.js `Cache-Control: max-age=0`;
 * darum effizientes Revalidieren ueber ETag/If-None-Match (304 statt Re-Download).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const dir = uploadsDir();
  const target = path.resolve(dir, ...segments);

  // Directory-Traversal verhindern: Ziel muss innerhalb von `dir` liegen.
  const rel = path.relative(dir, target);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return new Response("Not found", { status: 404 });
  }

  let info;
  try {
    info = await stat(target);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!info.isFile()) return new Response("Not found", { status: 404 });

  const etag = `"${info.size}-${Math.floor(info.mtimeMs)}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  const data = await readFile(target);
  return new Response(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": contentTypeForFilename(target),
      "Last-Modified": new Date(info.mtimeMs).toUTCString(),
      ETag: etag,
    },
  });
}
