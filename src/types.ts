export type TemplateParameterType = { [key: string]: string };

/**
 * If the template from @member CompiledRouteType.template
 * is an object, this type will be extended with all the
 * members of that object.
 */
export type TemplateMatchResponseType =
  | {
      params: TemplateParameterType;
      /**
       * This is for routes that are passed as strings.
       */
      template?: string;
    }
  /**
   * @type TemplateMatchResponseType can be null
   */
  | any;

export type CompiledRouteType = {
  /**
   * Template could be string or object
   */
  template: {} | string;
  compiledTemplate: RegExp;
  templateParameterNames: string[];
};

/**
 * @tutorial https://stackoverflow.com/a/51448473/3563013
 * @tutorial https://github.com/Microsoft/TypeScript/issues/6579
 */
export type RuleType = {
  match: RegExp;
  use: string;
  test: string;
};

export type CompileOptionsType = {
  rules?: RuleType[];
  templateKey?: (item: any) => string;
};
