import { async } from '../src/index';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ username: 'Username' }),
  })
);

beforeEach(() => {
  fetch.mockClear(); 
});

describe('async-chaining library:', () => {
  describe('common case:', () => {
    test('should be called with 1 argument', async () => {
      const result = await async(Promise.resolve({ username: 'Username' }))
        .username;
        
      expect(result).toBe('Username');
    });

    test('should be called with 2 arguments', async () => {
      const result = await async(Promise.resolve({ username: 'Username' }), { debug: true })
        .username
        .toUpperCase();
        
      expect(result).toBe('USERNAME');
    });

    test('Accessing a not defined property should return null', async () => {
      async(Promise.resolve(undefined))
        .notDefinedProperty
        .then(result => {
          expect(result).toBeNull();
        })
    });

    test('Accessing a not defined method should return an error', async () => {
      async(Promise.resolve({ user: 'User' }))
        .user
        .map()
        .catch(err => {
          expect(err).toEqual(Error('Property not defined String.map'));
        })
    });
  });

  describe('fetch case:', () => {
    test('should be called without arguments', async () => {
      const result = await async()
        .fetch('/some url')
        .json()
        .username;
        
      expect(result).toBe('Username');
    });

    test('should be called with 1 argument', async () => {
      const result = await async(fetch('/some url'))
        .json()
        .username;
        
      expect(result).toBe('Username');
    });
  });

  describe('async/await case:', () => {
    test('should accept the resolved promise and return promise data', async () => {
      const result = await async(Promise.resolve({ user: 'User' }))
        .user;
        
      expect(result).toBe('User');
    });

    test('should accept the rejected promise and return error', async () => {
      try {
        await async(Promise.reject('Some error'))
          .user
          .name;

      } catch (err) {
        expect(err).toEqual(('Some error'));
      }
    });
  });

  describe('then/catch/finally case:', () => {
    test('should accept the resolved promise and return promise data', async () => {
      async(Promise.resolve({ user: { name: 'User' }}))
        .user
        .name
        .then((result) => {
          expect(result).toBe('User');
        });
    });

    test('should accept the rejected promise and return error', async () => {
      async(Promise.reject('Some error'))
        .user
        .name
        .catch((err) => {
          expect(err).toEqual(('Some error'));
        });
    });
  });

  describe('.chain method:', () => {
    test('should accept the function, call it and return promise data', async () => {
      async(Promise.resolve({ user: { name: 'User' }}))
        .user
        .name
        .chain((data) => {
          return data;
        })
        .then((result) => {
          expect(result).toBe('User');
        });
    });

    test('should throw error from apply trap', async () => {
      async(Promise.resolve({ user: { name: 'User' }}))
        .user
        .name
        .chain((data) => {
          return data.notDefinedMetod();
        })
        .catch((err) => {
          expect(err).toStrictEqual(new TypeError('data.notDefinedMetod is not a function'));
        });
    });
  });
});