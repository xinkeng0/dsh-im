/** One authenticated Weixin image is loaded lazily and bounded by the embedding Host. */
export interface WeixinImageSource {
  name: string;
  load(options: { signal: AbortSignal; maxBytes: number }): Promise<Uint8Array>;
}

/** Reuse the upstream Weixin CDN validation, bounded download and decryption. */
export function extractWeixinImages(message: { item_list: Array<{ image_item: Record<string, unknown> }> },
  options?: { fetchImpl?: typeof fetch }): WeixinImageSource[];

/** Recognize the exact byte signature accepted by the upstream image bridge. */
export function detectedImageMediaType(data: Uint8Array): 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' | null;
