// import most from 'most';
import {paths} from './routes';
import {nav, li, a} from '@motorcycle/dom';
import configureStyles from 'common/configure-styles';

const css = configureStyles({
  color: `red`
});

export default function Navigation(sources) {
  const {createHref:href} = sources.router;
  const ahref = (url, text) => a({attrs: {href: href(url)}}, [text]);

  return (
    nav(`.${css}`, [
      li([ahref(paths.home), `Home`])//,
      // li([ahref(paths.about), `About`]),
      // li([ahref(paths.home), `Home`]),
    ])
  );
}
