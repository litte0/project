import { HttpServer } from './HttpServer';

function bootstrap(): void {
  const server = new HttpServer();

  server.router.add('get', '/hello', () => {
    return 'Hello World.';
  });

  server.router.add('get', '/cat', () => 'hello cat');

  server.router.add('get', '/', () => 'home');

  server.run();
}

bootstrap();
