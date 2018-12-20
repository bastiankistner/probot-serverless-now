import { json } from 'micro';
import { serverless } from '../';
import { GitHubAPI } from 'probot/lib/github';

jest.mock('micro', () => {
  return {
    ...require.requireActual('micro'),
    json: jest.fn(async () => {
      return {
        action: 'issue',
      };
    }),
  };
});

describe('serverless-now', () => {
  let spy, handler, res;

  beforeEach(() => {
    json.prototype.get = jest.fn(() => Promise.resolve({ action: 'issue' }));

    res = {
      end: jest.fn(),
      setHeader: jest.fn(),
    };

    spy = jest.fn();

    handler = serverless(async app => {
      app.auth = () => Promise.resolve({}) as Promise<GitHubAPI>;
      app.on('issues', spy);
    });
  });

  it('responds with the homepage', async () => {
    const req = { method: 'GET', url: '/probot' };
    await handler(req, res);
    expect(res.end).toHaveBeenCalled();
    expect(res.end.mock.calls[0][0]).toMatchSnapshot();
  });

  it('calls the event handler', async () => {
    const req = {
      body: {
        installation: { id: 1 },
      },
      headers: {
        'x-github-event': 'issues',
        'x-github-delivery': 123,
      },
    };

    await handler(req, res);

    expect(json).toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });
});
