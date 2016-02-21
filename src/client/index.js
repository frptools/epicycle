import most from 'most';
import {run} from '@motorcycle/core';
import {makeDOMDriver} from '@motorcycle/dom';
import {makeRouterDriver} from '@motorcycle/router';
import {createHistory} from 'history';

import App from './app';

function getInitialContext() {
  const initialContext = window.initialContext;
  delete window.initialContext;
  const el = document.getElementById('initial-client-context');
  el.parentNode.removeChild(el);
  return initialContext;
};

run(App, {
  DOM: makeDOMDriver('.app-root'),
  router: makeRouterDriver(createHistory()),
  context: () => most.just(getInitialContext())
});
