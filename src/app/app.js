import most from 'most';
const {p} = require('@motorcycle/dom');

function makeView() {
  return most.just(
    p('Welcome to the jungle.')
  );
}

export function App(sources) {
  return {
    DOM: makeView()
  };
}
