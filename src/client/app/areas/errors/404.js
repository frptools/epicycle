import {p} from '@motorcycle/dom';
import {makePageComponent} from 'common/component-helpers';

function makeView(state) {
  return (
    p('Page not found.')
  );
}

function makeModel(state) {
  return {
    title: 'Page Not Found',
    status: 'notfound'
  };
}

export default makePageComponent({
  makeView,
  makeModel
});
