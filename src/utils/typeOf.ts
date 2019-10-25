export const isArray = (data: any): boolean => {
    return Object.prototype.toString.call(data) === '[object Array]'
}

export const isNumber = (data: any): boolean => {
    return Object.prototype.toString.call(data) === '[object Number]'
}

export const isString = (data: any): boolean => {
    return Object.prototype.toString.call(data) === '[object String]'
}

export const isBoolean = (data: any): boolean => {
    return Object.prototype.toString.call(data) === '[object Boolean]'
}

export const isFunc = (data: any): boolean => {
    return Object.prototype.toString.call(data) === '[object Function]'
}

export const isObject = (data: any): boolean => {
    return Object.prototype.toString.call(data) === '[object Object]'
}

export const isNull = (data: any): boolean => {
    return Object.prototype.toString.call(data) === '[object Null]'
}

export const arrayLen = (data: any[]): number => {
    return isArray(data) && data.length
}

export const objectLen = (data: object): number => {
    return isObject(data) && Object.keys(data).length
}

export const isDate = (data: string): boolean => {
    return !!data && new Date(data).toString() !== 'Invalid Date'
}

export const verifyDate = (val: string): boolean => {
    return isArray(val) ? (isDate(val[0]) && isDate(val[1])) : isDate(val)
}

export const getLen = (val: string | any[]): number => {
    return val && val.length
}
export const getObjLen = (val: object): number => {
    return Object.keys(val).length
}
export const getNumLen = (val: number): number => {
    return val
}

export const getType = (val): string => {
    return (val && val.constructor.name.toLowerCase()) || 'string'
}

interface TypeOfS {
    array: (data: any) => boolean;
    object: (data: any) => boolean;
    number: (data: any) => boolean;
    string: (data: any) => boolean;
    boolean: (data: any) => boolean;
    date: (data: any) => boolean;
}

interface GetTypeLen {
    array: (data: string | any[]) => number;
    object: (data: object) => number
    number: (data: number) => number;
    string: (data: string | any[]) => number;
    date: (data: string | any[]) => number;
}

export const typeOfS: TypeOfS = {
    array: isArray,
    object: isObject,
    number: isNumber,
    string: isString,
    boolean: isBoolean,
    date: verifyDate
}

export const getTypeLen: GetTypeLen = {
    array: getLen,
    object: getObjLen,
    number: getNumLen,
    string: getLen,
    date: getLen
}