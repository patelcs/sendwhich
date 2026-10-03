import { CustomError } from "@/lib/CustomError";

export type AddressBookErrorCode = 'AlreadyExists' | 'NotFound';

export class AddressBookError extends CustomError<AddressBookErrorCode> { }
