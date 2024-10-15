# Setting up some simple JEST testing

Now let's head to our freshly installed repo at /calculator-app/ in our code editor (the "Editor" tab)

The JEST-module is very easy to integrate into your node-servers. All it needs after installation (npm install in last step) is a config file and some tests written as anonymous Javascript functions. Let's start with setting up a basic config file and  testfile.


In our JEST config-file (jest.config.js) we set our *testEnvironment* to node and the path to our test-files as /Simple-Calculator-master/src/\_\_tests\_\_:

```
cd 
cd dd2482-executable-tutorial/Simple-Calculator-master
cat << 'EOF' > jest.config.js
module.exports = {
  testEnvironment: 'node',
  // setupFilesAfterEnv: ['./src/__tests__/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  }
};
EOF
```{{exec}} 

In our test-file (src/__tests__/App.tests.js) we can write any tests we want using javascript/node.js. Here are some simple arithmetric tests on our calculator plus two auto-fail tests for teaching purposes:

```
cd 
cd dd2482-executable-tutorial/Simple-Calculator-master/src
mkdir __tests__
cd __tests__
cat << 'EOF' > App.test.js
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
EOF
```{{exec}}


