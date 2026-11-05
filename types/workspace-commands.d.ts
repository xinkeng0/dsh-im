/** Session facts supplied by an embedding Host for workspace commands. */
export interface WorkspaceCommandSession {
  sessionId: string;
  title?: string;
  summaryAvailable?: boolean;
  archived?: boolean;
  time?: number;
}

/** The embedding Host owns workspace isolation, session selection and persistence. */
export interface WorkspaceCommandHarness {
  currentWorkspace(): string;
  listWorkspaceSessions(workspace: string): Promise<{ workspace: string; sessions: WorkspaceCommandSession[] }>;
  bindWorkspaceSession(conversationKey: string, sessionId: string): Promise<WorkspaceCommandSession & { workspace: string }>;
  assertWorkspaceScope(): void;
}

/** Command results are presentation text; execution and authorization remain with the Host. */
export interface WorkspaceCommandResult {
  handled?: boolean;
  message: string;
  messages: string[];
}

/** Execute an IM workspace/session command against the supplied Host adapter. */
export function runWorkspaceCommand(text: string, harness: WorkspaceCommandHarness, conversationKey: string,
  options?: { includeHistoryHint?: boolean }): Promise<WorkspaceCommandResult | null>;
