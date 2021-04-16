export type ServerEngine = 'node' | 'uws';
export type HttpServerOptions = {
  engine?: ServerEngine;
  port?: number;
};
