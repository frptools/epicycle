import express from 'express';
import path from 'path';

import {run} from '@motorcycle/core';
import htmlDriver from '@motorcycle/html';
import {makeRouterDriver} from '@motorcycle/router';
import {makePageDriver} from 'common/page-driver';
import {createServerHistory, createLocation} from '@motorcycle/history';
import {html, head, title, style, body, div, script} from '@motorcycle/dom';
import {configureStyles} from 'common/style-helpers';
import {assign} from 'common/utils';

import App from '../../client/app';

function makeFullHTMLView(page) {
  return (
    html([
      head([
        title(page.title || 'Motorcycle Isomorphism Boilerplate'),
        style({attrs: {type: 'text/css'}}, configureStyles())
      ]),
      body([
        div('.app-root', [page.view]),
        script({ props: {src: '/js/client.js' }})
      ])
    ])
  );
}

function makeServerMainFn(main) {
  return function(sources) {
    const sinks = main(sources);
    const pages = sinks.pages.map(page => assign(page, { view: makeFullHTMLView(page) }));
    return assign(sinks, { pages });
  };
}

function generateResponse(url, callback) {
  const mainFn = makeServerMainFn(App);
  const history = createServerHistory();
  const {sources} = run(mainFn, {
    pages: makePageDriver(htmlDriver),
    router: makeRouterDriver(history)
  });
  sources.pages.DOM.select(':root').observable
    .map(html => `<!doctype html>${html}`)
    .zip((html, page) => ({ html, page }), sources.pages.page$)
    .take(1)
    .observe(callback);
  history.push(createLocation({ pathname: url }));
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
  generateResponse(req.url, ({ html, page: { status } }) => {
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
