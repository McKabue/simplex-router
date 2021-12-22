"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = _default;

var _aspNetCore = _interopRequireDefault(require("./rules/asp-net-core"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

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
  rules: _aspNetCore["default"],
};
/**
 * Remove the use of `URLSearchParams` for speed because of browser support.
 * `URLSearchParams` [key, value] are usually automatically decoded, we want to control that.
 * @tutorial https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams#Gotchas
 * @tutorial https://stackoverflow.com/a/13419367/3563013
 *
 * @param searchParamsPath
 * @param decode
 */

var getSearchPathParameters = function getSearchPathParameters(
  searchParamsPath
) {
  var decode =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var searchParamsObject = {};

  if (searchParamsPath) {
    var pairs = (
      searchParamsPath[0] === "?"
        ? searchParamsPath.substr(1)
        : searchParamsPath
    ).split("&");

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split("=");
      var key = pair[0];
      var value = pair[1] || "";
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

var SimplexRouter = /*#__PURE__*/ (function () {
  function SimplexRouter(routeTemplates, compileOptions) {
    _classCallCheck(this, SimplexRouter);

    if (!routeTemplates) {
      throw new Error("no 'route' or [routes]");
    }

    var options = _objectSpread(
      _objectSpread({}, defaultCompileOptions),
      compileOptions
    );

    var templates = (this.routeTemplates = Array.isArray(routeTemplates)
      ? routeTemplates
      : [routeTemplates]);
    var compiledRouteTemplates = (this.compiledRouteTemplates = []);

    for (
      var templateIndex = 0;
      templateIndex < templates.length;
      templateIndex++
    ) {
      var template = templates[templateIndex];
      var templatePath = options.templateKey
        ? options.templateKey(template)
        : typeof template === "string"
        ? template
        : null;

      if (!templatePath) {
        throw new Error("No Template Path");
      }

      var templateParameters = [];

      for (
        var compilerIndex = 0;
        compilerIndex < options.rules.length;
        compilerIndex++
      ) {
        var compiler = options.rules[compilerIndex];
        var compilerMatch = void 0;
        /**
         * Using if or const doesn't work here.
         *
         * @tutorial https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Finding_successive_matches
         */

        while ((compilerMatch = compiler.match.exec(templatePath))) {
          templateParameters.push({
            first: compilerMatch.index,
            last: compilerMatch.index + compilerMatch[0].length,
            key: compilerMatch[1],
            compileRegex: compiler,
          });
        }
      }

      templateParameters.sort(function (a, b) {
        return a.first - b.first;
      });
      var newRouteTemplate = ""; // parameters replaced with regular options

      var indexOfLastParameterized = 0;
      var lastUnParameterizedChunk = "";

      var _loop = function _loop(_templateCharacterIndex) {
        var templateParameterStart = templateParameters.find(function (i) {
          return i.first === _templateCharacterIndex;
        });

        if (templateParameterStart) {
          // this could be optimized to use '_last_un_parameterized_chunk'
          // because it should have the last chunk, that is why it is being cleared
          // in this 'if block'.
          var previousChunk = templatePath.slice(
            indexOfLastParameterized,
            templateParameterStart.first
          );
          var previousChunkSplit = previousChunk.split("?"); // break if there is a question mark meaning beginning of query string
          // it happens to be very unlikely this will ever catch a query string that is not
          // in a parameter because it will be caught in the 'else' statement below.
          // so, this just takes unnecessary memory and computation time that could be saved,BUR TESTING NEEDS TO BE DONE.

          if (previousChunkSplit.length > 1) {
            lastUnParameterizedChunk = previousChunkSplit[0]; //add the section before the question mark

            templateCharacterIndex = _templateCharacterIndex;
            return "break";
          }

          newRouteTemplate += quoteRegExp(previousChunk); // add previous chunk

          newRouteTemplate += templateParameterStart.compileRegex.use; // add current parameter regex

          indexOfLastParameterized = templateParameterStart.last;
          _templateCharacterIndex = templateParameterStart.last - 1; //we subtract one since we want the nest round of this loop to be the last index

          lastUnParameterizedChunk = ""; //last chunk is cleared because because parameter has been encountered
        } else {
          var templateCharacter = templatePath[_templateCharacterIndex];

          if (templateCharacter === "?") {
            templateCharacterIndex = _templateCharacterIndex;
            // if character is question mark, its a start of query string
            return "break";
          } else {
            lastUnParameterizedChunk += templateCharacter;
          }
        }

        templateCharacterIndex = _templateCharacterIndex;
      };

      for (
        var templateCharacterIndex = 0;
        templateCharacterIndex < templatePath.length;
        templateCharacterIndex++
      ) {
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
        compiledTemplate: new RegExp("^" + newRouteTemplate + "$"),
        template: template,
        templateParameterNames: templateParameters.map(function (i) {
          return i.key;
        }),
      });
    }
  }

  _createClass(SimplexRouter, [
    {
      key: "match",
      value: function match(pathToMatchTemplates, options) {
        options = Object.assign(
          {
            onlyFirstTemplate: false,
            decode: true,
          },
          options || {}
        );

        if (!pathToMatchTemplates) {
          if (options.onlyFirstTemplate) {
            return undefined;
          }

          return [];
        }

        var templateMatchResponses = [];
        var splitPathFromSearchParams = pathToMatchTemplates.split("?");
        var pathWithoutSearchParams = splitPathFromSearchParams[0];
        var searchParams = getSearchPathParameters(
          splitPathFromSearchParams[1],
          options.decode
        );

        for (
          var compiledRouteIndex = 0;
          compiledRouteIndex < this.compiledRouteTemplates.length;
          compiledRouteIndex++
        ) {
          var compiledRoute = this.compiledRouteTemplates[compiledRouteIndex];
          var pathForMatchVariants = [pathWithoutSearchParams]; // below conditions could probably be done by regex.

          if (pathWithoutSearchParams.endsWith("/")) {
            pathForMatchVariants.push(
              pathWithoutSearchParams.substring(
                0,
                pathWithoutSearchParams.length - 1
              )
            );
          }

          if (pathWithoutSearchParams.startsWith("/")) {
            pathForMatchVariants.push(
              pathWithoutSearchParams.substring(
                1,
                pathWithoutSearchParams.length
              )
            );
          }

          if (!pathWithoutSearchParams.endsWith("/")) {
            pathForMatchVariants.push(pathWithoutSearchParams + "/");
          }

          if (!pathWithoutSearchParams.startsWith("/")) {
            pathForMatchVariants.push("/" + pathWithoutSearchParams);
          }

          for (
            var pathForMatchVariantsIndex = 0;
            pathForMatchVariantsIndex < pathForMatchVariants.length;
            pathForMatchVariantsIndex++
          ) {
            var pathForMatchVariant =
              pathForMatchVariants[pathForMatchVariantsIndex];
            var pathForMatchVariantMatch =
              compiledRoute.compiledTemplate.exec(pathForMatchVariant);

            if (pathForMatchVariantMatch) {
              var templateMatchResponse = {
                params: {},
              };
              var params = {};

              for (
                var compiledRouteParamIndex = 0;
                compiledRouteParamIndex <
                compiledRoute.templateParameterNames.length;
                compiledRouteParamIndex++
              ) {
                var key =
                  compiledRoute.templateParameterNames[compiledRouteParamIndex];
                var value =
                  pathForMatchVariantMatch[compiledRouteParamIndex + 1] || "";
                key = options.decode ? decodeURIComponent(key) : key;
                value = options.decode ? decodeURIComponent(value) : value;
                templateMatchResponse.params[key] = value;
              }

              params = _objectSpread(
                _objectSpread({}, templateMatchResponse.params),
                searchParams
              );

              if (typeof compiledRoute.template === "string") {
                templateMatchResponse.template = compiledRoute.template;
                templateMatchResponse.params = params;
              } else {
                templateMatchResponse = _objectSpread(
                  _objectSpread({}, compiledRoute.template),
                  {
                    params: params,
                  }
                );
              }

              if (options.onlyFirstTemplate) {
                return templateMatchResponse;
              }

              templateMatchResponses.push(templateMatchResponse);
            }
          }
        }

        if (options.onlyFirstTemplate) {
          return undefined;
        }

        return templateMatchResponses;
      },
    },
    {
      key: "ROUTER",
      value: function ROUTER(routesToCompile, routesCompileOptions) {
        return new SimplexRouter(routesToCompile, routesCompileOptions);
      },
    },
  ]);

  return SimplexRouter;
})();

function _default(routesToCompile, routesCompileOptions) {
  return new SimplexRouter(routesToCompile, routesCompileOptions);
}
