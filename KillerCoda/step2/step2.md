# Setting up some simple JEST testing

Now let's head to our freshly installed repo at /calculator-app/ in our code editor (the "Editor" tab)

The JEST-module is very easy to integrate into your node-servers. All it needs after installation (npm install in last step) is a config file and some tests written as anonymous Javascript functions. Let's start with a basic config file and testfile:

```
cd dd2482-executable-tutorial/Simple-Calculator-master
touch jest.config.js
cd src
mkdir __tests__
touch App.test.js
``` {{exec}}

In our config-file (jest.config.js) we set our config-environment as node.js and the path to our test-files:

```
module.exports = {
  testEnvironment: 'node',
  // setupFilesAfterEnv: ['./src/__tests__/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  }
};
```

In our test-file (src/__tests__/App.tests.js) we can write any tests we want using javascript/node.js. Here are some dummy tests with 2 auto-fail tests for later sections:

```
const assert = require('assert');

test('should add two numbers', () => {
  const result = add(2, 3);
  assert.strictEqual(result, 5);
});

test('should subtract two numbers', () => {
  const result = subtract(5, 3);
  assert.strictEqual(result, 2);
});

test('should multiply two numbers', () => {
  const result = multiply(2, 3);
  assert.strictEqual(result, 6);
});

test('should divide two numbers', () => {
  const result = divide(6, 3);
  assert.strictEqual(result, 2);
});

test('should always fail', () => {
  assert.strictEqual(1, 2);
});

test('should always fail test 2', () => {
  assert.strictEqual(10, 20);
});

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}
```


