import { PROPERTY } from './constants';
import { Options } from './types';

/**
 * The function check if an object has a property
 *
 * @param target Any object
 * @param property Propery of object
 * @returns boolean
 */
function isPropertyExist<T>(target: T, property: string) {
  return target && typeof target[property as keyof T] !== 'undefined';
}

/**
 * Function for creating an asynchronous chain
 *
 * @param obj Promise or any data (will be wrapped in a promise)
 * @param options Options for enabling debug and strict mode
 * @returns new Proxy object
 */

function async<T>(obj?: T | Promise<T>, options?: Options): any {
  /**
   * If the object is not defined, then assign the window object
   */
  const initObj = obj || window;

  /**
   * Creating an asynchronous chaining.
   * The first chain is a promise or wrap the data in promise
   */
  let promiseChain = initObj instanceof Promise
    ? initObj
    : Promise.resolve(initObj);

  /**
   * Expanding default options with the passed options
   */
  const defaultOptions = {
    strict: false,
    debug: false,
    ...options,
  };

  /**
   * Creating a proxy object with two traps - get and apply
   */
  function createProxy(): any {
    return new Proxy(Function, {

      /**
       * The get trap is used to read properties
       *
       * @param _ target
       * @param property Property of object
       * @returns New Proxy object
       */
      get(_, property: string) {
        defaultOptions.debug && console.log(`trap get: property ${property}`);

        if ([PROPERTY.CATCH, PROPERTY.THEN, PROPERTY.FINALLY].includes(property)) {
          return (promiseChain as any)[property].bind(promiseChain);
        }

        /**
         * Adding a function or property to the chain.
         * In the case of the function, the apply trap will be called immediately.
         */
        promiseChain = promiseChain.then((target: any) => {
          defaultOptions.debug && console.log(`trap get: add microtask, target: ${target}, property: ${property}`);

          if ([PROPERTY.CHAIN, PROPERTY.DEBUG, PROPERTY.PROGRESS].includes(property)) {
            return [target, property];
          }

          /**
           * If the property of the object does not exist:
           * - throw an error if the strict mode is true
           * - passing the processing to the get trap with null
           */
          if (!isPropertyExist(target, property)) {
            if (defaultOptions.strict && target) {
              throw new Error(`Property not defined ${target.constructor.name}.${property}`);
            }

            return null;
          }

          /**
           * Passing the processing to the apply trap
           */
          if (typeof target[property] === 'function') {
            return [target, target[property]];
          }

          /**
           * Passing the processing to the get trap
           */
          return target[property];
        });

        return createProxy();
      },

      /**
       * The apply trap is activated when the proxy is called as a function
       *
       * @param _ target
       * @param __ thisArg
       * @param argumentsList arguments
       * @returns new Proxy object
       */
      apply(_, __, argumentsList: any[]) {
        defaultOptions.debug && console.log(`trap apply: call with arguments ${argumentsList}`);

        /**
         * Add the result of the method execution to the chain or process API calls
         */
        promiseChain = promiseChain.then(async (data: any[T]) => {
          defaultOptions.debug && console.log(`trap apply: add microtask, data: ${data}`);

          /**
           * Passing the data further if the data is not a tuple
           */
          if (!data) {
            return data;
          }

          try {
            const [args, next] = data;

            /**
             * Processing API methods
             */
            if (next === PROPERTY.CHAIN) {
              return argumentsList[0](args);
            }

            if (next === PROPERTY.DEBUG) {
              defaultOptions.debug = true;

              return args;
            }

            if (next === PROPERTY.PROGRESS) {
              await argumentsList[0](args);

              return args;
            }

            /**
             * If have received an object and a property are trying to call it
             */
            return next.apply(args, argumentsList);
          } catch (e) {
            throw e;
          }
        });

        return createProxy();
      },
    });
  }

  return createProxy();
}

export default async;
