import assert from 'node:assert/strict';
import test from 'node:test';
import { createImHostPlugin } from '../lib/index.js';

test('published host bundle enforces the selected product channels', async () => {
  const started = [];
  const host = createImHostPlugin({
    createDeliveryService: () => ({}),
    installHostLanguage: () => undefined,
    installInjectedContext: () => {},
    applyWeixin: async () => { started.push('weixin'); },
    applyWecom: async () => { started.push('wecom'); },
  });
  await host.apply({ logger: { error() {} } }, { enabledChannels: ['weixin'] });
  assert.deepEqual(started, ['weixin']);
});
