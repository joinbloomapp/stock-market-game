## Price Alerts

Head to [src/socket.ts](./src/socket.ts) to view how we deal with notifying users
of price changes.

At 9:30am EST, we start collect minute bars from Alpaca to determine whether certain
thresholds have been passed based on the given open and current price.

## Installation

Follow monorepo lerna command.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
