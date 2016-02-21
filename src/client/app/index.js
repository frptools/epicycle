import most from 'most';
import {p} from '@motorcycle/dom';
import routes from './routes';

function makeView() {
  return most.just(
    p('Welcome to the jungle!')
  );
}

module.exports = function App(sources) {
  const {router} = sources;
  const {path$, value$} = router.define(routes);
  const matchedComponent$ = path$.zip(value$, (path, value) => value({...sources, router: router.path(path)}));

  // can't help but think the above needs to extracted to a helper


  return {
    DOM: makeView()
  };
};
