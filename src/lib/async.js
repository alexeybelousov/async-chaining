/* eslint-disable import/prefer-default-export */
/* eslint-disable no-useless-catch */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-undef */
const isPropertyExist = (target, property) => {
  return target && typeof target[property] !== 'undefined';
};

const async = (target, options) => {
  const initTarget = target || window;

  let promiseChain = initTarget instanceof Promise
    ? initTarget
    : Promise.resolve(initTarget);

  const defaultOptions = {
    debug: false,
    ...options,
  };

  const createProxy = () => {
    return new Proxy(Function, {
      get(_, property) {
        defaultOptions.debug && console.log(`trap get: property ${property}`);

        if (property === 'then' || property === 'catch' || property === 'finally') {
          return promiseChain[property].bind(promiseChain);
        }

        promiseChain = promiseChain.then((target) => {
          if (property === 'async') {
            return [target, property];
          }

          if (!isPropertyExist(target, property)) {
            if (target) {
              const propName = target.constructor
                ? `${target.constructor.name}.${property}`
                : `${target.name}[${property}]`;

              throw new Error(`Property not defined ${propName}`);
            }

            return null;
          }

          let value;

          if (typeof target[property] === 'function') {
            value = [target, target[property]];
          } else if (['boolean', 'number', 'object', 'string'].includes(typeof target[property])) {
            value = target[property];
          }

          defaultOptions.debug && console.log(`trap get: add microtask with value ${value}`);

          return value;
        });

        return createProxy();
      },

      apply(_, __, argumentsList) {
        defaultOptions.debug && console.log(`trap apply: call with arguments ${argumentsList}`);

        promiseChain = promiseChain.then(async (state) => {
          if (!Array.isArray(state)) {
            defaultOptions.debug && console.log(`trap apply: add microtask with result ${state}`);

            return state;
          }

          let result;

          try {
            const [thisArg, callee] = state;

            if (callee === 'async') {
              result = await argumentsList[0](thisArg);
            } else {
              result = await callee.apply(thisArg, argumentsList);
            }

            defaultOptions.debug && console.log(`trap apply: add chain with result ${result}`);

            return result;
          } catch (e) {
            throw e;
          }
        });

        return createProxy();
      },
    });
  };

  return createProxy();
};

export default async;
