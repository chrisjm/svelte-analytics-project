import type { FastifyInstance } from 'fastify';

interface IQuerystring {
  app: string;
  org: string;
  dateRange: string;
}

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

  // TODO: Initial options. Robustness needed.
  const opts = {
    schema: {
      querystring: {
        app: { type: 'string', enum: ['all', 'tm', 'omni', 'undefined'] },
        org: { type: 'string' },
        dateRange: { type: 'string' }
      }
    }
  }

  fastify.get<{
    Querystring: IQuerystring
  }>('/logins_by_day', opts, async (request, reply) => {
    const { app, org, dateRange } = request.query;
    let whereClause = '';

    if (app !== 'all' && app !== 'undefined') {
      whereClause += `WHERE application='${app}'`
    }

    if (org !== 'all' && org !== 'undefined') {
      if (whereClause !== '') {
        whereClause += ` AND `;
      } else {
        whereClause += `WHERE `;
      }
      whereClause += `org='${org}'`
    }

    const query = `
      WITH logins AS (
        SELECT DISTINCT date(timestamp, 'localtime') as day, user_id
        FROM sessions
        ${whereClause}
      )
      SELECT day, count(*) as users
      FROM logins
      GROUP BY day
    `;

    let logins = await fastify.db.all(query);

    return logins;
  });

  fastify.get('/logins_by_org', async (request, reply) => {
    let byOrg = await fastify.db.all(`
      WITH users AS (
        SELECT DISTINCT user_id, orgs.name as org, orgs.id as org_id
        FROM sessions
        JOIN orgs on sessions.org=orgs.id
      )
      SELECT org_id, org, count(*) as users
      FROM users
      GROUP BY org_id, org
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
