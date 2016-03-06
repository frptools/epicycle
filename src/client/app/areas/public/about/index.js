import {p} from '@motorcycle/dom';
import {makePageComponent} from 'common/component-helpers';

function makeView(state) {
  return (
    p('All about us.')
  );
}

function makeModel(state) {
  return {
    title: 'About Us',
    foo: 'The "about" page made this data'
  };
}

export default makePageComponent({
  makeView,
  makeModel
});
