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

Now let's create a basic ci.yml file. We've prepared some code for you to copy and paste ahead of time:

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

BUT WAIT! Did you notice anything off about this ci.yml file? If you did, kudos to you! The final job in the file "Notify Webhook" contains a command to send a POST-request to a specified webhook with the "github.run_id". This is very important, since it lets us access this action and its logs using the API in later steps!

Let's also add some very simple placeholder to our deploy.yml file. Note that this one is also has the POST-request job at the bottom:

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