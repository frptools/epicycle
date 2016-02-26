import most from 'most';
import {p, div} from '@motorcycle/dom';
import {applyRouter} from 'common/routing-helpers';
import {assign} from 'common/utils';
import {routes} from './routes';
import Navigation from './navigation';

function view(page, nav) {
  return (
    div('.app', [
      div('.app__nav', [nav]),
      div('.app__content', [page]),
      p('Welcome to the jungle...')
    ])
  );
}

function extractViewStream(sinks) {
  return sinks.pages ? sinks.pages.map(page => page.view) : sinks.DOM;
}

function composePage(pageResult$, childComponents) {
  // extract each component's view stream, sorted by the component's key
  const componentViews = Array
    .from(Object.keys(childComponents))
    .sort()
    .map(key => extractViewStream(childComponents[key]))
    .filter(view$ => view$);

  const pageView$ = pageResult$.map(result => extractViewStream(result.sinks));
  const viewStreams = [pageView$].concat(componentViews);

  // collect the current page view and each child component's current view into
  // an array, but skip the combined combined result until every component's
  // first view has been emitted at least once
  return most.combineArray((...args) => args, viewStreams)
    .filter(args => args.every(arg => arg))
    .map(args => view(...args));
}

export default function App(sources) {
  const pageResult$ = applyRouter(sources, routes); // => stream of { route, sinks }
  const childComponents = {
    nav: Navigation(sources, pageResult$),
  };
  const view$ = composePage(pageResult$, childComponents);
  const page$ = pageResult$
    .flatMap(result => result.sinks.pages)
    .combine((page, view) => ({ page, view }), view$)
    .filter(p => p.page && p.view)
    .map(({ page, view }) => assign(page, { view }));

  // TODO: merge other sinks from child components (http, etc.)

  return {
    pages: page$
  };
};
