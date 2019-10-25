"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArray = (data) => {
    return Object.prototype.toString.call(data) === '[object Array]';
};
exports.isNumber = (data) => {
    return Object.prototype.toString.call(data) === '[object Number]';
};
exports.isString = (data) => {
    return Object.prototype.toString.call(data) === '[object String]';
};
exports.isBoolean = (data) => {
    return Object.prototype.toString.call(data) === '[object Boolean]';
};
exports.isFunc = (data) => {
    return Object.prototype.toString.call(data) === '[object Function]';
};
exports.isObject = (data) => {
    return Object.prototype.toString.call(data) === '[object Object]';
};
exports.isNull = (data) => {
    return Object.prototype.toString.call(data) === '[object Null]';
};
exports.arrayLen = (data) => {
    return exports.isArray(data) && data.length;
};
exports.objectLen = (data) => {
    return exports.isObject(data) && Object.keys(data).length;
};
exports.isDate = (data) => {
    return !!data && new Date(data).toString() !== 'Invalid Date';
};
exports.verifyDate = (val) => {
    return exports.isArray(val) ? (exports.isDate(val[0]) && exports.isDate(val[1])) : exports.isDate(val);
};
exports.getLen = (val) => {
    return val && val.length;
};
exports.getObjLen = (val) => {
    return Object.keys(val).length;
};
exports.getNumLen = (val) => {
    return val;
};
exports.getType = (val) => {
    return (val && val.constructor.name.toLowerCase()) || 'string';
};
exports.typeOfS = {
    array: exports.isArray,
    object: exports.isObject,
    number: exports.isNumber,
    string: exports.isString,
    boolean: exports.isBoolean,
    date: exports.verifyDate
};
exports.getTypeLen = {
    array: exports.getLen,
    object: exports.getObjLen,
    number: exports.getNumLen,
    string: exports.getLen,
    date: exports.getLen
};
