import type { Buffer } from 'node:buffer';

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

/** One named Weixin file retains the upstream decryptor and an explicit download limit. */
export interface WeixinFileSource {
  name: string;
  load(options: { signal: AbortSignal; maxBytes: number }): Promise<Uint8Array>;
}
export function extractBoundedWeixinFiles(message: { item_list: Array<{ file_item: Record<string, unknown> }> },
  options?: { fetchImpl?: typeof fetch }): WeixinFileSource[];
/** Send a Host-authorized byte snapshot to the current Weixin recipient. */
export interface WeixinMediaSendRequest {
  baseUrl: string;
  token: string;
  toUserId: string;
  contextToken: string;
  file: { fileName: string; bytes: Buffer; deliveryKey: string };
  signal: AbortSignal;
}
export function createWeixinMediaSender(options?: { fetchImpl?: typeof fetch; uploadFetchImpl?: typeof fetch }): {
  sendFile(request: WeixinMediaSendRequest): Promise<{ messageId: string }>;
  sendImage(request: WeixinMediaSendRequest): Promise<{ messageId: string }>;
};
