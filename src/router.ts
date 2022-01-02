import {
  CompileOptionsType,
  TemplateParameterType,
  CompiledRouteType,
  RuleType,
  TemplateMatchResponseType
} from './types';
import {
  ISimplexRouter, defaultCompileOptions,
  quoteRegExp, getSearchPathParameters
} from './utils';

export class SimplexRouter implements ISimplexRouter {
  routeTemplates: Record<string, unknown>[] | string[] | string[];
  compiledRouteTemplates: CompiledRouteType[];
  // eslint-disable-next-line complexity
  constructor (
    routeTemplates: Record<string, unknown>[] | string[] | string,
    compileOptions?: CompileOptionsType
  ) {
    if (!routeTemplates) {
      throw new Error('no \'route\' or [routes]');
    }

    const options: CompileOptionsType = {
      ...defaultCompileOptions,
      ...compileOptions
    };

    if (!options.rules) {
      throw new Error('No default or passed rules.');
    }

    const templates: Record<string, unknown>[] | string[]
    = this.routeTemplates = Array.isArray(routeTemplates)
      ? routeTemplates
      : [routeTemplates];

    const compiledRouteTemplates:
      CompiledRouteType[] = (this.compiledRouteTemplates = []);

    for (let templateIndex = 0;
      templateIndex < templates.length; templateIndex++) {
      const template: Record<string, unknown> | string
        = templates[templateIndex];
      const templatePath: string | null = options.templateKey
        ? options.templateKey(template)
        : typeof template === 'string'
          ? template
          : null;

      if (!templatePath) {
        throw new Error('No Template Path');
      }

      const templateParameters: {
        first: number;
        last: number;
        key: string;
        compileRegex: RuleType;
      }[] = [];

      for (let compilerIndex = 0;
        compilerIndex < options.rules.length; compilerIndex++) {
        const compiler: RuleType = options.rules[compilerIndex];
        let compilerMatch: RegExpExecArray | null;
        /**
         * Using if or const doesn't work here.
         *
         * @tutorial https://tinyurl.com/kalbhlk
         */

        while ((compilerMatch = compiler.match.exec(templatePath))) {
          templateParameters.push({
            first: compilerMatch.index,
            last: compilerMatch.index + compilerMatch[0].length,
            key: compilerMatch[1],
            compileRegex: compiler
          });
        }
      }

      templateParameters.sort((a, b) => a.first - b.first);

      let newRouteTemplate = ''; // parameters replaced with regular options
      let indexOfLastParameterized = 0;
      let lastUnParameterizedChunk = '';

      for (let templateCharacterIndex = 0;
        templateCharacterIndex < templatePath.length;
        templateCharacterIndex++) {
        const templateParameterStart = templateParameters.find(
          (i) => i.first === templateCharacterIndex
        );

        if (templateParameterStart) {
          // this could be optimized to use '_last_un_parameterized_chunk'
          // because it should have the last chunk, that is why it is being
          // cleared in this 'if block'.
          const previousChunk = templatePath.slice(
            indexOfLastParameterized,
            templateParameterStart.first
          );
          const previousChunkSplit = previousChunk.split('?');
          // break if there is a question mark meaning beginning of query string
          // it happens to be very unlikely this will ever catch a query string
          // that is not in a parameter because it will be caught in the 'else'
          // statement below. so, this just takes unnecessary memory and
          // computation time that could be saved,BUR TESTING NEEDS TO BE DONE.

          if (previousChunkSplit.length > 1) {
            // add the section before the question mark
            lastUnParameterizedChunk = previousChunkSplit[0];
            break;
          }
          // add previous chunk
          newRouteTemplate += quoteRegExp(previousChunk);
          // add current parameter regex
          newRouteTemplate += templateParameterStart.compileRegex.use;
          indexOfLastParameterized = templateParameterStart.last;
          // we subtract one since we want the nest round of this loop
          // to be the last index
          templateCharacterIndex = templateParameterStart.last - 1;
          // last chunk is cleared because because parameter has been
          // encountered
          lastUnParameterizedChunk = '';
        } else {
          const templateCharacter = templatePath[templateCharacterIndex];

          if (templateCharacter === '?') {
            // if character is question mark, its a start of query string
            break;
          } else {
            lastUnParameterizedChunk += templateCharacter;
          }
        }
      }

      // if the last parameterized index is smaller than route length,
      // then there are some characters are not in the parameters
      // and need to be taken care of so they dont spoil the regex as
      // some of them could have special meaning. eg '?'
      // check this one as it assumes these characters are always the last ones.
      if (indexOfLastParameterized < templatePath.length) {
        newRouteTemplate += quoteRegExp(lastUnParameterizedChunk);
      }

      compiledRouteTemplates.push({
        compiledTemplate: new RegExp('^' + newRouteTemplate + '$'),
        template: template,
        templateParameterNames: templateParameters.map((i) => i.key)
      });
    }
  }
  // eslint-disable-next-line complexity
  match (
    pathToMatchTemplates: string,
    options: { onlyFirstTemplate?: boolean; decode?: boolean; }
  ): TemplateMatchResponseType[] | TemplateMatchResponseType {
    const optionsWithDefaults = {
      onlyFirstTemplate: false,
      decode: true,
      ...options
    };

    if (!pathToMatchTemplates) {
      if (optionsWithDefaults.onlyFirstTemplate) {
        return null as TemplateMatchResponseType;
      }

      return [] as TemplateMatchResponseType[];
    }

    const templateMatchResponses: TemplateMatchResponseType[] = [];
    const splitPathFromSearchParams: string[] = pathToMatchTemplates.split('?');
    const pathWithoutSearchParams: string = splitPathFromSearchParams[0];
    const searchParams = getSearchPathParameters(
      splitPathFromSearchParams[1],
      optionsWithDefaults.decode
    );

    for (let compiledRouteIndex = 0;
      compiledRouteIndex < this.compiledRouteTemplates.length;
      compiledRouteIndex++) {
      const compiledRoute = this.compiledRouteTemplates[compiledRouteIndex];
      const pathForMatchVariants = [pathWithoutSearchParams];

      // below conditions could probably be done by regex.
      if (pathWithoutSearchParams.endsWith('/')) {
        pathForMatchVariants.push(
          pathWithoutSearchParams.substring(
            0,
            pathWithoutSearchParams.length - 1
          )
        );
      }
      if (pathWithoutSearchParams.startsWith('/')) {
        pathForMatchVariants.push(
          pathWithoutSearchParams.substring(1, pathWithoutSearchParams.length)
        );
      }
      if (!pathWithoutSearchParams.endsWith('/')) {
        pathForMatchVariants.push(pathWithoutSearchParams + '/');
      }
      if (!pathWithoutSearchParams.startsWith('/')) {
        pathForMatchVariants.push('/' + pathWithoutSearchParams);
      }

      for (let pathForMatchVariantsIndex = 0;
        pathForMatchVariantsIndex < pathForMatchVariants.length;
        pathForMatchVariantsIndex++) {
        const pathForMatchVariant
          = pathForMatchVariants[pathForMatchVariantsIndex];
        const pathForMatchVariantMatch
          = compiledRoute.compiledTemplate.exec(pathForMatchVariant);

        if (pathForMatchVariantMatch) {
          let templateMatchResponse: TemplateMatchResponseType = { params: {} };
          let params: TemplateParameterType = {};

          for (let compiledRouteParamIndex = 0;
            compiledRouteParamIndex
              < compiledRoute.templateParameterNames.length;
            compiledRouteParamIndex++) {
            let key
              = compiledRoute.templateParameterNames[compiledRouteParamIndex];
            let value
              = pathForMatchVariantMatch[compiledRouteParamIndex + 1] || '';

            key = optionsWithDefaults.decode ? decodeURIComponent(key) : key;
            value = optionsWithDefaults.decode
              ? decodeURIComponent(value)
              : value;

            templateMatchResponse.params[key] = value;
          }

          params = { ...templateMatchResponse.params, ...searchParams };

          if (typeof compiledRoute.template === 'string') {
            templateMatchResponse.template = compiledRoute.template;
            templateMatchResponse.params = params;
          } else {
            templateMatchResponse = {
              ...compiledRoute.template,
              ...{ params: params }
            };
          }

          if (optionsWithDefaults.onlyFirstTemplate) {
            return templateMatchResponse;
          }

          templateMatchResponses.push(templateMatchResponse);
        }
      }
    }

    if (optionsWithDefaults.onlyFirstTemplate) {
      return null;
    }

    return templateMatchResponses;
  }
}
