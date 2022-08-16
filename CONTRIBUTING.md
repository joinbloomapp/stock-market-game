## Getting Started

1. Environment Setup

This project requires node version `17.6.0` (our legacy repo needs `14.x.x`) + `yarn`. If you are using `nvm`:

```shell
nvm install
nvm use
# close and reopen shell
npm install --global yarn
```

2. Lerna Setup

```shell
yarn global add lerna
lerna bootstrap
lerna run build
```

The command `lerna run <script>` is a helper to run `yarn <script>` in each of our packages.
We run `lerna run build` so that each package is built and the linting works properly.
For instance, if you modify `postgresql` by adding a new table and need to use the
changes to start working on the `api` package, you must run `lerna run build`

3. Database setup

We use PostgreSQL as our database. Install PostgreSQL per your OS's typical
package manager (e.g. homebrew for MacOS).

Then, you can navigate to the `packages/postgresql` directory and run:

```shell
make restart
```

This will create a new user and database.
