import {
  CompileOptionsType,
  TemplateParameterType,
  TemplateMatchResponseType
} from './types';

import aspNetCoreCompilers from './rules/asp-net-core';
import { SimplexRouter } from './router';

/**
 * Quotes regular expression in a string.
 *
 * @param {string} value ~ value whose regular expression is to be quoted
 * @returns {string} - quoted regex
 */
export const quoteRegExp = (value: string): string => {
  // eslint-disable-next-line no-useless-escape
  return value.replace(/[\\\[\]\^$*+?.()|{}]/g, '\\$&');
};
export const defaultCompileOptions: CompileOptionsType
= { rules: aspNetCoreCompilers };

/**
 * Remove the use of `URLSearchParams` for speed because of browser support.
 * `URLSearchParams` [key, value] are usually automatically decoded,
 * we want to control that.
 * @tutorial https://tinyurl.com/ngx2pnx
 * @tutorial https://tinyurl.com/y4zkpect
 *
 * @param {string} searchParamsPath - searchParamsPath
 * @param {boolean} decode - decode
 *
 * @returns {TemplateParameterType} - TemplateParameterType
 */
export const getSearchPathParameters = (
  searchParamsPath: string,
  decode = true
): TemplateParameterType => {
  const searchParamsObject: TemplateParameterType = {};

  if (searchParamsPath) {
    const pairs = (
      searchParamsPath[0] === '?'
        ? searchParamsPath.substr(1)
        : searchParamsPath
    ).split('&');

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      let key = pair[0];
      let value = pair[1] || '';

      key = decode ? decodeURIComponent(key) : key;
      value = decode ? decodeURIComponent(value) : value;

      if (key) {
        if (!searchParamsObject[key]) {
          searchParamsObject[key] = value;
        }
      }
    }
  }

  return searchParamsObject;
};

export interface ISimplexRouter {
  match(
    pathToMatchRoutes: string,
    options: { onlyFirstTemplate?: boolean; decode?: boolean }
  ): TemplateMatchResponseType[] | TemplateMatchResponseType;
}

export default (
  routesToCompile: Record<string, unknown>[] | string[] | string,
  routesCompileOptions?: CompileOptionsType
): ISimplexRouter => {
  return new SimplexRouter(routesToCompile, routesCompileOptions);
};
