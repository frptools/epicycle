import {div} from '@motorcycle/dom';
import {makePageComponent} from 'common/component-helpers';
import {routes} from './routes';

function makeView(state) {
  return (
    div(`.area.area--${state.model.area}`, [
      state.page.vtree
    ])
  );
}

function makeModel({ page: { model } }) {
  return {
    area: 'public'
  };
}

export default makePageComponent({
  routes,
  makeView,
  makeModel
});
