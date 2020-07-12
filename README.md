![Build Status](https://github.com/cardinalby/unschedule-job-action/workflows/build-test/badge.svg)

# Unschedule delayed GitHub Actions job 

## Inputs

* `targetBranch` Default: `master`<br>
Branch to push. Please note, scheduled jobs work only in the default branch.

* `pushForce` Default: `true`<br>
Perform `git push` with `--force` flag

* `gitUserEmail` Default: `action@github.com`<br>
Make commit using specified user.email

* `gitUserName` Default: `GitHub Action`<br>
Make commit using specified user.name

## Env variable

You should set:
* `GITHUB_TOKEN` to enable action to access GitHub API.

Following env variables are normally set by [cardinalby/schedule-job-action](https://github.com/cardinalby/cardinalby/schedule-job-action):

* `DELAYED_JOB_WORKFLOW_FILE_PATH` file to delete
* `DELAYED_JOB_CHECKOUT_REF` tag name to delete or just current commit sha
* `DELAYED_JOB_CHECKOUT_REF_IS_TAG` `true` or `false`. Indicates whether `DELAYED_JOB_CHECKOUT_REF` contains
name of the tag to delete.

## Example usage()
```yaml
...
some other steps
...
- uses: cardinalby/unschedule-job-action@v1
  env:
    GITHUB_TOKEN: ${{ github.token }} 
```