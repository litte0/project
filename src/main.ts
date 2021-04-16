import { HttpServer } from './HttpServer';

function bootstrap(): void {
  const server = new HttpServer({ port: 8001, engine: 'uws' });

  server.router.add('get', '/', () => {
    return 'Hello World.';
  });

  server.run();
}

bootstrap();
