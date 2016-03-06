import express from 'express';
import webServer from './web';
import apiServer from './api';
import config from 'common/server-config';
import {logError} from 'common/utils';

require('source-map-support').install();

var server = express();
server.use('/api', apiServer);
server.use(webServer);

const port = process.env.port||config.port;
server.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});

process.on('uncaughtException', logError);
