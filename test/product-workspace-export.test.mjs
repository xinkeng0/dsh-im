import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { runWorkspaceCommand } from '@xmanrui/dsh-im/workspace-commands';

test('public workspace-command export uses the embedding Host for listing and binding', async t => {
  const workspace = await mkdtemp(join(tmpdir(), 'dsh-im-product-workspace-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const bindings = [];
  const harness = {
    currentWorkspace: () => workspace,
    async listWorkspaceSessions() { return { workspace, sessions: [{ sessionId: 'session-one', title: '工作事项' }] }; },
    async bindWorkspaceSession(key, sessionId) {
      bindings.push([key, sessionId]);
      return { workspace, sessionId, title: '工作事项', archived: false };
    },
    assertWorkspaceScope() {},
  };
  assert.match((await runWorkspaceCommand('/sessions', harness, 'owner-chat')).message, /工作事项/);
  assert.match((await runWorkspaceCommand('/session 1', harness, 'owner-chat')).message, /session-one/);
  assert.deepEqual(bindings, [['owner-chat', 'session-one']]);
  const embedded = await runWorkspaceCommand('/session 1', harness, 'owner-chat', { includeHistoryHint: false });
  assert.doesNotMatch(embedded.message, /\/history/);
  harness.bindWorkspaceSession = async () => { throw Object.assign(new Error('format'), { code: 'session-format-unsupported' }); };
  assert.match((await runWorkspaceCommand('/session session-one', harness, 'owner-chat')).message, /格式尚不支持/);
});
