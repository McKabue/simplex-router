import aspNetCoreCompilers from './compilers/asp-net-core';
const quoteRegExp = (value) => {
    return value.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
};
const defaultCompileOptions = {
    compilers: aspNetCoreCompilers
};
const getSearchPathParameters = (searchParamsPath) => {
    const searchParamsObject = {};
    if (searchParamsPath) {
        const urlSearchParams = new URLSearchParams(searchParamsPath);
        urlSearchParams.forEach((value, key) => {
            if (!searchParamsObject[key]) {
                searchParamsObject[key] = value;
            }
        });
    }
    return searchParamsObject;
};
class SimplexRouter {
    constructor(routeTemplates, compileOptions) {
        if (!routeTemplates) {
            throw new Error("no 'route' or [routes]");
        }
        const options = Object.assign(Object.assign({}, defaultCompileOptions), compileOptions);
        const templates = this.routeTemplates = Array.isArray(routeTemplates) ? routeTemplates : [routeTemplates];
        const compiledRouteTemplates = this.compiledRouteTemplates = [];
        for (let templateIndex = 0; templateIndex < templates.length; templateIndex++) {
            const template = templates[templateIndex];
            const templatePath = options.routeKey ? options.routeKey(template) : template;
            const templateParameters = [];
            for (let compilerIndex = 0; compilerIndex < options.compilers.length; compilerIndex++) {
                const compiler = options.compilers[compilerIndex];
                let compilerMatch;
                while ((compilerMatch = (compiler.from.exec(templatePath)))) {
                    templateParameters.push({
                        first: compilerMatch.index,
                        last: compilerMatch.index + compilerMatch[0].length,
                        key: compilerMatch[1],
                        compileRegex: compiler
                    });
                }
            }
            templateParameters.sort((a, b) => a.first - b.first);
            let newRouteTemplate = '';
            let indexOfLastParameterized = 0;
            let lastUnParameterizedChunk = '';
            for (let templateCharacterIndex = 0; templateCharacterIndex < templatePath.length; templateCharacterIndex++) {
                const templateParameterStart = templateParameters.find(i => i.first === templateCharacterIndex);
                if (templateParameterStart) {
                    const previousChunk = templatePath.slice(indexOfLastParameterized, templateParameterStart.first);
                    const previousChunkSplit = previousChunk.split('?');
                    if (previousChunkSplit.length > 1) {
                        lastUnParameterizedChunk = previousChunkSplit[0];
                        break;
                    }
                    newRouteTemplate += quoteRegExp(previousChunk);
                    newRouteTemplate += templateParameterStart.compileRegex.to;
                    indexOfLastParameterized = templateParameterStart.last;
                    templateCharacterIndex = templateParameterStart.last - 1;
                    lastUnParameterizedChunk = '';
                }
                else {
                    const templateCharacter = templatePath[templateCharacterIndex];
                    if (templateCharacter === '?') {
                        break;
                    }
                    else {
                        lastUnParameterizedChunk += templateCharacter;
                    }
                }
            }
            if (indexOfLastParameterized < templatePath.length) {
                newRouteTemplate += quoteRegExp(lastUnParameterizedChunk);
            }
            compiledRouteTemplates.push({
                compiledTemplate: new RegExp('^' + newRouteTemplate + '$'),
                template: template,
                templateParameterNames: templateParameters.map(i => i.key)
            });
        }
    }
    match(pathToMatchRoutes, returnFirstMatchedRoute) {
        const templateMatchResponses = [];
        const splitPathFromSearchParams = pathToMatchRoutes.split('?');
        const pathWithoutSearchParams = splitPathFromSearchParams[0];
        const searchParams = getSearchPathParameters(splitPathFromSearchParams[1]);
        for (let compiledRouteIndex = 0; compiledRouteIndex < this.compiledRouteTemplates.length; compiledRouteIndex++) {
            const compiledRoute = this.compiledRouteTemplates[compiledRouteIndex];
            const pathForMatchVariants = [pathWithoutSearchParams];
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
            for (let pathForMatchVariantsIndex = 0; pathForMatchVariantsIndex < pathForMatchVariants.length; pathForMatchVariantsIndex++) {
                let pathForMatchVariant = pathForMatchVariants[pathForMatchVariantsIndex], pathForMatchVariantMatch = (compiledRoute.compiledTemplate).exec(pathForMatchVariant);
                if (pathForMatchVariantMatch) {
                    let templateMatchResponse = { params: {} };
                    let params = {};
                    for (let compiledRouteParamIndex = 0; compiledRouteParamIndex < compiledRoute.templateParameterNames.length; compiledRouteParamIndex++) {
                        templateMatchResponse.params[compiledRoute.templateParameterNames[compiledRouteParamIndex]] = decodeURIComponent((pathForMatchVariantMatch[(compiledRouteParamIndex + 1)] || ''));
                    }
                    params = Object.assign(Object.assign({}, templateMatchResponse.params), searchParams);
                    if (typeof compiledRoute.template === 'string') {
                        templateMatchResponse.template = compiledRoute.template;
                    }
                    else {
                        templateMatchResponse = Object.assign(Object.assign({}, compiledRoute.template), templateMatchResponse);
                    }
                    if (returnFirstMatchedRoute) {
                        return templateMatchResponse;
                    }
                    templateMatchResponses.push(templateMatchResponse);
                }
            }
        }
        if (returnFirstMatchedRoute) {
            var d = undefined;
            return d;
        }
        return templateMatchResponses;
    }
    ROUTER(routesToCompile, routesCompileOptions) {
        return new SimplexRouter(routesToCompile, routesCompileOptions);
    }
}
export default function (routesToCompile, routesCompileOptions) {
    return new SimplexRouter(routesToCompile, routesCompileOptions);
}
;
