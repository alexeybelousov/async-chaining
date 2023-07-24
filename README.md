[![codecov](https://codecov.io/gh/alexeybelousov/async-chaining/branch/master/graph/badge.svg?token=9V8O20Q3BL)](https://codecov.io/gh/alexeybelousov/async-chaining)

# async-chaining
The async-chaining library provides a toolkit for creating asynchronous chains of method and property calls. With its help, you can effectively manage asynchronous operations, increasing the efficiency and convenience of development.

## Table of Contents
- [Motivation](#motivation)
- [Getting started](#getting-started)
- [Examples](#examples)
  - [fetch](#fetch)
  - [.then .catch. .finally](#then-catch-finally)
  - [axios](#axios)
- [Limitations](#limitations)

## Motivation
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
npm i async-chaining
```
Call the async function with empty arguments or pass a promise to it.
```js
import { async } from 'async-chaining';

async()
  .fetch('https://api.github.com/repositories')
  .json()
  .then(console.log);
  
async(fetch('https://api.github.com/repositories'))
  .json()
  .then(console.log);
```
You can also add asynchronous result properties and methods, prototypes, and array accessors to the chain.
If there is an undefined property at any point in the chain or an error occurs, the entire result will return null.
```js
import { async } from 'async-chaining';

async()
  .fetch('https://api.github.com/repositories')
  .json()
  .find(repo => repo.name === 'ambition')
  .id;
```
You can also use a special ".chain" method to combine chains by passing a function to the method.
The function will take as arguments the result of the execution of the previous promise.
```js
import { async } from 'async-chaining';

async()
  .fetch('https://api.github.com/repositories')
  .json()
  .find(repo => repo.name === 'ambition')
  .id
  .chain((id) => fetch('https://api.github.com/repositories/' + id))
  .json()
  .watchers;
```

## Examples
### await
```js
import { async } from 'async-chaining';

const repoId = await async(fetch('https://api.github.com/repositories'))
  .json()
  .find(repo => repo.name === 'ambition')
  .id;
  
console.log(repoId);
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
import { async } from 'async-chaining';
import axios from 'axios';

const a = async(axios.get('https://api.github.com/repositories'))
  .data
  .find(repo => repo.name === 'ambition')
  .id
  .then(console.log);
```
## Limitations
The library supports use in the browser and is implemented using a built-in Proxy object that allows you to intercept calls in the chain.
[Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#browser_compatibility)
