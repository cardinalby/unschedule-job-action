![Build Status](https://github.com/cardinalby/unschedule-job-action/workflows/build-test/badge.svg)

# Unschedule delayed GitHub Actions job 

## Inputs

* `ghToken` **Required**<br>
Special GitHub access token with `workflows` permission

## Env variable

Following env variables are normally set by 
[cardinalby/schedule-job-action](https://github.com/cardinalby/cardinalby/schedule-job-action):

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