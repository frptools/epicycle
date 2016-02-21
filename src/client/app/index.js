import most from 'most';
import {p} from '@motorcycle/dom';
import routes from './routes';
import Sidebar from './sidebar';

function makeView() {
  return most.just(
    p('Welcome to the jungle!')
  );
}

function run() {

}

export default function App(sources) {
  const {router} = sources;
  const {path$, value$} = router.define(routes);
  const matchedComponent$ = path$.zip(value$, (path, value) => value({...sources, router: router.path(path)}));

  // can't help but think the above needs to extracted to a helper
  const sidebar = Sidebar(sources);


  return {
    DOM: makeView()
  };
};
