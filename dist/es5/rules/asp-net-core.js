"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var rules = [{
  // catches {*param} https://regex101.com/r/gVZG3f/2
  match: new RegExp('{[*](\\w+)[^?]}', 'g'),
  use: '(.+)',
  test: 'ewfwefe/{*fhgef_efefh}'
}, {
  // catches {*param?} https://regex101.com/r/8rtbCm/1
  // eslint-disable-next-line no-useless-escape
  match: /\{[\*](\w+)\?}/g,
  use: '(.*)',
  test: 'ewfwefe/{*fhgef_efefh?}'
}, {
  // catches {param} https://regex101.com/r/gT8wK5/749
  match: /\{(\w+[^?])}/g,
  use: '([^/]+)',
  test: 'ewfwefe/{fhgef_efefh}'
}, {
  // catches {param?} https://regex101.com/r/gVZG3f/5
  match: /\{(\w+)\?}/g,
  use: '([^/]*)',
  test: 'ewfwefe/{fhgef_efefh?}'
}];
var _default = rules;
exports["default"] = _default;