const rules = [
  {
    match: new RegExp(`{[*](\\w+)[^?]}`, "g"),
    use: "(.+)",
    test: `ewfwefe/{*fhgef_efefh}`,
  },
  {
    match: /\{[\*](\w+)\?}/g,
    use: "(.*)",
    test: `ewfwefe/{*fhgef_efefh?}`,
  },
  {
    match: /\{(\w+[^?])}/g,
    use: "([^/]+)",
    test: `ewfwefe/{fhgef_efefh}`,
  },
  {
    match: /\{(\w+)\?}/g,
    use: "([^/]*)",
    test: `ewfwefe/{fhgef_efefh?}`,
  },
];
export default rules;
