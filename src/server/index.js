import config from './config';
import socket from './config/socket.io';
import bootstrap from './bootstrap';


// bootstrap: Express, Models(Mongo), Routes
const server = bootstrap.listen(config.port, () => {
  console.log(`Current Environment: ${config.env}`);
  console.log(`Running Express on Port ${config.port}, ${Date()}`);
});

socket(server);
