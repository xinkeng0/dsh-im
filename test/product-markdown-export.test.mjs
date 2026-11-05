import assert from 'node:assert/strict';
import test from 'node:test';
import { chunkMarkdownText } from '@xmanrui/dsh-im/markdown-chunks';

test('product export keeps short replies and splits long code and tables within the requested bound', () => {
  assert.deepEqual(chunkMarkdownText('简短 **回复**', 1800), ['简短 **回复**']);
  const code = `\`\`\`js\n${'🎬'.repeat(2000)}\n\`\`\``;
  const codeChunks = chunkMarkdownText(code, 1800);
  assert.ok(codeChunks.length > 1);
  for (const chunk of codeChunks) {
    assert.ok(chunk.length <= 1800);
    assert.match(chunk, /^\`\`\`js\n/);
    assert.match(chunk, /\n\`\`\`$/);
    assert.doesNotMatch(chunk, /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u);
  }
  const table = ['| 名称 | 数量 |', '| --- | --- |', ...Array.from({ length: 200 }, (_, i) => `| 项目${i} | ${i} |`)].join('\n');
  const tableChunks = chunkMarkdownText(table, 1800);
  assert.ok(tableChunks.length > 1);
  for (const chunk of tableChunks) {
    assert.ok(chunk.length <= 1800);
    assert.ok(chunk.startsWith('| 名称 | 数量 |\n| --- | --- |'));
  }
});
