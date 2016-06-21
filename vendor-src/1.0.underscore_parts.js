var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
var _toString = Object.prototype.toString;

var property = function (key) {
    return function (obj) {
        return obj == null ? void 0 : obj[key];
    };
};

var getLength = property('length');

var isArrayLike = function (obj) {
    var length = getLength(obj);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};

_.isArray = function (obj) {
    return _toString.call(obj) === '[object Array]';
};

_.isObject = function (obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

_.isString = function (s) {
    return typeof s === 'string'
};

_.isEmpty = function (obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
};

_.extend = function () {
    var destination = arguments[0] || {};
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        if (source) {
            for (var property in source) {
                if (source.hasOwnProperty(property)) {
                    destination[property] = source[property];
                }
            }
        }
    }
    return destination;
};

_.clone = function (obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
};

