# Contributing to node-mongo-tenant

:sparkles::tada: Many thanks for contributing! :tada::sparkles:

## First of all

Any contribution is welcome.
This project is committed to the following [CODE OF CONDUCT](CODE_OF_CONDUCT.md).

## How can I contribute?

* Write some docs or tutorial
* Start a discussion about a new feature
* Report a bug
* Submit a PR
* Open an issue to give feedback
* Write tests
* Suggest updates to this document
* ...

## Contribution Guidelines

* :+1: This project follows [git flow](http://nvie.com/posts/a-successful-git-branching-model/)
* :+1: Releases are [semanticly versioned](http://semver.org/)
* :+1: Code coverage should remain 100%
* :+1: Changes should be stated in `release-notes.yml`

### Creating a feature branch

For new features, or fixes that introduce new elements to the public API (such as new public methods or properties),
issue the pull request against the "develop" branch.

```sh
$ git checkout develop
$ git fetch origin
$ git rebase origin/develop
$ git checkout -b feature/${ISSUE_NUMBER}
```

* Write the changes to `release-notes.yml` underneath `version: Unreleased` 

### Creating a hotfix branch

For hotfixes against the stable release, issue the pull request against the "master" branch.


```sh
$ git checkout master
$ git fetch origin
$ git rebase origin/master
$ git checkout -b hotfix/${ISSUE_NUMBER}
```

* Bump the version in `package.json` to the next patch level (`"1.1.0" => "1.1.1"`).
* State the new version's changes to `release-notes.yml`
