<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Hacking

You need to start two things:

The api:

```bash
yarn run start:dev
```

You can also use `.user.env` as a gitignored .env file that won't
be checked into VCS.

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## To Test the Production Dockerfile

If you're in the root directory:

```shell
docker build -t bloom/api:latest -f packages/api/Dockerfile .
docker run -p 80:80 -t bloom/api:latest
```
