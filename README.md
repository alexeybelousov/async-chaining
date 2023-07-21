# async-chaining
The async-chaining library provides a toolkit for creating asynchronous chains of method and property calls. With its help, you can effectively manage asynchronous operations, increasing the efficiency and convenience of development.

## Intallation
```bash
npm i async-chaining
```

## Usage example
```js
import { asyncChain } from 'async-chaining';

// await
const repoId = await asyncChain()
  .fetch('https://api.github.com/repositories')
  .json()
  .find(repo => repo.name === 'ambition')
  .id; // repoId === 36


// a few requests
const fetchRepos = fetch('https://api.github.com/repositories');
const fetchRepoById = (id) => fetch('https://api.github.com/repositories/' + id);

const watchers = asyncChain(fetchRepos)
  .json()
  .find(repo => repo.name === 'ambition')
  .id
  .asyncChain(fetchRepoById)
  .json()
  .watchers;

r.then(console.log); // watchers === 163
```