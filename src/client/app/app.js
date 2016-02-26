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

function extractViews(sinks) {
  return sinks.context && sinks.context.view$ || sinks.DOM;
}

function composeViews(page$, components) {
  // extract each component's view stream, sorted by the component's key
  const componentViews = Array
    .from(Object.keys(components))
    .sort()
    .map(key => extractViews(components[key]))
    .filter(view$ => view$);

  const pageView$ = page$.map(page => extractViews(page.sinks));
  const views = [pageView$].concat(componentViews);

  // collect the current page view and each child component's current view into
  // an array, but skip the combined combined result until every component's
  // first view has been emitted at least once
  return most.combineArray((...args) => args, views)
    .filter(args => args.every(arg => arg))
    .map(args => view(...args));
}

// function mergeSinks()

export default function App(sources) {
  // determine the
  const page$ = applyRouter(sources, routes); // => stream of { route, sinks }
  const components = {
    nav: Navigation(sources, page$),
  };
  // const context$ = {
  //   view$: composeViews(page$, components)
  // };
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
