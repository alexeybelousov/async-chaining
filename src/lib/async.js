/**
 * Проверяем
 * @param {Object} target - target
 * @param {string} property - property of target
 * @returns {boolean} -
 */
const isPropertyExist = (target, property) => target && typeof target[property] !== 'undefined';

const async = (obj, options) => {
  const initObj = obj || window;

  let promiseChain = initObj instanceof Promise
    ? initObj
    : Promise.resolve(initObj);

  const defaultOptions = {
    debug: false,
    ...options,
  };

  const createProxy = () => new Proxy(Function, {
    get(_, property) {
      defaultOptions.debug && console.log(`trap get: property ${property}`);

      if (property === 'then' || property === 'catch' || property === 'finally') {
        return promiseChain[property].bind(promiseChain);
      }

      promiseChain = promiseChain.then((target) => {
        if (property === 'chain') {
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
        } else {
          value = target[property];
        }

        defaultOptions.debug && console.log(`trap get: add microtask with value ${value}`);

        return value;
      });

      return createProxy();
    },

    apply(_, __, argumentsList) {
      defaultOptions.debug && console.log(`trap apply: call with arguments ${argumentsList}`);

      promiseChain = promiseChain.then(async (data) => {
        if (!Array.isArray(data)) {
          defaultOptions.debug && console.log(`trap apply: add microtask with result ${data}`);

          return data;
        }

        let result;

        try {
          const [args, next] = data;

          if (next === 'chain') {
            result = await argumentsList[0](args);
          } else {
            result = await next.apply(args, argumentsList);
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

  return createProxy();
};

export default async;
