import Home from './areas/home';
import configureRoutes from 'common/configure-routes';

module.exports = configureRoutes([
  { id: `home`, component: Home, path: `/` },
  // { id: '404', component: NotFound, path: '*' }
]);
