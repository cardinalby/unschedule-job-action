![Build Status](https://github.com/cardinalby/unschedule-job-action/workflows/build-test/badge.svg)

# Unschedule delayed GitHub Actions job

Helper action to use in scheduled workflows to delete them after a success run. See 
[cardinalby/schedule-job-action](https://github.com/cardinalby/schedule-job-action/) for details.

## Example usage
```yaml
...
some other steps
...
- uses: cardinalby/unschedule-job-action@v1
  env:
    GITHUB_TOKEN: ${{ github.token }} 
```

## Limit attempts number
To limit failed attempts number for the delayed job to run, add 
cardinalby/unschedule-job-action as a first step in your job:

```yaml
- name: Remove scheduled job after 10 attempts
  uses: cardinalby/unschedule-job-action@v1
  if: github.run_number > 10
  with:
    ghToken: ${{ secrets.WORKFLOWS_TOKEN }} 
```

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