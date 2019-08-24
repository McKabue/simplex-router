type TemplateParameterType = { [key: string]: string };

/**
 * If the template from @member CompiledRouteType.template 
 * is an object, this type will be extended with all the
 * members of that object.
 */
type TemplateMatchResponseType = {
    params: TemplateParameterType,
    /**
     * This is for routes that are passed as strings.
     */
    template?: string;
} |
    /**
     * @type TemplateMatchResponseType can be null
     */
    any;

type CompiledRouteType = {
    /**
     * Template could be string or object
     */
    template: {} | string;
    compiledTemplate: RegExp;
    templateParameterNames: string[];
};

type CompilerType = { from: RegExp; to: string; }

type CompileOptionsType = { compilers: CompilerType[]; routeKey?: Function; };




/**
 * Quotes regular expression in a string.
 * 
 * @param value ~ value whose regular expression is to be quoted
 * 
 * @returns string
 */
const quoteRegExp = (value: string): string => {
    return value.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
};
const defaultCompileOptions: CompileOptionsType = {
    compilers: [{
        from: /\{[\*](\w+)[^?]}/g, // catches {*param} https://regex101.com/r/gT8wK5/749 , https://regex101.com/r/gVZG3f/2
        to: '(.+)'
    },
    {
        from: /\{[\*](\w+)\?}/g, // catches {*param?} https://regex101.com/r/8rtbCm/1
        to: '(.*)'
    },
    {
        from: /\{(\w+[^?])}/g, // catches {param} https://regex101.com/r/gVZG3f/5
        to: '([^/]+)'
    },
    {
        from: /\{(\w+)\?}/g, // catches {param?} https://regex101.com/r/gVZG3f/5
        to: '([^/]*)'
    }]
};
const getSearchPathParameters = (searchParamsPath: string): TemplateParameterType => {
    const searchParamsObject: TemplateParameterType = {};
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

export interface ISimplexRouter {
    match(pathToMatchRoutes: string, returnFirstMatchedRoute?: boolean): TemplateMatchResponseType[] | TemplateMatchResponseType;
    ROUTER(routesToCompile: string[] | string, routesCompileOptions?: CompileOptionsType): ISimplexRouter;
}

class SimplexRouter implements ISimplexRouter {
    routeTemplates: any[];
    compiledRouteTemplates: CompiledRouteType[];
    constructor(routeTemplates: any[] | any, compileOptions?: CompileOptionsType) {
        if (!routeTemplates) {
            throw new Error("no 'route' or [routes]");
        }

        const options: CompileOptionsType = { ...defaultCompileOptions, ...compileOptions };
        const templates: any[] = this.routeTemplates = Array.isArray(routeTemplates) ? routeTemplates : [routeTemplates];

        const compiledRouteTemplates: CompiledRouteType[] = this.compiledRouteTemplates = [];

        for (let templateIndex = 0; templateIndex < templates.length; templateIndex++) {
            const template: any = templates[templateIndex];
            const templatePath: string = options.routeKey ? options.routeKey(template) : template;

            const templateParameters: {
                first: number,
                last: number,
                key: string,
                compileRegex: CompilerType
            }[] = [];

            for (let compilerIndex = 0; compilerIndex < options.compilers.length; compilerIndex++) {
                const compiler: CompilerType = options.compilers[compilerIndex];
                let compilerMatch: RegExpExecArray | any;
                /**
                 * Using if or const doesn't work here.
                 * 
                 * @tutorial https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Finding_successive_matches
                 */
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

            let newRouteTemplate = ''; // parameters replaced with regular options
            let indexOfLastParameterized = 0;
            let lastUnParameterizedChunk = '';
            for (let templateCharacterIndex = 0; templateCharacterIndex < templatePath.length; templateCharacterIndex++) {
                const templateParameterStart = templateParameters.find(i => i.first === templateCharacterIndex);

                if (templateParameterStart) {
                    // this could be optimized to use '_last_un_parameterized_chunk'
                    // because it should have the last chunk, that is why it is being cleared
                    // in this 'if block'.
                    const previousChunk = templatePath.slice(indexOfLastParameterized, templateParameterStart.first);
                    const previousChunkSplit = previousChunk.split('?');
                    // break if there is a question mark meaning beginning of query string
                    // it happens to be very unlikely this will ever catch a query string that is not
                    // in a parameter because it will be caught in the 'else' statement below.
                    // so, this just takes unnecessary memory and computation time that could be saved,BUR TESTING NEEDS TO BE DONE.
                    if (previousChunkSplit.length > 1) {
                        lastUnParameterizedChunk = previousChunkSplit[0]; //add the section before the question mark
                        break;
                    }
                    newRouteTemplate += quoteRegExp(previousChunk); // add previous chunk
                    newRouteTemplate += templateParameterStart.compileRegex.to; // add current parameter regex
                    indexOfLastParameterized = templateParameterStart.last;
                    templateCharacterIndex = templateParameterStart.last - 1; //we subtract one since we want the nest round of this loop to be the last index
                    lastUnParameterizedChunk = ''; //last chunk is cleared because because parameter has been encountered
                } else {
                    const templateCharacter = templatePath[templateCharacterIndex];
                    if (templateCharacter === '?') { // if character is question mark, its a start of query string
                        break;
                    }
                    else {
                        lastUnParameterizedChunk += templateCharacter;
                    }
                }
            }

            //if the last parameterized index is smaller than route length,
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
                templateParameterNames: templateParameters.map(i => i.key)
            });
        }
    }
    match(pathToMatchRoutes: string, returnFirstMatchedRoute?: false): TemplateMatchResponseType[] | TemplateMatchResponseType {
        const templateMatchResponses: TemplateMatchResponseType[] = [];
        const splitPathFromSearchParams: string[] = pathToMatchRoutes.split('?');
        const pathWithoutSearchParams: string = splitPathFromSearchParams[0];
        const searchParams = getSearchPathParameters(splitPathFromSearchParams[1]);

        for (let compiledRouteIndex = 0; compiledRouteIndex < this.compiledRouteTemplates.length; compiledRouteIndex++) {
            const compiledRoute = this.compiledRouteTemplates[compiledRouteIndex];
            const pathForMatchVariants = [pathWithoutSearchParams];

            // below conditions could probably be done by regex.
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
                let pathForMatchVariant = pathForMatchVariants[pathForMatchVariantsIndex],
                    pathForMatchVariantMatch = (compiledRoute.compiledTemplate).exec(pathForMatchVariant);

                if (pathForMatchVariantMatch) {
                    let templateMatchResponse: TemplateMatchResponseType = { params: {} };
                    let params: TemplateParameterType = {};

                    for (let compiledRouteParamIndex = 0; compiledRouteParamIndex < compiledRoute.templateParameterNames.length; compiledRouteParamIndex++) {
                        templateMatchResponse.params[compiledRoute.templateParameterNames[compiledRouteParamIndex]] = decodeURIComponent((pathForMatchVariantMatch[(compiledRouteParamIndex + 1)] || ''));
                    }

                    params = { ...templateMatchResponse.params, ...searchParams };

                    if (typeof compiledRoute.template === 'string') {
                        templateMatchResponse.template = compiledRoute.template;
                    } else {
                        templateMatchResponse = { ...compiledRoute.template, ...templateMatchResponse };
                    }

                    if (returnFirstMatchedRoute) {
                        return templateMatchResponse;
                    }

                    templateMatchResponses.push(templateMatchResponse);
                }
            }
        }

        if (returnFirstMatchedRoute) {
            var d: TemplateMatchResponseType = undefined;
            return d;
        }

        return templateMatchResponses;
    }
    ROUTER(
        routesToCompile: string[] | string,
        routesCompileOptions?: CompileOptionsType):
        ISimplexRouter {
        return new SimplexRouter(routesToCompile, routesCompileOptions);
    }
}

export default function (
    routesToCompile: string[] | string,
    routesCompileOptions?: CompileOptionsType):
    ISimplexRouter {
    return new SimplexRouter(routesToCompile, routesCompileOptions);
};