/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _bitMeddler = __webpack_require__(1);

var _bitMeddler2 = _interopRequireDefault(_bitMeddler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WIDTH = 480,
    HEIGHT = 360,
    BIT_DEPTH = 4; // 32-bit

var bm = new _bitMeddler2.default(WIDTH * HEIGHT);

var lctx = document.getElementById('cleft').getContext('2d');
var rctx = document.getElementById('cright').getContext('2d');

load_img_into_canvas(lctx, './img/homer_car_1_480px.jpg');
load_img_into_canvas(rctx, './img/homer_car_2_480px.jpg');

var timer = window.setInterval(fizzle, 50);

function fizzle() {
  var ldat = lctx.getImageData(0, 0, WIDTH, HEIGHT);
  var rdat = rctx.getImageData(0, 0, WIDTH, HEIGHT);

  var L = ldat.data,
      R = rdat.data;
  var o = void 0;

  for (var i = 0; i < 2000; i++) {
    o = bm.next();

    if (o == null) break;

    o *= BIT_DEPTH; // AGBR; = 4 bytes

    var la = L[o + 0];
    var lg = L[o + 1];
    var lb = L[o + 2];
    var lr = L[o + 3];

    L[o + 0] = R[o + 0];
    L[o + 1] = R[o + 1];
    L[o + 2] = R[o + 2];
    L[o + 3] = R[o + 3];

    R[o + 0] = la;
    R[o + 1] = lg;
    R[o + 2] = lb;
    R[o + 3] = lr;
  }

  lctx.putImageData(ldat, 0, 0);
  rctx.putImageData(rdat, 0, 0);

  if (o == null) {
    window.clearInterval(timer);

    window.setTimeout(function () {
      bm.reset(); // reset bit-meddler for another pass!
      timer = window.setInterval(fizzle, 50);
    }, 2000);
  }
}

function load_img_into_canvas(ctx, file) {
  var img1 = new Image();
  img1.onload = function () {
    ctx.drawImage(img1, 0, 0);
  };
  img1.src = file;
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = bitmeddler;

var INT_MAX = 2147483647;

var ITSAKINDOFMAGIC = [
  0x3,0x6,0x9,0x1D,0x36,0x69,0xA6, // 2 to 8
  0x17C,0x32D,0x4F2,0xD34,0x1349,0x2532,0x6699,0xD295, // 9 - 16
  0x12933,0x2C93E,0x593CA,0xAFF95,0x12B6BC,0x2E652E,0x5373D6,0x9CCDAE, // etc
  0x12BA74D,0x36CD5A7,0x4E5D793,0xF5CDE95,0x1A4E6FF2,0x29D1E9EB,0x7A5BC2E3,0xB4BCD35C
];

function bitmeddler(maximum, seed)
{
  if (maximum < 2 || maximum > INT_MAX)
    throw "`maximum` must be between 2 and " + INT_MAX + " inclusive";

  this.maximum = maximum;
  this.start = (seed || 1) % maximum;
  this.cur = this.start;
  this.MASK = ITSAKINDOFMAGIC[ this._msb( this.maximum ) - 2 ];
  this.next = this._next;
}

bitmeddler.prototype = {

  _next: function()
  {
    do {
      this.cur = (this.cur & 1) ? this.cur = (this.cur >> 1) ^ this.MASK :
                                  this.cur >>= 1;
    } while( this.cur > this.maximum );

    if ( this.cur === this.start )
      this.next = this._done;

    return this.cur;
  },

  _done: function()
  {
    return null;
  },

  reset: function()
  {
    this.next = this._next;
    this.cur = this.start;
  },

  all: function()
  {
    this.reset();
    var o = [], v;
    while(v = this.next())
      o.push(v);
    return o;
  },

  _msb: function(v)
  {
    var r = 0;
    while (v) { v >>=1; r++; }
    return r;
  }

};


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNThkOWFlMWYxM2IwZWEzNjEzMjMiLCJ3ZWJwYWNrOi8vLy4vbWFpbi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYml0LW1lZGRsZXIvbWFpbi5qcyJdLCJuYW1lcyI6WyJXSURUSCIsIkhFSUdIVCIsIkJJVF9ERVBUSCIsImJtIiwibGN0eCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJnZXRDb250ZXh0IiwicmN0eCIsImxvYWRfaW1nX2ludG9fY2FudmFzIiwidGltZXIiLCJ3aW5kb3ciLCJzZXRJbnRlcnZhbCIsImZpenpsZSIsImxkYXQiLCJnZXRJbWFnZURhdGEiLCJyZGF0IiwiTCIsImRhdGEiLCJSIiwibyIsImkiLCJuZXh0IiwibGEiLCJsZyIsImxiIiwibHIiLCJwdXRJbWFnZURhdGEiLCJjbGVhckludGVydmFsIiwic2V0VGltZW91dCIsInJlc2V0IiwiY3R4IiwiZmlsZSIsImltZzEiLCJJbWFnZSIsIm9ubG9hZCIsImRyYXdJbWFnZSIsInNyYyJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7O0FDNURBOzs7Ozs7QUFFQSxJQUFNQSxRQUFRLEdBQWQ7QUFBQSxJQUFtQkMsU0FBUyxHQUE1QjtBQUFBLElBQWlDQyxZQUFZ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QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUSxLQUFLO0FBQzVCO0FBQ0E7O0FBRUEiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNThkOWFlMWYxM2IwZWEzNjEzMjMiLCJcbmltcG9ydCBiaXRtZWRkbGVyIGZyb20gJ2JpdC1tZWRkbGVyJztcblxuY29uc3QgV0lEVEggPSA0ODAsIEhFSUdIVCA9IDM2MCwgQklUX0RFUFRIID0gNDsgLy8gMzItYml0XG5cbmNvbnN0IGJtID0gbmV3IGJpdG1lZGRsZXIoV0lEVEggKiBIRUlHSFQpO1xuXG5sZXQgbGN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGVmdCcpLmdldENvbnRleHQoJzJkJyk7XG5sZXQgcmN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjcmlnaHQnKS5nZXRDb250ZXh0KCcyZCcpO1xuXG5sb2FkX2ltZ19pbnRvX2NhbnZhcyhsY3R4LCAnLi9pbWcvaG9tZXJfY2FyXzFfNDgwcHguanBnJyk7XG5sb2FkX2ltZ19pbnRvX2NhbnZhcyhyY3R4LCAnLi9pbWcvaG9tZXJfY2FyXzJfNDgwcHguanBnJyk7XG5cblxubGV0IHRpbWVyID0gd2luZG93LnNldEludGVydmFsKGZpenpsZSwgNTApO1xuXG5cbmZ1bmN0aW9uIGZpenpsZSgpXG57XG4gIGxldCBsZGF0ID0gbGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgV0lEVEgsIEhFSUdIVCk7XG4gIGxldCByZGF0ID0gcmN0eC5nZXRJbWFnZURhdGEoMCwgMCwgV0lEVEgsIEhFSUdIVCk7XG5cbiAgbGV0IEwgPSBsZGF0LmRhdGEsIFIgPSByZGF0LmRhdGE7XG4gIGxldCBvO1xuXG4gIGZvciAobGV0IGk9MDsgaTwyMDAwOyBpKyspXG4gIHtcbiAgICBvID0gYm0ubmV4dCgpO1xuXG4gICAgaWYgKG8gPT0gbnVsbClcbiAgICAgIGJyZWFrO1xuXG4gICAgIG8gKj0gQklUX0RFUFRIOyAvLyBBR0JSOyA9IDQgYnl0ZXNcblxuICAgIGxldCBsYSA9IExbbyArIDBdO1xuICAgIGxldCBsZyA9IExbbyArIDFdO1xuICAgIGxldCBsYiA9IExbbyArIDJdO1xuICAgIGxldCBsciA9IExbbyArIDNdO1xuXG4gICAgTFtvICsgMF0gPSBSW28gKyAwXTtcbiAgICBMW28gKyAxXSA9IFJbbyArIDFdO1xuICAgIExbbyArIDJdID0gUltvICsgMl07XG4gICAgTFtvICsgM10gPSBSW28gKyAzXTtcblxuICAgIFJbbyArIDBdID0gbGE7XG4gICAgUltvICsgMV0gPSBsZztcbiAgICBSW28gKyAyXSA9IGxiO1xuICAgIFJbbyArIDNdID0gbHI7XG4gIH1cblxuICBsY3R4LnB1dEltYWdlRGF0YShsZGF0LCAwLCAwKTtcbiAgcmN0eC5wdXRJbWFnZURhdGEocmRhdCwgMCwgMCk7XG5cbiAgaWYgKG8gPT0gbnVsbClcbiAge1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRpbWVyKTtcblxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgYm0ucmVzZXQoKTsgLy8gcmVzZXQgYml0LW1lZGRsZXIgZm9yIGFub3RoZXIgcGFzcyFcbiAgICAgICAgdGltZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZml6emxlLCA1MCk7XG4gICAgfSwgMjAwMCk7XG5cbiAgfVxufVxuXG5cblxuZnVuY3Rpb24gbG9hZF9pbWdfaW50b19jYW52YXMoY3R4LCBmaWxlKVxue1xuICBsZXQgaW1nMSA9IG5ldyBJbWFnZSgpO1xuICBpbWcxLm9ubG9hZCA9ICgpID0+IHtcbiAgICBjdHguZHJhd0ltYWdlKGltZzEsIDAsIDApO1xuICB9XG4gIGltZzEuc3JjID0gZmlsZTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL21haW4uanMiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gYml0bWVkZGxlcjtcblxudmFyIElOVF9NQVggPSAyMTQ3NDgzNjQ3O1xuXG52YXIgSVRTQUtJTkRPRk1BR0lDID0gW1xuICAweDMsMHg2LDB4OSwweDFELDB4MzYsMHg2OSwweEE2LCAvLyAyIHRvIDhcbiAgMHgxN0MsMHgzMkQsMHg0RjIsMHhEMzQsMHgxMzQ5LDB4MjUzMiwweDY2OTksMHhEMjk1LCAvLyA5IC0gMTZcbiAgMHgxMjkzMywweDJDOTNFLDB4NTkzQ0EsMHhBRkY5NSwweDEyQjZCQywweDJFNjUyRSwweDUzNzNENiwweDlDQ0RBRSwgLy8gZXRjXG4gIDB4MTJCQTc0RCwweDM2Q0Q1QTcsMHg0RTVENzkzLDB4RjVDREU5NSwweDFBNEU2RkYyLDB4MjlEMUU5RUIsMHg3QTVCQzJFMywweEI0QkNEMzVDXG5dO1xuXG5mdW5jdGlvbiBiaXRtZWRkbGVyKG1heGltdW0sIHNlZWQpXG57XG4gIGlmIChtYXhpbXVtIDwgMiB8fCBtYXhpbXVtID4gSU5UX01BWClcbiAgICB0aHJvdyBcImBtYXhpbXVtYCBtdXN0IGJlIGJldHdlZW4gMiBhbmQgXCIgKyBJTlRfTUFYICsgXCIgaW5jbHVzaXZlXCI7XG5cbiAgdGhpcy5tYXhpbXVtID0gbWF4aW11bTtcbiAgdGhpcy5zdGFydCA9IChzZWVkIHx8IDEpICUgbWF4aW11bTtcbiAgdGhpcy5jdXIgPSB0aGlzLnN0YXJ0O1xuICB0aGlzLk1BU0sgPSBJVFNBS0lORE9GTUFHSUNbIHRoaXMuX21zYiggdGhpcy5tYXhpbXVtICkgLSAyIF07XG4gIHRoaXMubmV4dCA9IHRoaXMuX25leHQ7XG59XG5cbmJpdG1lZGRsZXIucHJvdG90eXBlID0ge1xuXG4gIF9uZXh0OiBmdW5jdGlvbigpXG4gIHtcbiAgICBkbyB7XG4gICAgICB0aGlzLmN1ciA9ICh0aGlzLmN1ciAmIDEpID8gdGhpcy5jdXIgPSAodGhpcy5jdXIgPj4gMSkgXiB0aGlzLk1BU0sgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VyID4+PSAxO1xuICAgIH0gd2hpbGUoIHRoaXMuY3VyID4gdGhpcy5tYXhpbXVtICk7XG5cbiAgICBpZiAoIHRoaXMuY3VyID09PSB0aGlzLnN0YXJ0IClcbiAgICAgIHRoaXMubmV4dCA9IHRoaXMuX2RvbmU7XG5cbiAgICByZXR1cm4gdGhpcy5jdXI7XG4gIH0sXG5cbiAgX2RvbmU6IGZ1bmN0aW9uKClcbiAge1xuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIHJlc2V0OiBmdW5jdGlvbigpXG4gIHtcbiAgICB0aGlzLm5leHQgPSB0aGlzLl9uZXh0O1xuICAgIHRoaXMuY3VyID0gdGhpcy5zdGFydDtcbiAgfSxcblxuICBhbGw6IGZ1bmN0aW9uKClcbiAge1xuICAgIHRoaXMucmVzZXQoKTtcbiAgICB2YXIgbyA9IFtdLCB2O1xuICAgIHdoaWxlKHYgPSB0aGlzLm5leHQoKSlcbiAgICAgIG8ucHVzaCh2KTtcbiAgICByZXR1cm4gbztcbiAgfSxcblxuICBfbXNiOiBmdW5jdGlvbih2KVxuICB7XG4gICAgdmFyIHIgPSAwO1xuICAgIHdoaWxlICh2KSB7IHYgPj49MTsgcisrOyB9XG4gICAgcmV0dXJuIHI7XG4gIH1cblxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2JpdC1tZWRkbGVyL21haW4uanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==