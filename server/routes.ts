import type { FastifyInstance } from 'fastify';

function processEvent(raw) {
  return {
    ...raw,
    timestamp: new Date(raw.timestamp),
    data: JSON.parse(raw.data),
  };
}

export default function (fastify: FastifyInstance, options, done) {
  fastify.get('/events', async (request, reply) => {
    let events = await fastify.db.all(`SELECT * FROM events LIMIT 10`);
    return {
      events: events.map(processEvent),
    };
  });

  fastify.get('/logins_by_day', async (request, reply) => {
    let logins = await fastify.db.all(`
      WITH logins AS (
        SELECT DISTINCT date(timestamp, 'localtime') as day, user_id
        FROM sessions
      )
      SELECT day, count(*) as users
      FROM logins
      GROUP BY day
    `);

    return logins;
  });

  fastify.get('/logins_by_org', async (request, reply) => {
    let byOrg = await fastify.db.all(`
      WITH users AS (
        SELECT DISTINCT user_id, orgs.name as org
        FROM sessions
        JOIN orgs on sessions.org=orgs.id
      )
      SELECT org, count(*) as users
      FROM users
      GROUP BY org
    `);

    return byOrg;
  });

  fastify.get('/users', async (request, reply) => {
    let query = `
    SELECT users.*, orgs.name as org_name
    FROM users
    JOIN orgs on users.org=orgs.id`;

    // query = 'select * from users';

    request.log.info(query);
    let result = await fastify.db.all(query);
    return result;
  });

  done();
}
