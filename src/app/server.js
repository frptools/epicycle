const most = require('most');
const express = require('express');
const serialize = require('serialize-javascript');
const {run} = require('@motorcycle/core');
const {html, head, title, body, div, script} = require('@motorcycle/dom');
const {default:htmlDriver} = require('@motorcycle/html');
const {App} = require('./app');

// ----------------------------------------------------------------------------
// TOP-LEVEL PAGE TEMPLATE

function makeFullHTMLView(vtree, context) {
  return (
    html([
      head([
        title('Motorcycle Isomorphism Boilerplate')
      ]),
      body([
        div('.app-root', [vtree]),
        script(`window.appContext = ${serialize(context)};`),
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
    context: () => context$
  });
  sources.DOM.select(':root').observable
    .map(html => `<!doctype html>${html}`)
    .take(1)
    .observe(callback);
}

// ----------------------------------------------------------------------------
// EXPRESS SERVER

(function() {

  var server = express();
  server.use('/js', express.static(__dirname + '/../www/js'));

  server.use(function (req, res) {
    // ignore favicon requests
    if(req.url === '/favicon.ico') {
      res.writeHead(200, {'Content-Type': 'image/x-icon'});
      res.end();
      return;
    }
    console.log(`req: ${req.method} ${req.url}`);
    generateResponse(req.url, html => res.send(html));
  });

  const port = process.env.port||1337;
  server.listen(port, () => {
    console.log(`Now listening on port ${port}`);
  });

})();
