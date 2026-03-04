import { server } from './mocks/server';

let serverStarted = false;

/**
 * Configura MSW para un archivo de tests de integración
 * Asegura que el servidor se inicie solo una vez
 */
export function setupIntegrationTest() {
  if (!serverStarted) {
    beforeAll(() => {
      server.listen({ onUnhandledRequest: 'error' });
    });

    afterEach(() => {
      server.resetHandlers();
    });

    afterAll(() => {
      server.close();
    });

    serverStarted = true;
  }

  return { server };
}
