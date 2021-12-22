import { RuleType } from "../types";

const rules: RuleType[] = [
  {
    match: new RegExp(`{[*](\\w+)[^?]}`, "g"), // catches {*param} https://regex101.com/r/gVZG3f/2
    use: "(.+)",
    test: `ewfwefe/{*fhgef_efefh}`,
  },
  {
    match: /\{[\*](\w+)\?}/g, // catches {*param?} https://regex101.com/r/8rtbCm/1
    use: "(.*)",
    test: `ewfwefe/{*fhgef_efefh?}`,
  },
  {
    match: /\{(\w+[^?])}/g, // catches {param} https://regex101.com/r/gT8wK5/749
    use: "([^/]+)",
    test: `ewfwefe/{fhgef_efefh}`,
  },
  {
    match: /\{(\w+)\?}/g, // catches {param?} https://regex101.com/r/gVZG3f/5
    use: "([^/]*)",
    test: `ewfwefe/{fhgef_efefh?}`,
  },
];

export default rules;
