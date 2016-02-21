import {run} from '@motorcycle/core';
import {makeDOMDriver} from '@motorcycle/dom';
import {makeRouterDriver} from '@motorcycle/router';
import {createHistory} from 'history';

import App from './app';

run(App, {
  DOM: makeDOMDriver('.app-root'),
  router: makeRouterDriver(createHistory())
});
