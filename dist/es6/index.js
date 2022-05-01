import { SimplexRouter } from './router';
export default (routesToCompile, routesCompileOptions) => {
    return new SimplexRouter(routesToCompile, routesCompileOptions);
};
