import { isEqual } from 'lodash';

export const compareTwoObject = (
  object1: object = {},
  object2: object = {}
): boolean => {
  return isEqual(object1, object2);
};

export const isEmptyObject = (object: object): boolean => {
  return (
    !object ||
    (Object.keys(object).length === 0 && object.constructor === Object)
  );
};

export const isBrowser = typeof window !== 'undefined';
