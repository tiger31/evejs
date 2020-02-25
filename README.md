# evejs

__evejs__ - is a test runner with built-in support of parallel and step tests launch, tests tree filtering by scope/epic/feature/story parameters. Currently working on Node.js


## WIP

- Server-side configuration
- Detailed reports
- Attachments support
- Browser support
- Examples
- More tests
- Broken tests detection

## Issues 
As far as we are in alpha now, there can be bugs we don't know about yet. If you'll find some strange behaviour or unexpected crash, please submit issue in
[our gitlab repo](https://gitlab.com/evereport/evejs/issues) with tags ```bug``` or ```broken```. 

Or you can submit them here on github


## Installation
You can install it as a dev dependency
```shell script
npm install @evecat/evejs --save-dev
```
Or globally
```shell script
npm install @evecat/evejs -g
```

## Getting started

By default evejs searches files like ```*.test.js``` in ```tests``` directory. You can configure it via arguments. More information about arguments you can find by typing ```./node_modules/.bin/evejs --help```.

Let's create example tests file:

```shell script
mkdir tests
touch Simple.test.js
```
Simple.test.js content:
```javascript
const expect = require('chai').expect;

suite('Math', () => {
  test('Pow', () => {
    expect(Math.pow(2, 2)).to.be.equal(4);
  })
});
```
Then run tests
```shell script
./node_modules/.bin/evejs
Runner
  Math
    ✓ Pow (1ms)

Suites:   1 passed, 1 total
Tests:    1 passed, 1 total
Time:     6ms
```
You can add npm command in ```package.json``` to run tests easier
```javascripton
"scripts": {
  "test": "evejs"
}
```

## API Reference
### Lifecycle
_evejs_ supports 4 hooks:
 - before - runs at the beginning of suite execution (before execution of any member)
 - beforeEach - runs before execution of each suite member
 - afterEach - runs after execution of each suite member
 - after - runs at the end of suite execution (after each member is complete)
 
Let's check an example:
```javascript
const arr = [];
before(() => { arr.push('Runner -> before'); });
beforeEach(() => { arr.push('Runner -> beforeEach'); });
afterEach(() => { arr.push('Runner -> afterEach'); });
after(() => { arr.push('Runner -> after'); console.log(arr) });
suite("Suite", () => {
  before(() => { arr.push('Suite -> before'); });
  beforeEach(() => { arr.push('Suite -> beforeEach'); });
  afterEach(() => { arr.push('Suite -> afterEach'); });
  after(() => { arr.push('Suite -> after'); });
  test('Test 1', () => {});
  test('Test 2', () => {});
});
test('Runner-level test', () => {});
```
Output:
```shell script
Runner
  Suite
    ✓ Test 1 (0ms)
    ✓ Test 2 (0ms)
  ✓ Runner-level test (0ms)
[
  'Runner -> before',
  'Runner -> beforeEach',
  'Suite -> before',
  'Suite -> beforeEach',
  'Suite -> afterEach',
  'Suite -> beforeEach',
  'Suite -> afterEach',
  'Suite -> after',
  'Runner -> afterEach',
  'Runner -> beforeEach',
  'Runner -> afterEach',
  'Runner -> after'
]

Suites:   1 passed, 1 total
Tests:    3 passed, 3 total
Time:     10ms
```

What actually happened: Suite supports 4 type of hooks, Runner is inherited from suite so it also does. At the runner-level we have one suite and one test, so runners ```each``` hooks are triggered twice. Suite has two tests so its hooks are triggered in the same way.

### Asynchronous functions

__evejs__ works with Bluebird promises and fully supports ```async``` functions. Tests and hooks have default timeout, equals 2000ms.
You can specify different value by adding ```timeout``` to test or hook config.

_Note: ```suite()``` function is the only one not supporting ```async``` functions_

```javascript
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

suite("Async tests", () => {
  test('Promise resolved', async () => {
    await expect(new Promise((resolve, reject) => {
      setTimeout(() => resolve(5), 500);
    })).to.eventually.be.equal(5);
  });
  test('Promise rejected', async () => {
    await expect(new Promise((resolve, reject) => {
      setTimeout(reject, 500);
    })).to.be.rejected;
  })
});
```
Output:
```shell script
Runner
  Async tests
    ✓ Promise resolved (502ms)
    ✓ Promise rejected (502ms)

Suites:   1 passed, 1 total
Tests:    2 passed, 2 total
Time:     1s
```

Suite or Runner hooks do the same.

### Parallel execution

__evejs__ supports parallel tests launches so we can spend less time.
Both suite and test can be set as _parallel_. Mechanic is the same.

#### Order

The order in parallel execution order is a bit different. First, all parallel entities (suite or test) are collected in group.
Each entity executes in parallel to other in group. After parallel group is complete, rest of entities execute in order as written.

#### Hooks

```beforeEach``` and ```afterEach``` hooks executed for each entity in parallel group. Test or suite executes right after its ```beforeEach``` hook is complete. Same with ```afterEach``` hooks, but it executes right after entity.

#### Examples

First example: parallel suite with inner parallel tests.

```javascript
suite('Outer', () => {
  test('Parallel test 1', () => {
    /* checks here */
  }, { parallel: true });
  suite('Parallel suite 1', () => {
    test('Parallel test 1-1', () => {
      /* checks here */
    }, { parallel: true });
    test('Parallel test 1-2', () => {
      /* checks here */
    }, { parallel: true });
    test('Non-parallel test 1-1', () => {
      /* checks here */
    });
  }, { parallel: true });
  test('Parallel test 2', () => {
    /* checks here */
  }, { parallel: true });
  test('Non-parallel test 1', () => {
    /* checks here */
  });
});
test('Runner-level test', () => {});
```
Output:
```shell script
Runner
  Outer
    Parallel execution started
    ✓ Parallel test 1 (1ms)
    Parallel suite 1
      ✓ Parallel test 1-1 (1ms)
      ✓ Parallel test 1-2 (0ms)
      ✓ Non-parallel test 1-1 (0ms)
    ✓ Parallel test 2 (1ms)
    Parallel execution ended
    ✓ Non-parallel test 1 (0ms)
  ✓ Runner-level test (0ms)

Suites:   2 passed, 2 total
Tests:    7 passed, 7 total
Time:     12ms
```

If we set our "Parallel suite 1" to non-parallel, result will be like this:
```shell script
Runner
  Outer
    Parallel execution started
    ✓ Parallel test 1 (1ms)
    ✓ Parallel test 2 (0ms)
    Parallel execution ended
    Non-parallel suite 1
      Parallel execution started
      ✓ Parallel test 1-1 (0ms)
      ✓ Parallel test 1-2 (0ms)
      Parallel execution ended
      ✓ Non-parallel test 1-1 (0ms)
    ✓ Non-parallel test 1 (0ms)
  ✓ Runner-level test (0ms)

Suites:   2 passed, 2 total
Tests:    7 passed, 7 total
Time:     8ms
```

### Step tests

If we want to skip further tests if one of them fails we can use ```step``` property on test or suite.

As far as suites and tests are executed in same order they were added, suite can also be a ```step```.

```javascript
suite('Outer', () => {
  suite('Suite 1', () => {
    test('Succeeded', () => {
      /* checks here */
    }, { step: true });
    test('Failed', () => {
      throw new Error('Oops!');
    }, { step: true });
    test('Never lucky', () => {});
  });
  suite('Suite 1', () => {
    test('Im doing ok!', () => {});
    test('Im not', () => {
      throw new Error('Oops!');
    })
  }, { step: true });
  suite('Skipped', () => {
    test('Skipped test', () => {})
  });
  test('Also never lucky', () => {})
});
```
Output:
```shell script
Runner
  Outer
    Suite 1
      ✓ Succeeded (1ms)
      ✕ [1] Failed (1ms)
      ↓ Never lucky (0ms)
    Suite 1
      ✓ Im doing ok! (0ms)
      ✕ [2] Im not (0ms)
    ↓ Skipped
      ↓ Skipped test (0ms)
    ↓ Also never lucky (0ms)

Outer
  Suite 1
    Failed
      ERROR 1 Error: Oops!

         27 |           }, { step: true });
         28 |           test('Failed', () => {
       > 29 |                   throw new Error('Oops!');
         30 |           }, { step: true });
         31 |           test('Never lucky', () => {});
      
         at Test.test.step [as _function] (/home/cat/eve/evejs/tests/Simple.test.js:29:10)
         at <anonymous> (/home/cat/eve/evejs/lib/classes/mixins/Runnable.js:100:24)
         at Test.delayed (/home/cat/eve/evejs/lib/classes/mixins/Runnable.js:99:24)
         at Test.run (/home/cat/eve/evejs/lib/classes/Test.js:115:15)
         at <anonymous> (/home/cat/eve/evejs/lib/classes/Task.js:20:17)
      

Outer
  Suite 1
    Im not
      ERROR 2 Error: Oops!

         34 |           test('Im doing ok!', () => {});
         35 |           test('Im not', () => {
       > 36 |                   throw new Error('Oops!');
         37 |           })
         38 |   }, { step: true });
      
         at Test._function (/home/cat/eve/evejs/tests/Simple.test.js:36:10)
         at <anonymous> (/home/cat/eve/evejs/lib/classes/mixins/Runnable.js:100:24)
         at Test.delayed (/home/cat/eve/evejs/lib/classes/mixins/Runnable.js:99:24)
         at Test.run (/home/cat/eve/evejs/lib/classes/Test.js:115:15)
         at <anonymous> (/home/cat/eve/evejs/lib/classes/Task.js:20:17)
      

Suites:   3 failed, 1 pending, 4 total
Tests:    2 passed, 2 failed, 3 pending, 7 total
Time:     9ms
```
If you want to manually skip test or suite, just add ```{skip: true}``` to its config

#### Parallel & Step? Whaat?

Parallel suites and tests can also be marked as ```step```. How it works:
If parallel group has entities marked as ```step``` and some of these entities fail, all non-parallel entities will be skipped

### Filtering 
Suites and tests can have special config parameters: ```scope```, ```epic```, ```feature```, ```story```, so we can launch tests for part of functionality

Each parameter can have multiple values.

```javascript
suite('API', () => {
  suite('Endpoint 1', () => {
    test('Test 1', () => {
      /* checks here */
    }, {
      story: 'password'
    });

    test('Test 2', () => {
      /* checks here */
    }, {
      feature: 'auth',
      story: 'tokens'
    });

    test('Test 3', () => {
      /* checks here */
    }, {
      feature: 'files'
    });
  }, {
    feature: ['auth', 'files']
  });

  suite('Endpoint 2', () => {
    test('Test 1', () => {

    })
  }, { feature: 'user' });

}, {
  epic: 'api/v1'
});
```
If we filter tests, for example, by ```story: password``` , output will be:
```shell script
evejs --story password

Runner
  API
    Endpoint 1
      ✓ Test 1 (1ms)
    Endpoint 2

Suites:   3 passed, 3 total
Tests:    1 passed, 1 total
Time:     6ms
```

We can filter it by feature:
```shell script
evejs --feature auth --feature files
Runner
  API
    Endpoint 1
      ✓ Test 2 (3ms)
      ✓ Test 3 (0ms)

Suites:   2 passed, 2 total
Tests:    2 passed, 2 total
Time:     16ms
```

