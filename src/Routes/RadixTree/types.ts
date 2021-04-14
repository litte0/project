export type RNodeStatic<T> = {
  type: "static";
  path: string;
  staticChildren: RNodeStatic<T>[];
  paramChildren: RNodeParam<T>[];
  value?: T;
};

export type RNodeParam<T> = {
  type: "param";
  paramName: string;
  staticChildren: RNodeStatic<T>[];
  regex?: RegExp;
  value?: T;
};

export type RNode<T> = RNodeStatic<T> | RNodeParam<T>;

export type FindResult<T> = {
  param: Record<string, unknown>;
  value?: T;
};
