import most from 'most';
import express from 'express';
import path from 'path';

import {run} from '@motorcycle/core';
import htmlDriver from '@motorcycle/html';
import {makeRouterDriver} from '@motorcycle/router';
import {createServerHistory} from '@motorcycle/history';
import {html, head, title, style, body, div, script} from '@motorcycle/dom';
import getStyles from 'common/configure-styles';

import App from '../../client/app';

// ----------------------------------------------------------------------------
// TOP-LEVEL PAGE TEMPLATE

function makeFullHTMLView(vtree, context) {
  return (
    html([
      head([
        title('Motorcycle Isomorphism Boilerplate'),
        style({attrs: {type: 'text/css'}}, getStyles())
      ]),
      body([
        div('.app-root', [vtree]),
        script({ props: {src: '/js/client.js' }})
      ])
    ])
  );
}

// ----------------------------------------------------------------------------
// SERVER-SIDE APP BOOTSTRAPPER

function makeServerMainFn(main, context$) {
  return function(sources) {
    const vtree$ = main(sources).DOM;
    const wrappedVTree$ = most.combine(makeFullHTMLView, vtree$, context$);
    return { DOM: wrappedVTree$ };
  };
}

function generateResponse(url, callback) {
  const context$ = most.just(url);
  const mainFn = makeServerMainFn(App, context$);
  const {sources} = run(mainFn, {
    DOM: htmlDriver,
    router: makeRouterDriver(createServerHistory()),
    context: () => context$
  });
  sources.DOM.select(':root').observable
    .map(html => `<!doctype html>${html}`)
    .take(1)
    .observe(callback);
}

// ----------------------------------------------------------------------------
// EXPRESS SERVER

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
  generateResponse(req.url, html => res.send(html));
});

export default server;
