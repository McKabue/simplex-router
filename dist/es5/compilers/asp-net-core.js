var compilers = [{
  from: /\{[\*](\w+)[^?]}/g,
  to: '(.+)'
}, {
  from: /\{[\*](\w+)\?}/g,
  to: '(.*)'
}, {
  from: /\{(\w+[^?])}/g,
  to: '([^/]+)'
}, {
  from: /\{(\w+)\?}/g,
  to: '([^/]*)'
}];
export default compilers;