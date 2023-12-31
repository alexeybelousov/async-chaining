![example workflow](https://github.com/alexeybelousov/async-chaining/actions/workflows/publish.yml/badge.svg)
![npm](https://img.shields.io/npm/v/async-chaining)
[![codecov](https://codecov.io/gh/alexeybelousov/async-chaining/branch/master/graph/badge.svg?token=9V8O20Q3BL)](https://codecov.io/gh/alexeybelousov/async-chaining)

# async-chaining
The `async-chaining` library provides a toolkit for creating asynchronous chains of method and property calls. With its help, you can effectively manage asynchronous operations, increasing the efficiency and convenience of development.

[Live demo](https://stackblitz.com/edit/js-ahx1ra?file=index.ts)

## Table of Contents
- [Why?](#why)
- [Getting started](#getting-started)
- [API](#api)
- [Examples](#examples)
  - [await](#await)
  - [.then .catch .finally](#then-catch-finally)
  - [axios](#axios)
- [Pros](#pros)
- [Limitations](#limitations)

## Why?
During the development process, we often encounter cases when we need to use a chain of asynchronous calls. For convenience, JavaScript provides us with additional tools in the form of promises and async/await constructs.
[About promise chaining](https://javascript.info/promise-chaining)
```js
fetch('/article/promise-chaining/user.json')
  .then(response => response.json())
  .then(user => fetch(`https://api.github.com/users/${user.name}`))
  .then(response => response.json())
  .then(githubUser => console.log(githubUser.avatar_url));
```
The main disadvantage is that we have to write a lot of additional code.
The library async-chaining offers a more convenient way to work with a chain of asynchronous calls.
```js
async()
  .fetch('/article/promise-chaining/user.json')
  .json()
  .chain(user => fetch(`https://api.github.com/users/${user.name}`))
  .json()
  .avatar_url
  .then(console.log);
```
## Getting Started
To install, run:
```bash
npm i async-chaining -S
```
Import async function and call it. You can also add asynchronous result properties and methods, prototypes, and array accessors to the chain. If there is an undefined property at any point in the chain or an error occurs, the entire result will return null.
```js
import { async } from 'async-chaining';

async()
  .fetch('https://api.github.com/repositories')
  .json()
  .find(repo => repo.name === 'ambition')
  .id;
```

## API
### `async(data, options): Proxy`
The arguments are optional, but you can send a promise or some other data with the first argument, and options with the second argument
```js
async(fetch('https://api.github.com/repositories'), { 
  debug: true, // default false - see more details .debug()
  strict: true // default false - throws an error if the method or property does not exist
})
  .fetch('https://api.github.com/repositories')
  .json()
```
### `.chain(fun): Promise<fun.apply(Transfered data)>`
You can also use a special `.chain` method to combine chains by passing a function to the method.
The function will take as arguments the result of the execution of the previous promise.
```js
async()
  .fetch('https://api.github.com/repositories')
  .json()
  .find(repo => repo.name === 'ambition')
  .id
  .chain((id) => fetch('https://api.github.com/repositories/' + id))
  .json()
  .watchers;
```
### `.progress(fun): Transfered data`
The `.progress` method accepts a function to which the data from the previous step is passed, but the `.progress` method does not return the data, unlike the `.chain` method. Can be used to update the progress of the execution of the chain.
```js
async()
  .progress(() => console.log('start'))
  .fetch('https://api.github.com/repositories')
  .progress(() => console.log('in progress'))
  .json()
  .progress(() => console.log('end'));
```
### `.debug(): Transfered data`
The `.debug` method can help you to debug the chain. Its call activates debugging mode and each step of the chain will be logged into the console.
```js
async()
  .debug()
  .fetch('https://api.github.com/repositories/26')
  .json()
  .watchers;

// trap get: add microtask, target: [object Window], property: fetch
// trap apply: add microtask, data: [object Window],function fetch() { [native code] }
// trap get: add microtask, target: [object Response], property: json
// trap apply: add microtask, data: [object Response],function json() { [native code] }
// trap get: add microtask, target: [object Object], property: watchers
```

## Examples
### await
```js
(async () => {
  const repoId = await async(fetch('https://api.github.com/repositories'))
    .json()
    .find(repo => repo.name === 'ambition')
    .id;
    
  console.log(repoId);
})();
```
### .then .catch .finally
```js
async()
  .fetch('https://api.github.com/repositories')
  .json()
  .then(console.log)
  .catch((e) => console.err(e))
  .finally(() => console.log('finally'))
```
### axios
```js
import axios from 'axios';

const a = async(axios.get('https://api.github.com/repositories'))
  .data
  .find(repo => repo.name === 'ambition')
  .id
  .then(console.log);
```
## Pros
There are some other packages for a similar use case, but this one is:

- Tiny: ~20KB minified.
- Well tested: 100% test coverage.
- Safe: No known vulnerabilities according to npm audit.
- Self contained: No external dependencies (only devDependencies).

## Limitations
The library supports use in the browser and is implemented using a built-in Proxy object that allows you to intercept calls in the chain.
[Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#browser_compatibility)
