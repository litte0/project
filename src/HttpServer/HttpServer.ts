import { Router } from '@little0/Router';
import { HttpServerOptions, ServerEngine } from './types';

export class HttpServer {
  private readonly _router = new Router();
  private readonly _engine: ServerEngine;
  private readonly _port: number;

  get engine(): ServerEngine {
    return this._engine;
  }

  get port(): number {
    return this._port;
  }

  get router(): Router {
    return this._router;
  }

  constructor(options?: HttpServerOptions) {
    this._engine = options?.engine ?? 'node';
    this._port = options?.port ?? 8081;
  }

  run() {
    if (this.engine === 'uws') {
      import('./Engines/uWSEngine').then(engine => {
        const server = new engine.uWSEngine(this.router);
        server.run();
      });
    } else {
      import('./Engines/NodeJsEngine')
        .then(engine => {
          const server = new engine.NodeJsEngine(this.router);
          server.run();
        })
        .catch(_ => console.error('not found engine'));
    }
  }
}
