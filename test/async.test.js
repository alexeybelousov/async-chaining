import { async } from '../src/index';

const fetchData = new Promise((resolve) => {
  setTimeout(() => {
    resolve({ 
      user: {
        name: 'USER NAME',
        id: 22,
      },
     });
  }, 500);
});

describe('async: function', () => {
  test('promise await', async () => {
    const result = await async(fetchData)
      .user
      .name
      .toLowerCase()
      .split(' ')
      .map(str => str[0].toUpperCase() + str.slice(1))
      [0];
      

    expect(result).toBe('User');
  });

  test('chain method', async () => {
    const fetchDataById = (id) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ description: 'Foo' });
        }, 500);
      });
    }

    const result = await async(fetchData)
      .user
      .id
      .chain(fetchDataById)
      .description;

    expect(result).toBe('Foo');
  });

  test('then method', async () => {
    const result = async(fetchData)
      .user
      .name
      .toLowerCase();
    
    return result.then(res => {
      expect(res).toBe('user name');
    });
  });
});