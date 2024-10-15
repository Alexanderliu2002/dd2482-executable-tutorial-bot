# Creating your Github Actions Repo

Now you can take this repo and push it to your own account. Go to [github.com](https://github.com) and create a new repo. Do not initialize the repository with a README, .gitignore, or license

Then copy this code and substitute the link to your repository:

```
cd ~/dd2482-executable-tutorial
git remote remove origin
git remote add origin https://github.com/your-username/your-new-repo.git
git push -u origin master
```

The repo is now yours. Wow!