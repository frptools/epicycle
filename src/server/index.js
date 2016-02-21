import express from 'express';
import webServer from './web';
import apiServer from './api';

var server = express();
server.use('/api', apiServer);
server.use(webServer);

const port = process.env.port||1337;
server.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
