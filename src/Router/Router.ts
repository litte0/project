import { RadixTree } from './RadixTree';
import { CharCode } from './RadixTree/enums';
import { FunctionHandler, RouterOptions } from './types';

export class Router {
  private readonly _router = new Map<string, RadixTree<FunctionHandler>>();
  private readonly _options: RouterOptions;

  constructor(options?: RouterOptions) {
    options ??= {};
    options.isCaseSensitive ??= false;

    this._options = options;
  }

  add(method: string | string[], path: string, handler: FunctionHandler): void {
    const preparePath = this._preparePath(path);

    if (Array.isArray(method)) {
      this._addMany(method, preparePath, handler);
    } else {
      this._add(method, preparePath, handler);
    }
  }

  protected _add(method: string, path: string, handler: FunctionHandler) {
    const isHasMethod = this._router.has(method);

    if (!isHasMethod) {
      this._router.set(method, new RadixTree());
    }

    const route = this._router.get(method);

    route!.add(path, handler);
  }

  protected _addMany(
    methods: string[],
    path: string,
    handler: FunctionHandler,
  ) {
    for (const method of methods) {
      this._add(method, path, handler);
    }
  }

  find(method: string, path: string) {
    const route = this._router.get(method);

    if (route) {
      const handler = route.find(path);
      if (handler.value) {
        return handler;
      }
    }

    return null;
  }

  getRouterTree(method: string) {
    return this._router.get(method);
  }

  protected _preparePath(path: string) {
    if (path.charCodeAt(0) !== CharCode.SLASH) {
      path = '/' + path;
    }

    if (
      path.length > 1 &&
      path.charCodeAt(path.length - 1) === CharCode.SLASH
    ) {
      path = path.slice(0, path.length - 1);
    }

    if (this._options.isCaseSensitive === false) {
      path = path.toLocaleLowerCase();
    }

    return path;
  }
}
