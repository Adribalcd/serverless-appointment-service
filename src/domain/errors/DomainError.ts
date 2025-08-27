export abstract class DomainError extends Error {
  abstract readonly type: string;
}

export class ValidationError extends DomainError {
  readonly type = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  readonly type = 'NOT_FOUND_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class BusinessRuleError extends DomainError {
  readonly type = 'BUSINESS_RULE_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}
