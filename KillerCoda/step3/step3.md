# Setting up the Github Action

Great work so far! Now we will get to setting up the GitHub action, which we assume you already have some previous knowledge of already. Let's start by creating the workflow folder and YAML files:

```
cd
cd dd2482-executable-tutorial
mkdir .github
cd .github
mkdir workflows
cd workflows
touch ci.yml
touch deploy.yml
```{{exec}}

Now we want to add some basic placeholder yml to our ci.yml file. But before that, we want to look at the special part of this .yml which tells GitHub to send a html POST-request with our job "run-id" back to a webhook once the other jobs are finished. The job looks like this:

```
    - name: Notify Webhook
      if: ${{ github.event.client_payload && github.event.client_payload.post_url != '' }}
      run: |
        curl -X POST ${{ github.event.client_payload.post_url }} \
        -H "Content-Type: application/json" \
        -d '{"run_id": "${{ github.run_id }}"}'
``` 

We'll get to the use of this code snippet later. Now, let us add our full yml to the ci.yml file:

```
name: CI

on:
  repository_dispatch:
    types: trigger-ci
permissions:
  contents: read
  actions: read
  checks: write

jobs:
  ci-workflow:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x]

    steps:
    - uses: actions/checkout@v4
      with:
        submodules: true
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm install
      working-directory: Simple-Calculator-master
      continue-on-error: true
    - run: npm test 
      working-directory: Simple-Calculator-master
      continue-on-error: true
    - name: Notify Webhook
      if: ${{ github.event.client_payload && github.event.client_payload.post_url != '' }}
      run: |
        curl -X POST ${{ github.event.client_payload.post_url }} \
        -H "Content-Type: application/json" \
        -d '{"run_id": "${{ github.run_id }}"}'

``` 

Let's also add some very simple placeholder to our deploy.yml file. Note that this one is also has the POST-request code snippet:

```
name: Deploy to Production

on:
  repository_dispatch:
    types: trigger-deploy

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Deploy to production server
        run: |
          echo "Deploying to production..."
          # Add your deployment commands here, such as ssh or API calls to cloud provider
      - name: Notify Webhook
        if: ${{ github.event.client_payload && github.event.client_payload.post_url != '' }}
        run: |
          curl -X POST ${{ github.event.client_payload.post_url }} \
          -H "Content-Type: application/json" \
          -d '{"run_id": "${{ github.run_id }}"}'
``` 