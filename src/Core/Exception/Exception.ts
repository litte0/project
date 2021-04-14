export class Exception extends Error {
  constructor(private readonly code: number, public message: string) {
    super(message);
  }

  getCode() {
    return this.code;
  }

  getMessage() {
    return this.message;
  }
}
