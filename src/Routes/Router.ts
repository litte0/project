import { RadixTree } from "./RadixTree";

export class Router {
  private _router = new Map<string, RadixTree<unknown>>();

  constructor() {}

  add(method: string | string[], path: string, handler: any): void {
    if (Array.isArray(method)) {
      this._addMany(method, path, handler);
    } else {
      this._add(method, path, handler);
    }
  }

  protected _add(method: string, path: string, handler: any) {
    const isHasMethod = this._router.has(method);

    if (!isHasMethod) {
      this._router.set(method, new RadixTree());
    }

    const route = this._router.get(method);

    route!.add(path, handler);
  }

  protected _addMany(methods: string[], path: string, handler: any) {
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
}
