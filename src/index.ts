import { createProbot, Probot, ApplicationFunction } from 'probot';
import { resolve } from 'probot/lib/resolver';
import { findPrivateKey } from 'probot/lib/private-key';
import { template } from './views/probot';
import { ServerResponse, IncomingMessage } from 'http';
import { json } from 'micro';

let probot: Probot;

const loadProbot = (appFn: string | ApplicationFunction) => {
  const privateKey = findPrivateKey();

  if (!privateKey) {
    throw new Error('Private key not found');
  }

  if (process.env.APP_ID === undefined) {
    throw new Error('APP_ID not set');
  }

  if (process.env.WEBHOOK_SECRET === undefined) {
    throw new Error('WEBHOOK_SECRET not set');
  }

  probot =
    probot ||
    createProbot({
      id: (process.env.APP_ID as unknown) as number,
      secret: process.env.WEBHOOK_SECRET,
      cert: findPrivateKey() as string,
    });

  if (typeof appFn === 'string') {
    appFn = resolve(appFn);
  }

  probot.load(appFn);

  return probot;
};

export const serverless = (appFn: string | ApplicationFunction, appName: string, appVersion: string) => {
  return async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === 'GET' && req.url === '/probot') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(template(appName, appVersion));
      return;
    }

    probot = probot || loadProbot(appFn);

    const event = req.headers['x-github-event'] || req.headers['X-GitHub-Event'];

    try {
      const body: { action?: string; [key: string]: any } = await json(req);
      console.log(`Received event ${event}${body.action ? '.' + body.action : ''}`);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');

      if (body.action) {
        try {
          await probot.receive({
            name: event,
            payload: body,
          });
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              message: `Received ${event}.${body.action}`,
            })
          );
          return;
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify(err));
          return;
        }
      } else {
        console.error({ req });
        res.statusCode = 200;
        res.end(JSON.stringify({ message: 'Nothing to do' }));
        return;
      }
    } catch (err) {
      console.error('Could not deserialize body into JSON');
      res.end(JSON.stringify(err));
      return;
    }
  };
};
