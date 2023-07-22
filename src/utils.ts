/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */
export const isPropertyExist = (target: any, property: string): boolean => target && typeof target[property] !== 'undefined';
