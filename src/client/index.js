import {run} from '@motorcycle/core';
import {makeDOMDriver} from '@motorcycle/dom';
import {makeRouterDriver} from '@motorcycle/router';
import {createHistory} from 'history';
import {makeBrowserStateDriver} from 'common/state-driver';

import main from './app';

run(main, {
  state: makeBrowserStateDriver(makeDOMDriver('.app-root')),
  router: makeRouterDriver(createHistory(), { capture: true })
});
