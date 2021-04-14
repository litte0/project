import { HttpServer } from "./HttpServer";

function bootstrap(): void {
  const server = new HttpServer();

  server.router.add("get", "/hello", 1);
  
  server.run();
}

bootstrap();
