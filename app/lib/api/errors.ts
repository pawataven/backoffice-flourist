export type RepoErrorCode =
  | 'MOCK_FAILURE'
  | 'NOT_IMPLEMENTED'
  | 'NETWORK'
  | 'INVALID_DATA'
  | 'NOT_FOUND'
  | 'INVALID_CREDENTIALS'

/** The only error type a repository throws, so the UI can switch on `code`. */
export class RepoError extends Error {
  readonly code: RepoErrorCode

  constructor(code: RepoErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'RepoError'
    this.code = code
  }
}

export function isRepoError(error: unknown): error is RepoError {
  return error instanceof RepoError
}
