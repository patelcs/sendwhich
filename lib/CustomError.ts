export class CustomError<T extends string> extends Error {
  readonly name: string = 'AddressBookError';
  readonly code: T;
  readonly hint?: string;

  constructor(code: T, msg: string, hint?: string, options?: ErrorOptions) {
    super(msg, options);
    this.code = code;
    this.hint = hint;
  }
}
