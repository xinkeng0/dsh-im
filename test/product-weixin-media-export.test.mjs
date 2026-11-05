import assert from 'node:assert/strict';
import { createCipheriv } from 'node:crypto';
import test from 'node:test';
import { detectedImageMediaType, extractWeixinImages } from '@xmanrui/dsh-im/weixin-media';

test('embedding Hosts reuse Weixin CDN validation, bounded download, decryption and image type detection', async () => {
  const key = Buffer.alloc(16, 7);
  const image = Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), Buffer.alloc(16)]);
  const cipher = createCipheriv('aes-128-ecb', key, null);
  const encrypted = Buffer.concat([cipher.update(image), cipher.final()]);
  const message = { item_list: [{ image_item: { aeskey: key.toString('hex'), media: { encrypt_query_param: 'fixture' } } }] };
  const urls = [];
  const sources = extractWeixinImages(message, { fetchImpl: async url => { urls.push(String(url)); return new Response(encrypted); } });
  const bytes = await sources[0].load({ signal: new AbortController().signal, maxBytes: 32 });
  assert.deepEqual(bytes, image);
  assert.match(urls[0], /^https:\/\/novac2c\.cdn\.weixin\.qq\.com\/c2c\//);
  assert.equal(detectedImageMediaType(bytes), 'image/png');
  await assert.rejects(() => sources[0].load({ signal: new AbortController().signal, maxBytes: 1 }));
});
