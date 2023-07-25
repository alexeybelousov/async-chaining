/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/semi */
const { async } = require('async-chaining')

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
  .map((str: string) => str[0].toUpperCase() + str.slice(1));

p.then(console.log); // ['User', 'Name']
