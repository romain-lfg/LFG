export type NillionErrorCode = 
  | 'INITIALIZATION_ERROR'
  | 'FETCH_BOUNTIES_ERROR'
  | 'CREATE_BOUNTY_ERROR'
  | 'UPDATE_BOUNTY_ERROR'
  | 'DELETE_BOUNTY_ERROR'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export class NillionError extends Error {
  constructor(
    message: string,
    public code: NillionErrorCode,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'NillionError';
  }

  static fromError(error: unknown, defaultCode: NillionErrorCode = 'UNKNOWN_ERROR'): NillionError {
    if (error instanceof NillionError) {
      return error;
    }

    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NillionError(message, defaultCode, error);
  }

  static isNillionError(error: unknown): error is NillionError {
    return error instanceof NillionError;
  }
}
