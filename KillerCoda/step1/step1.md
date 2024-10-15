# Step 1 - Node.js repo and unit tests:

Setup a Github Repo with actions and tasks of your choosing. 

For this tutorial we will be using node-js and the JEST-package, but note that there exists similar testing modules for many other languages. 

----

Let's start by importing and setting up our node project which we want to add our Github Actions to, in this case a simple calculator app:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts

sudo apt update
sudo apt install -y npm
```{{exec}}

And install git:

```
sudo apt install git
```{{exec}}

...Aaaaand clone our git:

```
cd
git clone -b stock-branch https://github.com/leegrash/dd2482-executable-tutorial.git
cd dd2482-executable-tutorial
npm install
```{{exec}} 

Because you are amazing, we have configed the npm to install JEST for us preemptively!
