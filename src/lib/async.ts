const PROPERTY = {
  THEN: 'then',
  CATCH: 'catch',
  FINALLY: 'finally',
  CHAIN: 'chain',
  DEBUG: 'debug',
};

type TOptions = {
  strict?: boolean;
  debug?: boolean;
};

const isPropertyExist = <T>(target: T, property: string) => target && typeof target[property as keyof T] !== 'undefined';

const async = <T>(obj?: T | Promise<T>, options?: TOptions): any => {
  const initObj = obj || window;

  let promiseChain = initObj instanceof Promise
    ? initObj
    : Promise.resolve(initObj);

  const defaultOptions = {
    strict: false,
    debug: false,
    ...options,
  };

  const createProxy = (): any => new Proxy(Function, {
    get(_, property: string) {
      defaultOptions.debug && console.log(`trap get: property ${property}`);

      if ([PROPERTY.CATCH, PROPERTY.THEN, PROPERTY.FINALLY].includes(property)) {
        return (promiseChain as any)[property].bind(promiseChain);
      }

      promiseChain = promiseChain.then((target: any) => {
        if ([PROPERTY.CHAIN, PROPERTY.DEBUG].includes(property)) {
          return [target, property];
        }

        if (!isPropertyExist(target, property)) {
          if (target) {
            throw new Error(`Property not defined ${target.constructor.name}.${property}`);
          }

          return null;
        }

        let value: any;

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

    apply(_, __, argumentsList: any[]) {
      defaultOptions.debug && console.log(`trap apply: call with arguments ${argumentsList}`);

      promiseChain = promiseChain.then(async (data: any[T]) => {
        let result;

        try {
          const [args, next] = data;

          if (next === PROPERTY.CHAIN) {
            result = await argumentsList[0](args);
          } else if (next === PROPERTY.DEBUG) {
            defaultOptions.debug = true;
            result = args;
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
