/** Public media primitives for Hosts embedding the existing Weixin channel. */
import { extractWeixinFiles, extractWeixinImages } from '../channels/weixin/weixin-api.mjs';
import { detectedImageMediaType, fetchImageBuffer } from '../channels/shared/image-prompt.mjs';

export { extractWeixinImages, detectedImageMediaType };

/** Bound the upstream file loader with the same validated CDN stream used for images. */
export function extractBoundedWeixinFiles(message, { fetchImpl = fetch } = {}) {
  return message.item_list.map(({ file_item }) => {
    if (!file_item || typeof file_item !== 'object' || typeof file_item.file_name !== 'string' || !file_item.file_name.trim()) {
      throw new TypeError('A Weixin file requires its original filename');
    }
    return {
      name: file_item.file_name,
      async load({ signal, maxBytes }) {
        if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new RangeError('A positive file byte limit is required');
        const [source] = extractWeixinFiles({ item_list: [{ file_item }] }, {
          fetchImpl: async (url, init) => new Response(await fetchImageBuffer(url, {
            fetchImpl, signal: init.signal, maxBytes: maxBytes + 16, allowedHosts: ['novac2c.cdn.weixin.qq.com'],
          })),
        });
        const bytes = await source.load({ signal });
        if (bytes.length > maxBytes) throw new RangeError('Weixin file exceeds the byte limit');
        return bytes;
      },
    };
  });
}
