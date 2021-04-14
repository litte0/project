import { RadixTree } from "./RadixTree";
import { FindResult, RNode } from "./types";

export class RadixTreeSearch<T> {
  private readonly result: FindResult<T> = { param: {} };
  constructor(private readonly path: string, private readonly root: RNode<T>) {
    this.find();
  }

  get findResult(): FindResult<T> {
    return this.result;
  }

  protected find() {
    const preparePath = RadixTree._preparePath(this.path);

    if (preparePath === "") {
      this.result.value = this.root.value;
    } else {
      this.result.value = this._find(preparePath, this.root);
    }
  }
  protected _find(path: string, node: RNode<T>): T | undefined {
    for (const children of node.staticChildren) {
      let i = 0;
      while (path.charCodeAt(i) === children.path.charCodeAt(i)) {
        i += 1;
      }

      if (i > 0) {
        const notSamePath = children.path.slice(i);
        const nextPath = path.slice(i);

        if (notSamePath !== "") {
          continue;
        }

        if (nextPath === "") {
          return children.value;
        }

        return this._find(nextPath, children);
      }
    }

    if (node.type === "static") {
      for (const children of node.paramChildren) {
        const startNextPath = path.indexOf("/");

        const thisPath =
          startNextPath < 0 ? path : path.slice(0, startNextPath);

        const nextPath = startNextPath < 0 ? "" : path.slice(startNextPath);

        const isRegex = children.regex?.test(thisPath);

        if (isRegex) {
          this.result.param[children.paramName] = thisPath;
          if (nextPath === "") {
            return children.value;
          } else {
            return this._find(nextPath, children);
          }
        }
      }
    }

    return undefined;
  }
}
