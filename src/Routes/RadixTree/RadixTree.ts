import { PathHasValueException } from "../Exceptions";
import { CharCode } from "./enums";
// import { RadixTreeSearch } from "./RadixTreeSearch";
import { FindResult, RNode, RNodeParam, RNodeStatic } from "./types";

export class RadixTree<T> {
  private readonly paths: string[] = [];
  private readonly root: RNode<T>;

  get tree() {
    return this.root;
  }
  constructor() {
    this.root = {
      type: "static",
      path: "/",
      staticChildren: [],
      paramChildren: [],
    };
  }

  //   find(path: string): FindResult<T> {
  //     const radixSearch = new RadixTreeSearch(path, this.root);

  //     return radixSearch.findResult;
  //   }

  find(path: string): FindResult<T> {
    const preparePath = RadixTree._preparePath(path);
    const param = {};

    if (preparePath === "") {
      return {
        param,
        value: this.root.value,
      };
    }

    return this._find(preparePath, this.root, param);
  }

  protected _find(
    path: string,
    node: RNode<T>,
    param: Record<string, unknown>
  ): FindResult<T> {
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
          return { param, value: children.value };
        }

        return this._find(nextPath, children, param);
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
          param[children.paramName] = thisPath;
          if (nextPath === "") {
            return { param, value: children.value };
          } else {
            return this._find(nextPath, children, param);
          }
        }
      }
    }

    return { param };
  }

  add(path: string, value: T): RadixTree<T> {
    this.paths.push(path);

    const preparePath = RadixTree._preparePath(path);

    if (preparePath === "") {
      if (typeof this.root.value !== "undefined") {
        throw new PathHasValueException();
      }
      this.root.value = value;

      return this;
    }

    this._add(preparePath, value, this.root);

    return this;
  }

  protected _add(path: string, value: T, node: RNode<T>) {
    // if first index is colon so is start of param.
    if (path.charCodeAt(0) === CharCode.COLON) {
      if (node.type === "static") {
        let i = 1;
        let endParamName = -1;
        let countBrackets = 0;
        let startRegex = -1;
        let endRegex = -1;
        let endParam = -1;
        while (1) {
          const ch = path.charCodeAt(i);
          if (
            endParamName < 0 &&
            (ch === CharCode.OPEN_BRACKET || ch === CharCode.SLASH || isNaN(ch))
          ) {
            endParamName = i;
          }

          if (ch === CharCode.OPEN_BRACKET) {
            countBrackets += 1;
            if (startRegex < 0) {
              startRegex = i;
            }
          } else if (ch === CharCode.CLOSE_BRACKET) {
            countBrackets -= 1;
            if (countBrackets === 0) {
              endRegex = i;
            }
          } else if (
            (ch === CharCode.SLASH || isNaN(ch)) &&
            countBrackets === 0
          ) {
            endRegex = i;
            endParam = i;
            break;
          }

          if (isNaN(ch)) {
            break;
          }

          i += 1;
        }

        const staticPath = path.slice(endParam);
        const paramName = path.slice(1, endParamName);
        const regexParam =
          endRegex < 0 ? "(.*)" : path.slice(startRegex, endRegex);

        console.log(staticPath);

        if (staticPath === "") {
          node.paramChildren.push(
            RadixTree._createParamRNode(paramName, regexParam, value)
          );
        } else {
          node.paramChildren.push(
            RadixTree._createParamRNode(paramName, regexParam)
          );
          this._add(
            staticPath,
            value,
            node.paramChildren[node.paramChildren.length - 1]!
          );
        }
      }
    } else {
      if (node.type === "static") {
        // check if has param.
        const startParamPath = path.indexOf(":");
        const staticPath =
          startParamPath < 0 ? path : path.slice(0, startParamPath);
        const paramPath = startParamPath < 0 ? "" : path.slice(startParamPath);

        for (const children of node.staticChildren) {
          if (staticPath.charCodeAt(0) !== children.path.charCodeAt(0)) {
            continue;
          }

          let endPath = 1;
          while (
            staticPath.charCodeAt(endPath) === children.path.charCodeAt(endPath)
          ) {
            endPath++;
          }

          const samePath = children.path.slice(0, endPath);
          const notSamePath = children.path.slice(endPath);
          const nextPath = staticPath.slice(endPath) + paramPath;
          children.path = samePath;

          if (notSamePath !== "") {
            children.staticChildren.push(
              RadixTree._createStaticRNode(notSamePath, children.value)
            );
            delete children.value;
          }

          if (nextPath === "") {
            children.value = value;
          } else {
            this._add(nextPath, value, children);
          }

          return;
        }

        if (startParamPath < 0) {
          node.staticChildren.push(RadixTree._createStaticRNode(path, value));
        } else {
          node.staticChildren.push(RadixTree._createStaticRNode(staticPath));
          this._add(paramPath, value, node.staticChildren[0]!);
        }
      }
    }
  }

  protected static _createStaticRNode<T>(
    path: string,
    value?: T
  ): RNodeStatic<T> {
    return {
      type: "static",
      path,
      staticChildren: [],
      paramChildren: [],
      value,
    };
  }

  protected static _createParamRNode<T>(
    param: string,
    regex?: string,
    value?: T
  ): RNodeParam<T> {
    regex ??= "(.*)";
    return {
      type: "param",
      paramName: param,
      value,
      regex: new RegExp(regex),
      staticChildren: [],
    };
  }

  protected static _pathCompare(path: string, sPath: string) {
    let endPath = 0;
    let startParamPath = -1;
    while (1) {
      const ch = path.charCodeAt(endPath);
      const rch = sPath.charCodeAt(endPath);

      if (ch === 58) {
        startParamPath = endPath;
        break;
      }

      if (ch === rch) {
        endPath += 1;
      } else {
        break;
      }
    }

    return {
      startParamPath,
      endPath,
    };
  }

  static _preparePath(path: string) {
    if (path.charCodeAt(0) === CharCode.SLASH) {
      path = path.slice(1);
    }

    if (path.charCodeAt(path.length - 1) === CharCode.SLASH) {
      path = path.slice(0, path.length - 1);
    }

    return path;
  }
}
