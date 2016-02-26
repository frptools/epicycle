import {run} from '@motorcycle/core';
import {makeDOMDriver} from '@motorcycle/dom';
import {makeRouterDriver} from '@motorcycle/router';
import {createHistory} from 'history';
import {makeBrowserPageDriver} from 'common/page-driver';

import main from './app';

run(main, {
  pages: makeBrowserPageDriver(makeDOMDriver('.app-root')),
  router: makeRouterDriver(createHistory(), { capture: true })
});
