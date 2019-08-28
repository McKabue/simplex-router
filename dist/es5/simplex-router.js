import aspNetCoreCompilers from './compilers/asp-net-core';
/**
 * Quotes regular expression in a string.
 *
 * @param value ~ value whose regular expression is to be quoted
 *
 * @returns string
 */

var quoteRegExp = function quoteRegExp(value) {
  return value.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
};

var defaultCompileOptions = {
  compilers: aspNetCoreCompilers
};

var getSearchPathParameters = function getSearchPathParameters(searchParamsPath) {
  var searchParamsObject = {};

  if (searchParamsPath) {
    var urlSearchParams = new URLSearchParams(searchParamsPath);
    urlSearchParams.forEach(function (value, key) {
      if (!searchParamsObject[key]) {
        searchParamsObject[key] = value;
      }
    });
  }

  return searchParamsObject;
};

var SimplexRouter =
/*#__PURE__*/
function () {
  function SimplexRouter(routeTemplates, compileOptions) {
    if (!routeTemplates) {
      throw new Error("no 'route' or [routes]");
    }

    var options = Object.assign(Object.assign({}, defaultCompileOptions), compileOptions);
    var templates = this.routeTemplates = Array.isArray(routeTemplates) ? routeTemplates : [routeTemplates];
    var compiledRouteTemplates = this.compiledRouteTemplates = [];

    for (var templateIndex = 0; templateIndex < templates.length; templateIndex++) {
      var template = templates[templateIndex];
      var templatePath = options.routeKey ? options.routeKey(template) : template;
      var templateParameters = [];

      for (var compilerIndex = 0; compilerIndex < options.compilers.length; compilerIndex++) {
        var compiler = options.compilers[compilerIndex];
        var compilerMatch = void 0;
        /**
         * Using if or const doesn't work here.
         *
         * @tutorial https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Finding_successive_matches
         */

        while (compilerMatch = compiler.from.exec(templatePath)) {
          templateParameters.push({
            first: compilerMatch.index,
            last: compilerMatch.index + compilerMatch[0].length,
            key: compilerMatch[1],
            compileRegex: compiler
          });
        }
      }

      templateParameters.sort(function (a, b) {
        return a.first - b.first;
      });
      var newRouteTemplate = ''; // parameters replaced with regular options

      var indexOfLastParameterized = 0;
      var lastUnParameterizedChunk = '';

      var _loop = function _loop(_templateCharacterIndex) {
        var templateParameterStart = templateParameters.find(function (i) {
          return i.first === _templateCharacterIndex;
        });

        if (templateParameterStart) {
          // this could be optimized to use '_last_un_parameterized_chunk'
          // because it should have the last chunk, that is why it is being cleared
          // in this 'if block'.
          var previousChunk = templatePath.slice(indexOfLastParameterized, templateParameterStart.first);
          var previousChunkSplit = previousChunk.split('?'); // break if there is a question mark meaning beginning of query string
          // it happens to be very unlikely this will ever catch a query string that is not
          // in a parameter because it will be caught in the 'else' statement below.
          // so, this just takes unnecessary memory and computation time that could be saved,BUR TESTING NEEDS TO BE DONE.

          if (previousChunkSplit.length > 1) {
            lastUnParameterizedChunk = previousChunkSplit[0]; //add the section before the question mark

            templateCharacterIndex = _templateCharacterIndex;
            return "break";
          }

          newRouteTemplate += quoteRegExp(previousChunk); // add previous chunk

          newRouteTemplate += templateParameterStart.compileRegex.to; // add current parameter regex

          indexOfLastParameterized = templateParameterStart.last;
          _templateCharacterIndex = templateParameterStart.last - 1; //we subtract one since we want the nest round of this loop to be the last index

          lastUnParameterizedChunk = ''; //last chunk is cleared because because parameter has been encountered
        } else {
          var templateCharacter = templatePath[_templateCharacterIndex];

          if (templateCharacter === '?') {
            templateCharacterIndex = _templateCharacterIndex;
            // if character is question mark, its a start of query string
            return "break";
          } else {
            lastUnParameterizedChunk += templateCharacter;
          }
        }

        templateCharacterIndex = _templateCharacterIndex;
      };

      for (var templateCharacterIndex = 0; templateCharacterIndex < templatePath.length; templateCharacterIndex++) {
        var _ret = _loop(templateCharacterIndex);

        if (_ret === "break") break;
      } //if the last parameterized index is smaller than route length,
      //then there are some characters are not in the parameters 
      //and need to be taken care of so they dont spoil the regex as
      // some of them could have special meaning. eg '?'
      //check this one as it assumes these characters are always the last ones.


      if (indexOfLastParameterized < templatePath.length) {
        newRouteTemplate += quoteRegExp(lastUnParameterizedChunk);
      }

      compiledRouteTemplates.push({
        compiledTemplate: new RegExp('^' + newRouteTemplate + '$'),
        template: template,
        templateParameterNames: templateParameters.map(function (i) {
          return i.key;
        })
      });
    }
  }

  var _proto = SimplexRouter.prototype;

  _proto.match = function match(pathToMatchTemplates, onlyFirstTemplate) {
    if (!pathToMatchTemplates) {
      if (onlyFirstTemplate) {
        return undefined;
      }

      return [];
    }

    var templateMatchResponses = [];
    var splitPathFromSearchParams = pathToMatchTemplates.split('?');
    var pathWithoutSearchParams = splitPathFromSearchParams[0];
    var searchParams = getSearchPathParameters(splitPathFromSearchParams[1]);

    for (var compiledRouteIndex = 0; compiledRouteIndex < this.compiledRouteTemplates.length; compiledRouteIndex++) {
      var compiledRoute = this.compiledRouteTemplates[compiledRouteIndex];
      var pathForMatchVariants = [pathWithoutSearchParams]; // below conditions could probably be done by regex.

      if (pathWithoutSearchParams.endsWith('/')) {
        pathForMatchVariants.push(pathWithoutSearchParams.substring(0, pathWithoutSearchParams.length - 1));
      }

      if (pathWithoutSearchParams.startsWith('/')) {
        pathForMatchVariants.push(pathWithoutSearchParams.substring(1, pathWithoutSearchParams.length));
      }

      if (!pathWithoutSearchParams.endsWith('/')) {
        pathForMatchVariants.push(pathWithoutSearchParams + '/');
      }

      if (!pathWithoutSearchParams.startsWith('/')) {
        pathForMatchVariants.push('/' + pathWithoutSearchParams);
      }

      for (var pathForMatchVariantsIndex = 0; pathForMatchVariantsIndex < pathForMatchVariants.length; pathForMatchVariantsIndex++) {
        var pathForMatchVariant = pathForMatchVariants[pathForMatchVariantsIndex];
        var pathForMatchVariantMatch = compiledRoute.compiledTemplate.exec(pathForMatchVariant);

        if (pathForMatchVariantMatch) {
          var templateMatchResponse = {
            params: {}
          };
          var params = {};

          for (var compiledRouteParamIndex = 0; compiledRouteParamIndex < compiledRoute.templateParameterNames.length; compiledRouteParamIndex++) {
            templateMatchResponse.params[compiledRoute.templateParameterNames[compiledRouteParamIndex]] = decodeURIComponent(pathForMatchVariantMatch[compiledRouteParamIndex + 1] || '');
          }

          params = Object.assign(Object.assign({}, templateMatchResponse.params), searchParams);

          if (typeof compiledRoute.template === 'string') {
            templateMatchResponse.template = compiledRoute.template;
            templateMatchResponse.params = params;
          } else {
            templateMatchResponse = Object.assign(Object.assign({}, compiledRoute.template), {
              params: params
            });
          }

          if (onlyFirstTemplate) {
            return templateMatchResponse;
          }

          templateMatchResponses.push(templateMatchResponse);
        }
      }
    }

    if (onlyFirstTemplate) {
      return undefined;
    }

    return templateMatchResponses;
  };

  _proto.ROUTER = function ROUTER(routesToCompile, routesCompileOptions) {
    return new SimplexRouter(routesToCompile, routesCompileOptions);
  };

  return SimplexRouter;
}();

export default function (routesToCompile, routesCompileOptions) {
  return new SimplexRouter(routesToCompile, routesCompileOptions);
}
;