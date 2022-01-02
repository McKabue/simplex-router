import { SimplexRouter } from './router';
import { CompileOptionsType } from './types';
import { ISimplexRouter } from './utils';

export default (
  routesToCompile: Record<string, unknown>[] | string[] | string,
  routesCompileOptions?: CompileOptionsType
): ISimplexRouter => {
  return new SimplexRouter(routesToCompile, routesCompileOptions);
};
