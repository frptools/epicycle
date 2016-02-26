import most from 'most';
import {p} from '@motorcycle/dom';

export default function NotFound(sources) {

  return {
    context: most.just({
      view: p('Page not found.'),
      metadata: {
        status: 'notfound'
      }
    })
  };
};
