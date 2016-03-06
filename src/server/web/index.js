import express from 'express';
import path from 'path';
import hold from '@most/hold';
import {run} from '@motorcycle/core';
import htmlDriver from '@motorcycle/html';
import {createServerHistory, createLocation} from '@motorcycle/history';
import {html, head, title, link, body, div, script} from '@motorcycle/dom';
import {makeRouterDriver} from '@motorcycle/router';
import {makeStateDriver} from 'common/state-driver';
import {assign, logError} from 'common/utils';

import App from '../../client/app';

function makeDocumentView({ vtree, model }) {
  const titleEl = [];
  if(model.title) {
    titleEl.push(title(model.title));
  }
  return (
    html([
      head([
        ...titleEl,
        link({attrs: {rel: 'stylesheet', type: 'text/css', href:'https://fonts.googleapis.com/css?family=PT+Sans:400,700|Roboto:400,700,400italic,700italic'}}),
        link({attrs: {rel: 'stylesheet', type: 'text/css', href:'css/styles.css'}})
      ]),
      body([
        div('.app-root', [vtree]),
        script({ props: {src: '/js/client.js' }})
      ])
    ])
  );
}

function makeServerMainFn(main) {
  return function(sources) {
    const sinks = main(sources);
    const state = sinks.state.map(state => {
      const newState = assign(state, { vtree: makeDocumentView(state) });
      return newState;
    });
    return assign(sinks, { state });
  };
}

function generateResponse(req, callback) {
  const mainFn = makeServerMainFn(App);
  const history = createServerHistory();
  const {sources} = run(mainFn, {
    state: makeStateDriver(htmlDriver),
    router: makeRouterDriver(history)
  });
  const html$ = hold(sources.state.DOM
      .select(':root').observable
      .map(html => `<!doctype html>${html}`));
  const state$ = hold(sources.state.state$);
  html$
    .zip((html, state) => ({ html, state }), state$)
    .take(1)
    .observe(callback)
    .catch(logError);
  history.push(createLocation({ pathname: req.url }));
}

// ----------------------------------------------------------------------------

const server = express();

server.use((req, res, next) => {
  console.log(`WEB Request: ${req.method} ${req.url}`);
  next();
});

server.use(express.static(path.resolve(__dirname + '/../../../www')));

server.use(function (req, res) {
  // ignore favicon requests (should have been served before now via express.static)
  if(req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
    return;
  }

  generateResponse(req, ({ html, state: { model: { status } } }) => {
    let statusCode;
    switch(status.type) {
      case 'notfound':
        statusCode = 404;
        break;
      case 'moved':
        return res.redirect(301, status.location);
      case 'redirect':
        return res.redirect(302, status.location);
      default:
        statusCode = 200;
        break;
    }
    res.status(statusCode).send(html);
  });
});

export default server;
