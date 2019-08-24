export type TemplateParameterType = { [key: string]: string };

/**
 * If the template from @member CompiledRouteType.template 
 * is an object, this type will be extended with all the
 * members of that object.
 */
export type TemplateMatchResponseType = {
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

export type CompiledRouteType = {
    /**
     * Template could be string or object
     */
    template: {} | string;
    compiledTemplate: RegExp;
    templateParameterNames: string[];
};

export type CompilerType = { from: RegExp; to: string; }

export type CompileOptionsType = { compilers: CompilerType[]; routeKey?: Function; };