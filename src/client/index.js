import {run} from '@motorcycle/core';
import {makeDOMDriver} from '@motorcycle/dom';
import {makeRouterDriver} from '@motorcycle/router';
import {createHistory} from 'history';
import {makeClientContextDriver} from 'common/context-driver';

import main from './app';

run(main, {
  context: makeClientContextDriver(makeDOMDriver('.app-root')),
  router: makeRouterDriver(createHistory(), { capture: true })
});
