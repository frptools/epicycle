import express from 'express';
import path from 'path';

import {run} from '@motorcycle/core';
import htmlDriver from '@motorcycle/html';
import {makeRouterDriver} from '@motorcycle/router';
import {makeContextDriver} from 'common/context-driver';
import {createServerHistory, createLocation} from '@motorcycle/history';
import {html, head, title, style, body, div, script} from '@motorcycle/dom';
import {configureStyles} from 'common/style-helpers';
import {assign} from 'common/utils';

import App from '../../client/app';

function makeFullHTMLView({ view, metadata = {} }) {
  const pageTitle = metadata.title || 'Motorcycle Isomorphism Boilerplate!';
  return (
    html([
      head([
        title(pageTitle),
        style({attrs: {type: 'text/css'}}, configureStyles())
      ]),
      body([
        div('.app-root', [view]),
        script({ props: {src: '/js/client.js' }})
      ])
    ])
  );
}

function makeServerMainFn(main) {
  return function(sources) {
    const sinks = main(sources);
    const context = sinks.context.map(c => assign(c, { view: makeFullHTMLView(c) }));
    return assign(sinks, { context });
  };
}

function generateResponse(url, callback) {
  const mainFn = makeServerMainFn(App);
  const history = createServerHistory();
  const {sources, sinks} = run(mainFn, {
    context: makeContextDriver(htmlDriver),
    router: makeRouterDriver(history)
  });
  history.push(createLocation({ pathname: url }));
  sources.context.DOM.select(':root').observable
    .zip((html, metadata) => ({
      html: `<!doctype html>${html}`, metadata: metadata
    }), sinks.context.map(c => c.metadata || { status: 'found' }))
    .take(1)
    .observe(callback);
}

// ----------------------------------------------------------------------------

const server = express();

server.use((req, res, next) => {
  console.log(`WEB Request: ${req.method} ${req.url}`);
  next();
});

server.use(express.static(path.resolve(__dirname + '/../../../www')));

server.use(function (req, res) {
  // ignore favicon requests
  if(req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
    return;
  }
  generateResponse(req.url, ({ html, metadata }) => {
    let status;
    switch(metadata.status) {
      case 'notfound':
        status = 404;
        break;
      case 'moved':
        return res.redirect(301, metadata.location);
      case 'redirect':
        return res.redirect(302, metadata.location);
      default:
        status = 200;
        break;
    }
    res.status(status).send(html);
  });
});

export default server;
