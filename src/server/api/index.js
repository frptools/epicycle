import express from 'express';

const server = express();

server.use((req, res, next) => {
  console.log(`API Request: ${req.method} ${req.url}`);
  next();
});

export default server;
