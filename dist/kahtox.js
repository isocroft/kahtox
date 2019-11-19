/**!
@version: 0.1.1
@created: 18th Nov, 2019
*/
'use strict';

exports.__esModule = true;
exports.default = void 0;

function _typeof(obj) { return _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function _typeof(obj) { return typeof obj; } : function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var isLiteralFalsey = function isLiteralFalsey(variable) {
  return variable === "" || variable === false || variable === 0;
};

var checkTypeName = function checkTypeName(target, type) {
  var typeName = "";
  return typeName = isLiteralFalsey(target) ? _typeof(target) : "" + (target && target.constructor.name), !!(typeName.toLowerCase().indexOf(type) + 1);
};

var strictTypeOf = function strictTypeOf(value, type) {
  var result = false;

  if (type = type || [], _typeof(type) === 'object') {
    if (typeof type.length !== 'number') return result;
    var bitPiece = 0;
    type = [].slice.call(type), type.forEach(function (_type) {
      typeof _type === 'function' && (_type = (_type.name || _type.displayName).toLowerCase()), bitPiece |= 1 * checkTypeName(value, _type);
    }), result = !!bitPiece;
  } else typeof type === 'function' && (type = (type.name || type.displayName).toLowerCase()), result = checkTypeName(value, type);

  return result;
};

var isFunction = function isFunction(value) {
  return strictTypeOf(value, 'function');
};

var isError = function isError(value) {
  return strictTypeOf(value, 'error');
};

var isString = function isString(value) {
  return strictTypeOf(value, 'string');
};

var isPlainObject = function isPlainObject(value) {
  return strictTypeOf(value, 'object');
};

var isNull = function isNull(value) {
  return strictTypeOf(value, 'null');
};

var isUndefined = function isUndefined(value) {
  return strictTypeOf(value, 'undefined');
};

var Grapher =
/*#__PURE__*/
function () {
  function Grapher(graph, wrapperFn) {
    this.states = graph.states, this.prevState = null, this.initial = this.currentState = graph.$initial, this.domainStateLayerWrapperFn = wrapperFn, this.transitionHandler = null;
  }

  var _proto = Grapher.prototype;
  return _proto.dispatch = function dispatch(transitionEventName, domainLayerData) {
    var _this = this;

    transitionEventName === void 0 && (transitionEventName = ''), domainLayerData === void 0 && (domainLayerData = null);
    var grapherEvents = this.states[this.currentState] || {}; // grab all possible actions under this 'current state'

    var transitionMeta = grapherEvents[transitionEventName]; // grab the data state layer action we are interested in for this current 'dispatch'

    var hasAction = false;

    var nextState = function nextState(state) {
      _this.prevState = _this.currentState, _this.currentState = state;
      var canNotify = _this.currentState !== _this.initial;
      canNotify |= Boolean(transitionMeta.notifyView), isFunction(_this.transitionHandler) && Boolean(canNotify) && _this.transitionHandler(state, hasAction ? null : domainLayerData, !hasAction && isError(domainLayerData));
    };

    isNull(transitionMeta) && isUndefined(transitionMeta) || !isPlainObject(transitionMeta) ? isPlainObject(console) && isFunction(console.error) && console.error("Invalid State Transition For State Graph: from '" + this.currentState + "'") : (hasAction = isString(transitionMeta.action), (!isFunction(transitionMeta.guard) || transitionMeta.guard({
      payload: domainLayerData
    }) === true) && nextState(transitionMeta.nextState), hasAction && this.domainStateLayerWrapperFn(transitionMeta.action, {
      payload: domainLayerData,
      grapher: this,
      meta: transitionMeta
    }));
  }, _proto.afterTransition = function afterTransition(callback) {
    this.transitionHandler = callback;
  }, Grapher;
}();

var kahtox = {
  makeGrapher: function makeGrapher(graph, wrapperFn) {
    return !isPlainObject(graph) && (graph = {
      $initial: 'start',
      states: {}
    }), !isFunction(wrapperFn) && (wrapperFn = function wrapperFn() {
      return true;
    }), new Grapher(graph, wrapperFn);
  }
};
var _default = kahtox;
exports.default = _default;
