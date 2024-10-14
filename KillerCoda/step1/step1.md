# Step 1 - Node.js repo and unit tests:

Setup a Github Repo with actions and tasks of your choosing. 

For this tutorial we will be using node-js and hence the JEST-package, but note that there exists similar testing modules for many other languages. E.g
- .NET / dotnet test ( xUnit / NUnit / MSTest )
- Dart / test
- Flutter / test
- Java / JUnit
- JavaScript / JEST / Mocha
- Swift / xUnit

We start by creating a testfile at  src/__tests__/App.tests.js. Here we can write any amount of anonymous javascript functions named tests(). These will be run by GitHub actions later.

In our case we have a simple calculator app. We have made some easy tests and 2 automatic fail tests to create our error logs for later :).