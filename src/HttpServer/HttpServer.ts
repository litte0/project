import uWS from 'uWebSockets.js';
import { Router } from '@/Routes';
import { HttpStatus } from './enums';
type HttpServerOptions = {
  port?: number;
};

export class HttpServer {
  private readonly _server: uWS.TemplatedApp;
  private readonly _port: number;
  // private readonly _app?: AppInterface;
  private readonly _router = new Router();

  get uWsInstance() {
    return this._server;
  }

  get port() {
    return this._port;
  }

  get router() {
    return this._router;
  }

  constructor(options?: HttpServerOptions) {
    options = options ?? {};

    this._server = uWS.App();
    this._port = options.port ?? 8081;
  }

  // constructor(app?: typeof App, options?: HttpServerOptions) {
  //   options = options ?? {};

  //   this._server = uWS.App();
  //   this._port = options.port ?? 8081;
  //   this._app = new app(this._server);
  // }

  run() {
    this._server.any('/*', (res, req) => this._onHandler(res, req, this));
    this._server.listen(this.port, listenSocket => {
      if (!listenSocket) {
        throw new Error('Cannot create uWs.');
      }

      console.log('Listen on port : ' + this.port);
    });
  }

  protected _onHandler(
    response: uWS.HttpResponse,
    request: uWS.HttpRequest,
    self: this,
  ) {
    try {
      const handler = self._router.find(request.getMethod(), request.getUrl());
      if (handler && handler.value) {
        let result = handler.value();
        if (typeof result === 'object') {
          result = JSON.stringify(result);
        }
        response.cork(() => response.writeStatus(HttpStatus.OK).end(result));
      } else {
        response.cork(() =>
          response.writeStatus(HttpStatus.NOT_FOUND).end('Not Found'),
        );
      }
    } catch (err) {
      console.error(err);
      response.cork(() =>
        response.writeStatus(HttpStatus.SERVER_ERROR).end(JSON.stringify(err)),
      );
    }
  }
}
