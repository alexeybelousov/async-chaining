const { async } = require('async-chaining')

// 1
const myPromise = new Promise((resolve) => {
  setTimeout(() => {
    resolve({ user: { name: ' USER NAME ' } });
  }, 1000);
});

const p = async(myPromise)
  .user
  .name
  .trim()
  .toLowerCase()
  .split(' ')
  .map((str) => str[0].toUpperCase() + str.slice(1));

p.then(console.log); // ['User', 'Name']

// 2
const b = async({ data: ['ab', 'ba'] })
  .data
  .find((v) => v === 'ab')
  .toUpperCase();

b.then(console.log); // AB
