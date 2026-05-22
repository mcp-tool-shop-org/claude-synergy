import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_SERVER = resolve(__dirname, '..', '..', 'src', 'mcp-server.ts');

export interface Tool {
  name: string;
  description: string;
  inputSchema: { type: string; properties?: Record<string, unknown>; required?: string[] };
}

export interface CallToolResult {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

export interface InitializeResult {
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  serverInfo: { name: string; version: string };
}

export interface McpClient {
  initialize(): Promise<InitializeResult>;
  notifyInitialized(): Promise<void>;
  listTools(): Promise<Tool[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult>;
  /** Raw JSON-RPC request; throws if response.error is set. */
  request<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T>;
  /** Process exit code (after close); null if still running. */
  exitCode(): number | null;
  close(): Promise<void>;
}

interface PendingResolver {
  resolve: (value: any) => void;
  reject: (err: Error) => void;
}

export interface McpServerOpts {
  dbPath: string;
  synergiesDir?: string;
  /** Additional env to merge. */
  env?: Record<string, string>;
  /** Timeout for an individual request, ms. */
  requestTimeoutMs?: number;
}

/**
 * Spawn the MCP server as a subprocess and return a typed JSON-RPC client.
 * Always pair with await client.close() in a finally — see withMcpServer for the safer variant.
 */
export async function startMcpClient(opts: McpServerOpts): Promise<McpClient> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    CLAUDE_SYNERGY_DB: opts.dbPath,
    ...(opts.synergiesDir ? { CLAUDE_SYNERGY_SYNERGIES_DIR: opts.synergiesDir } : {}),
    ...(opts.env ?? {}),
  };

  const child: ChildProcessWithoutNullStreams = spawn(
    'npx',
    ['tsx', MCP_SERVER],
    {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    }
  );

  let nextId = 1;
  const pending = new Map<number, PendingResolver>();
  const requestTimeoutMs = opts.requestTimeoutMs ?? 15_000;

  // Read line-delimited JSON from stdout
  let buf = '';
  child.stdout.setEncoding('utf-8');
  child.stdout.on('data', (chunk: string) => {
    buf += chunk;
    let idx: number;
    while ((idx = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line) continue;
      let msg: any;
      try {
        msg = JSON.parse(line);
      } catch {
        // Non-JSON line — log to stderr but don't fail the suite
        continue;
      }
      if (msg.id != null && pending.has(msg.id)) {
        const p = pending.get(msg.id)!;
        pending.delete(msg.id);
        if (msg.error) {
          const err = new Error(msg.error.message || 'mcp error');
          (err as any).code = msg.error.code;
          (err as any).data = msg.error.data;
          p.reject(err);
        } else {
          p.resolve(msg.result);
        }
      }
    }
  });

  // Surface stderr only if a test asks; otherwise swallow to keep the suite quiet.
  // (the server logs "claude-synergy-mcp ready" + db lookup warnings here)
  child.stderr.setEncoding('utf-8');
  child.stderr.on('data', () => {});

  let exitCode: number | null = null;
  child.on('exit', (code) => {
    exitCode = code;
    for (const [, p] of pending) {
      p.reject(new Error(`mcp server exited (code=${code}) with pending requests`));
    }
    pending.clear();
  });

  // Wait briefly for the server to be ready. We don't need to block on the
  // "ready" stderr line because the first `initialize` request will queue and
  // be processed once stdio is hooked up.

  function request<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const id = nextId++;
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`mcp request timed out (${method}, ${requestTimeoutMs}ms)`));
      }, requestTimeoutMs);
      const wrappedResolve = (v: any) => {
        clearTimeout(timer);
        resolve(v as T);
      };
      const wrappedReject = (e: Error) => {
        clearTimeout(timer);
        reject(e);
      };
      pending.set(id, { resolve: wrappedResolve, reject: wrappedReject });
      child.stdin.write(payload, (err) => {
        if (err) {
          clearTimeout(timer);
          pending.delete(id);
          reject(err);
        }
      });
    });
  }

  function notify(method: string, params: Record<string, unknown> = {}): Promise<void> {
    const payload = JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n';
    return new Promise<void>((resolve, reject) => {
      child.stdin.write(payload, (err) => (err ? reject(err) : resolve()));
    });
  }

  const client: McpClient = {
    async initialize() {
      return request<InitializeResult>('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'claude-synergy-test', version: '0.0.0' },
      });
    },
    async notifyInitialized() {
      await notify('notifications/initialized');
    },
    async listTools() {
      const res = (await request('tools/list')) as { tools: Tool[] };
      return res.tools;
    },
    async callTool(name, args) {
      return request<CallToolResult>('tools/call', { name, arguments: args });
    },
    request,
    exitCode: () => exitCode,
    async close() {
      // Reject any in-flight first so the cleanup never hangs
      for (const [, p] of pending) p.reject(new Error('client closed'));
      pending.clear();
      if (exitCode === null) {
        try {
          child.stdin.end();
        } catch {
          // already closed
        }
        await new Promise<void>((resolveExit) => {
          const t = setTimeout(() => {
            try {
              child.kill('SIGKILL');
            } catch {
              // already dead
            }
            resolveExit();
          }, 1500);
          child.once('exit', () => {
            clearTimeout(t);
            resolveExit();
          });
        });
      }
    },
  };

  return client;
}

/**
 * Spawn server, run fn(client), ALWAYS close — the recommended entry point.
 * `fn` should not call client.close() itself.
 */
export async function withMcpServer<T>(
  opts: McpServerOpts,
  fn: (client: McpClient) => Promise<T>
): Promise<T> {
  const client = await startMcpClient(opts);
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}
