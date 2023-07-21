import { async } from '../src/index';

describe('async: main tests', () => {
  test('promise await', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({ user: { name: ' USER NAME '}});
      }, 1000);
    });

    const result = await async(promise)
      .user
      .name
      .trim()
      .toLowerCase()
      .split(' ')
      .map(str => str[0].toUpperCase() + str.slice(1))
      [0];
      

    expect(result).toBe('User');
  });
});