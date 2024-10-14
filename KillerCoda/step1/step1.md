# Step 1 - Node.js repo and unit tests:

Setup a Github Repo with actions and tasks of your choosing. 

For this tutorial we will be using node-js and hence the JEST-package, but note that there exists similar testing modules for many other languages. 

----

Let's start by importing and setting up our node project which we want to add our Github Actions to, in this case a simple calculator app:

```
sudo apt update
sudo apt install npm
```{{exec}}

Submit Yes at the prompt:

```
Yes
```{{exec}}

And install git and our npm-packages:

```
sudo apt install git
git clone https://github.com/leegrash/dd2482-executable-tutorial.git
npm install
```{{exec}} 

Because you are so amazing, the npm is configed so that this also installs JEST for us!
