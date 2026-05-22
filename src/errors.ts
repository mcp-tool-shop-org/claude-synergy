/**
 * Structured error shape used throughout the CLI and MCP layers.
 *
 * Every user-visible error carries `code` (machine-parseable), `message`
 * (human-readable), `hint` (actionable next step), and optional `cause`
 * and `retryable` fields.
 */

export interface ErrorShape {
  code: string;
  message: string;
  hint: string;
  cause?: string;
  retryable?: boolean;
}

export class AppError extends Error implements ErrorShape {
  readonly code: string;
  readonly hint: string;
  readonly cause?: string;
  readonly retryable: boolean;

  constructor(opts: {
    code: string;
    message: string;
    hint: string;
    cause?: string;
    retryable?: boolean;
  }) {
    super(opts.message);
    this.name = 'AppError';
    this.code = opts.code;
    this.hint = opts.hint;
    this.cause = opts.cause;
    this.retryable = opts.retryable ?? false;
  }

  /** Return the structured JSON shape (useful for --json output and MCP results). */
  toJSON(): ErrorShape {
    return {
      code: this.code,
      message: this.message,
      hint: this.hint,
      ...(this.cause ? { cause: this.cause } : {}),
      ...(this.retryable ? { retryable: this.retryable } : {}),
    };
  }
}

/**
 * Format an error for human-readable CLI output.
 * Shows code + message + hint. Shows cause only in verbose/debug mode.
 */
export function formatError(err: unknown, verbose = false): string {
  if (err instanceof AppError) {
    const lines = [`✗ [${err.code}] ${err.message}`];
    lines.push(`  hint: ${err.hint}`);
    if (verbose && err.cause) {
      lines.push(`  cause: ${err.cause}`);
    }
    return lines.join('\n');
  }
  if (err instanceof Error) {
    return `✗ ${err.message}`;
  }
  return `✗ ${String(err)}`;
}
