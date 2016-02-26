import {paths} from './routes';
import {nav, li, a} from '@motorcycle/dom';
import {configureStyles} from 'common/style-helpers';

const css = configureStyles({
  color: 'red'
});

function view(route$, ahref) {
  return route$.map(({path}) =>
    nav(`.${css}`, [
      li([ahref(paths.home, 'Home')]),
      li([ahref(paths.about, 'About')]),
      li([ahref('/broken-link-should-generate-404', 'This link is broken')])
    ])
  );
}

export default function Navigation(sources, pageResult$) {
  const ahref = (url, text) => a({attrs: {href: sources.router.createHref(url)}}, text);
  const route$ = pageResult$.map(result => result.route);
  const view$ = view(route$, ahref);
  return {
    DOM: view$
  };
}
