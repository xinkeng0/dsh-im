import assert from 'node:assert/strict';
import { createCipheriv } from 'node:crypto';
import test from 'node:test';
import { createWeixinMediaSender, detectedImageMediaType, extractBoundedWeixinFiles, extractWeixinImages } from '@xmanrui/dsh-im/weixin-media';

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

test('embedding Hosts reuse Weixin file decryption with explicit bounded downloads', async () => {
  const key = Buffer.alloc(16, 7);
  const file = Buffer.from('a file that is not an image');
  const cipher = createCipheriv('aes-128-ecb', key, null);
  const encrypted = Buffer.concat([cipher.update(file), cipher.final()]);
  const message = { item_list: [{ file_item: { file_name: '说明.txt', aeskey: key.toString('hex'), media: { encrypt_query_param: 'file' } } }] };
  const fetchImpl = async () => new Response(encrypted);
  const [source] = extractBoundedWeixinFiles(message, { fetchImpl });
  assert.equal(source.name, '说明.txt');
  assert.deepEqual(await source.load({ signal: new AbortController().signal, maxBytes: 32 }), file);
  await assert.rejects(() => source.load({ signal: new AbortController().signal, maxBytes: 3 }));
  assert.throws(() => extractBoundedWeixinFiles({ item_list: [{ file_item: {} }] }), /filename/);
});

test('embedding Hosts can send a native file using the upstream encrypted CDN flow', async () => {
  const sent = [];
  const fetchImpl = async (url, init) => {
    const path = new URL(url).pathname;
    if (path.endsWith('/getuploadurl')) return Response.json({ ret: 0, upload_full_url: 'https://novac2c.cdn.weixin.qq.com/c2c/upload?ticket=one' });
    if (path === '/c2c/upload') {
      const chunks = []; for await (const chunk of init.body) chunks.push(chunk);
      assert.ok(Buffer.concat(chunks).length > 0);
      return new Response(null, { status: 200, headers: { 'x-encrypted-param': 'download-ticket' } });
    }
    if (path.endsWith('/sendmessage')) { sent.push(JSON.parse(init.body).msg); return Response.json({ ret: 0 }); }
    throw new Error('Unexpected Weixin endpoint');
  };
  const sender = createWeixinMediaSender({ fetchImpl });
  await sender.sendFile({ baseUrl: 'https://ilinkai.weixin.qq.com', token: 'test-token', toUserId: 'owner', contextToken: 'context',
    file: { fileName: 'result.txt', bytes: Buffer.from('file result'), deliveryKey: 'task-file' }, signal: new AbortController().signal });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to_user_id, 'owner');
  assert.equal(sent[0].context_token, 'context');
  assert.equal(sent[0].item_list[0].type, 4);
  assert.equal(sent[0].item_list[0].file_item.file_name, 'result.txt');
});
