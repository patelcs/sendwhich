export type AddressBookErrorCode = 'AlreadyExists' | 'NotFound';

export class AddressBookError extends Error {
  readonly name: string = 'AddressBookError';
  readonly code: AddressBookErrorCode;
  readonly hint?: string;

  constructor(code: AddressBookErrorCode, msg: string, hint?: string, options?: ErrorOptions) {
    super(msg, options);
    this.code = code;
    this.hint = hint;
  }
}
