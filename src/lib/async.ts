type TOptions = {
  debug: boolean;
};

const isPropertyExist = <T>(target: T, property: string) => target && typeof target[property as keyof T] !== 'undefined';

const async = <T>(obj?: T | Promise<T>, options?: TOptions): any => {
  const initObj = obj || window;

  let promiseChain = initObj instanceof Promise
    ? initObj
    : Promise.resolve(initObj);

  const defaultOptions = {
    debug: false,
    ...options,
  };

  const createProxy = (): any => new Proxy(Function, {
    get(_, property: string) {
      defaultOptions.debug && console.log(`trap get: property ${property}`);

      if (property === 'then' || property === 'catch' || property === 'finally') {
        return (promiseChain as any)[property].bind(promiseChain);
      }

      promiseChain = promiseChain.then((target: any) => {
        if (property === 'chain') {
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
