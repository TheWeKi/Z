
import {SERVER_PORT} from './config/index.js';
import {createServer} from './server.js';


async function app() {
  const server = await createServer();

  const port = SERVER_PORT ? +SERVER_PORT : 8080;
  
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
app();
