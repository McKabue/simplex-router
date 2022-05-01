"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _router = require("./router");

var _default = function _default(routesToCompile, routesCompileOptions) {
  return new _router.SimplexRouter(routesToCompile, routesCompileOptions);
};

exports["default"] = _default;