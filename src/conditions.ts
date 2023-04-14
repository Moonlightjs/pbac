import * as ipcheck from 'ipcheck';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import isUndefined from 'lodash/isUndefined';
import forEach from 'lodash/forEach';
import every from 'lodash/every';

const isNumber = (value: any) => {
  return typeof value === 'number' && !isNaN(value);
};

type ConditionFunction = (a: any, b: any) => boolean;

interface Condition {
  [key: string]: ConditionFunction;
}

const isBoolish = function (value: any): boolean {
  return isBoolean(value) || value === 'true' || value === 'false';
};

const conditions: Condition = {
  NumericEquals(a: number, b: number): boolean {
    if (!isNumber(a) || !isNumber(b)) return false;
    return a === b;
  },
  NumericNotEquals(a: number, b: number): boolean {
    if (!isNumber(a) || !isNumber(b)) return false;
    return !this.NumericEquals.apply(this, [a, b]);
  },
  NumericLessThan(a: number, b: number): boolean {
    if (!isNumber(a) || !isNumber(b)) return false;
    return a < b;
  },
  NumericGreaterThanEquals(a: number, b: number): boolean {
    if (!isNumber(a) || !isNumber(b)) return false;
    return !this.NumericLessThan.apply(this, [a, b]);
  },
  NumericGreaterThan(a: number, b: number): boolean {
    if (!isNumber(a) || !isNumber(b)) return false;
    return a > b;
  },
  NumericLessThanEquals(a: number, b: number): boolean {
    if (!isNumber(a) || !isNumber(b)) return false;
    return !this.NumericGreaterThan.apply(this, [a, b]);
  },
  DateEquals(a: any, b: any): boolean {
    (a = new Date(a)), (b = new Date(b));
    if (a == 'Invalid Date' || b == 'Invalid Date') return false;
    return a >= b && a <= b;
  },
  DateNotEquals(a: any, b: any): boolean {
    (a = new Date(a)), (b = new Date(b));
    if (a == 'Invalid Date' || b == 'Invalid Date') return false;
    return !this.DateEquals.apply(this, [a, b]);
  },
  DateLessThan(a: any, b: any): boolean {
    (a = new Date(a)), (b = new Date(b));
    if (a == 'Invalid Date' || b == 'Invalid Date') return false;
    return a < b;
  },
  DateGreaterThanEquals(a: any, b: any): boolean {
    (a = new Date(a)), (b = new Date(b));
    if (a == 'Invalid Date' || b == 'Invalid Date') return false;
    return !this.DateLessThan.apply(this, [a, b]);
  },
  DateGreaterThan(a: any, b: any): boolean {
    (a = new Date(a)), (b = new Date(b));
    if (a == 'Invalid Date' || b == 'Invalid Date') return false;
    return a > b;
  },
  DateLessThanEquals(a: any, b: any): boolean {
    (a = new Date(a)), (b = new Date(b));
    if (a == 'Invalid Date' || b == 'Invalid Date') return false;
    return !this.DateGreaterThan.apply(this, [a, b]);
  },
  BinaryEquals(a: Buffer, b: string): boolean {
    if (!isString(b) || !(a instanceof Buffer)) return false;
    return a.equals(Buffer.from(b, 'base64'));
  },
  BinaryNotEquals(a: Buffer, b: string): boolean {
    if (!isString(b) || !(a instanceof Buffer)) return false;
    return !a.equals(Buffer.from(b, 'base64'));
  },
  ArnLike(a: string, b: string): boolean {
    if (!isString(b)) return false;
    return new RegExp(
      '^' +
        b
          .replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, '\\$&')
          .replace(/\*/g, '[^:]*') // TODO: check if last part of ARN can contain ':'
          .replace(/\?/g, '.') +
        '$',
    ).test(a);
  },

  ArnNotLike(a: string, b: string): boolean {
    if (!isString(b)) return false;
    return !this.ArnLike(a, b);
  },
  ArnEquals(a: string, b: string): boolean {
    return this.ArnLike(a, b);
  },
  ArnNotEquals(a: string, b: string): boolean {
    return this.ArnNotLike(a, b);
  },
  Null(a: any, b: boolean): boolean {
    if (!isBoolean(b)) return false;
    return b ? isUndefined(a) : !isUndefined(a);
  },
  IpAddress(a: string, b: string): boolean {
    return ipcheck.match(a, b);
  },
  NotIpAddress(a: string, b: string): boolean {
    return !this.IpAddress(a, b);
  },
  StringEquals(a: string, b: string): boolean {
    if (!isString(a) || !isString(b)) return false;
    return a === b;
  },
  StringNotEquals(a: string, b: string): boolean {
    if (!isString(a) || !isString(b)) return false;
    return a !== b;
  },
  StringEqualsIgnoreCase(a: string, b: string): boolean {
    if (!isString(a) || !isString(b)) return false;
    return a.toLowerCase() === b.toLowerCase();
  },
  StringNotEqualsIgnoreCase(a: string, b: string): boolean {
    if (!isString(a) || !isString(b)) return false;
    return a.toLowerCase() !== b.toLowerCase();
  },
  StringLike(a: string, b: string): boolean {
    if (!isString(b)) return false;
    return new RegExp(
      '^' +
        b
          .replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, '\\$&')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.') +
        '$',
    ).test(a);
  },
  StringNotLike(a: string, b: string) {
    if (!isString(b)) return false;
    return !this.StringLike.apply(this, [a, b]);
  },
  Bool(a: boolean, b: boolean): boolean {
    if (!isBoolish(a) || !isBoolish(b)) return false;
    return a.toString() === b.toString();
  },
};

forEach(conditions, function (fn, condition) {
  conditions[condition + 'IfExists'] = function (a, b) {
    if (isUndefined(a)) return true;
    else return fn.apply(this, [a, b]);
  };
  conditions['ForAllValues:' + condition] = function (a, b) {
    if (!Array.isArray(a)) a = [a];
    if (!Array.isArray(b)) b = [b];
    return every(a, (value) => {
      return b.find((key: any) => {
        return fn.call(this, value, key);
      });
    });
  };
  conditions['ForAnyValue:' + condition] = function (a, b) {
    if (!Array.isArray(a)) a = [a];
    if (!Array.isArray(b)) b = [b];
    return a.find((value: any) => {
      return b.find((key: any) => {
        return fn.call(this, value, key);
      });
    });
  };
});

export default conditions;
