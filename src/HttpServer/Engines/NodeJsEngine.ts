import http from 'http';
import { Router } from '@little0/Router';

type HttpServerOptions = {
  port?: number;
};

export class NodeJsEngine {
  private readonly _port: number;
  constructor(private readonly _router: Router, options?: HttpServerOptions) {
    this._port = options?.port ?? 8081;
  }

  run() {
    const server = http.createServer((req, res) =>
      NodeJsEngine._onHandler(req, res, this),
    );
    server.listen(this._port, () => {
      console.log('start listen on port ' + this._port);
    });
  }

  protected static _onHandler(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    self: NodeJsEngine,
  ) {
    {
      try {
        const handler = self._router.find(request.method!, request.url!);
        if (handler && handler.value) {
          let result = handler.value();
          if (typeof result === 'object') {
            result = JSON.stringify(result);
          }

          return response.end(result);
        } else {
          response.statusCode = 404;
          return response.end('Not Found');
        }
      } catch (err) {
        response.statusCode = 500;
        response.end(JSON.stringify(err));
      }
    }
  }
}
