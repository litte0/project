import { Exception } from '@/Core/Exception';

export class PathHasValueException extends Exception {
  constructor() {
    super(12000, 'this path has value.');
  }
}
