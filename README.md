## now.sh extension for Probot

A [Probot](https://github.com/probot/probot) extension to make it easier to run your Probot Apps serverless on now.sh v2.

This extension is based on [`@probot/serverless-lambda`](https://github.com/probot/serverless-lambda) and uses much of its code.

## Usage

```shell
$ npm install @sanalytics/probot-serverless-now
```

```typescript
// index.js
import { serverless } from '@sanalytics/probot-serverless-now';
import app from './app';

export default serverless(app);
```

```typescript
// app.js
import { Application } from 'probot';

export default (app: Application) => {
  app.on('issues.opened', async context => {
    // A new issue was opened, what should we do with it?
    context.log(context.payload);
  });
};
```

## Configuration

This package moves the functionality of `probot run` into a handler suitable for usage on now.sh v2. Follow the documentation on [Environment Configuration](https://probot.github.io/docs/configuration/) to setup your app's environment variables. You can add these to `.env`, but for security reasons you may want to use the [now CLI](https://zeit.co/docs/v2/deployments/environment-variables-and-secrets/) to set Environment Variables for the function so you don't have to include any secrets in the deployed package.

Since you might run into issues with limits related to now.sh environment variables and secrets, just use the pem keyfile (or create one using the key included in your `.env` file where all `\n` are replaced with actual new lines) together with `now-cli`:

```sh
now secret add private_key "$(cat key.pem | base64)"
```

Then set the environment variable `PRIVATE_KEY` either in your `now.json` as shown below or in your deploy command with `now -e PRIVATE_KEY="@private_key@`

```json
{
  "env": {
    "PRIVATE_KEY": "@private_key"
  }
}
```

## Differences from `probot run`

#### Local Development

Since now.sh functions do not start a normal node process, the best way we've found to test this out locally is to use [`zeit/micro`](https://github.com/zeit/micro). Having a `dev` script in your `package.json` allows you to continue working from `https://localhost:3000/probot` before deploying your function to now.sh. When you're developing with typescript, make sure to run `npm i -D typescript ts-node micro-dev @types/node @types/micro` and `npm i micro probot`

```json
{
  "scripts": {
    "dev": "ts-node --typeCheck node_modules/.bin/micro-dev src/index.ts"
  }
}
```

#### Long running tasks

Some Probot Apps that depend on long running processes or intervals might not work with this extension or result in high costs. This is due to the inherent architecture of serverless functions, which are designed to respond to events and stop running as quickly as possible. For longer running apps we recommend using [other deployment options](https://probot.github.io/docs/deployment).

#### Only responds to Webhooks from GitHub

This extension is designed primarily for receiving webhooks from GitHub and responding back as a GitHub App. If you are using [HTTP Routes](https://probot.github.io/docs/http/) in your app to serve additional pages, you should take a look at [`serverless-http`](https://github.com/dougmoscrop/serverless-http), which can be used with Probot's [express server](https://github.com/probot/probot/blob/master/src/server.ts) by wrapping `probot.server`.
