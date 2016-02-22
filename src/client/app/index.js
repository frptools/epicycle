import most from 'most';
import {p, div} from '@motorcycle/dom';
import {applyRouter} from 'common/routing-helpers';
import {routes} from './routes';
import Navigation from './navigation';

function view(page, nav) {
  return (
    div('.app', [
      div('.app__nav', [nav]),
      div('.app__content', [page]),
      p('Welcome to the jungle!')
    ])
  );
}

function composeViews(page$, components) {
  // if page$ changes or any of the component DOM sinks changes, we re-render
  const pageView$ = page$.map(page => page.sinks.DOM);
  const componentViews = Array
    .from(Object.keys(components))
    .map(key => components[key].DOM)
    .filter(view$ => view$);
  const views = [pageView$].concat(componentViews);
  return most.combineArray((...args) => args, views)
    .filter(args => args.every(arg => arg))
    .map(args => view(...args));
}

export default function App(sources) {
  const page$ = applyRouter(sources, routes); // => stream of { route, sinks }
  const components = {
    nav: Navigation(sources, page$),
  };
  const view$ = composeViews(page$, components);

  // 1. need to merge the component sinks and the page sinks with our own internal sinks
  // 2. need to encapsulate view, state and metadata (metadata = route, result, etc.)
  /*
    where does the metadata come from?
    if a catchall route is matched, the route path will be '*' - that's how we know
  */

  // page$.flatMap(page => )

  return {
    DOM: view$
  };
};
