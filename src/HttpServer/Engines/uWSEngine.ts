import uWS from 'uWebSockets.js';
import { Router } from '@little0/Router';
import { HttpStatus } from '../enums';

type HttpServerOptions = {
  port?: number;
};

export class uWSEngine {
  private readonly _server: uWS.TemplatedApp;
  private readonly _port: number;

  get uWsInstance() {
    return this._server;
  }

  get port() {
    return this._port;
  }

  get router() {
    return this._router;
  }

  constructor(private readonly _router: Router, options?: HttpServerOptions) {
    options = options ?? {};

    this._server = uWS.App();
    this._port = options.port ?? 8081;
  }

  run() {
    this._server.any('/*', (res, req) => uWSEngine._onHandler(res, req, this));
    this._server.listen(this.port, listenSocket => {
      if (!listenSocket) {
        throw new Error('Cannot create uWs.');
      }

      console.log('Listen on port : ' + this.port);
    });
  }

  protected static _onHandler(
    response: uWS.HttpResponse,
    request: uWS.HttpRequest,
    self: uWSEngine,
  ) {
    try {
      const handler = self._router.find(request.getMethod(), request.getUrl());
      if (handler && handler.value) {
        let result = handler.value();
        if (typeof result === 'object') {
          result = JSON.stringify(result);
        }
        return response.cork(() =>
          response.writeStatus(HttpStatus.OK).end(result),
        );
      } else {
        return response.cork(() =>
          response.writeStatus(HttpStatus.NOT_FOUND).end('Not Found'),
        );
      }
    } catch (err) {
      return response.cork(() =>
        response.writeStatus(HttpStatus.SERVER_ERROR).end(JSON.stringify(err)),
      );
    }
  }
}
