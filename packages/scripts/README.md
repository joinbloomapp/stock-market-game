# Scripts Directory

This is where helper scripts live.

### Hacking

#### Running a script

To run a script, run:

```shell
yarn build
yarn start:prod SCRIPT_NAME
```

where `SCRIPT_NAME` is an available file imported in index.ts to run.

You can also run from the root directory of the repository, assuming
the script directory is already built:

```shell
yarn script SCRIPT_NAME
```

#### Local development

Typically, you'll want AWS credentials such as in the case of deployment
ts files. Configure your credentials like so:

```shell
cat ~/.aws/credentials

# Default is typically reserved for your personal account
[default]
aws_access_key_id = KEY
aws_secret_access_key = KEY

[bloom]
aws_access_key_id = KEY
aws_secret_access_key = KEY
```

This way, you can run:

```shell
export AWS_PROFILE=bloom
```

### Reference

- [actions](./src/actions) is where all GitHub Actions related scripts live.
