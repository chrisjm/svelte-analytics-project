# Developing the Project

The client development build uses Snowpack, while the server uses a Typescript watcher to rebuild and restart on changes.

The `dev` package script will start both the client and the server at the same time, with the snowpack server listening on port 8080 by default.

As usually, first install the dependencies, and then you can run it.

```shell
> npm i
> npm run dev
```

Snowpack will install the dependencies, and then tell you once it's ready.

## Database

The database is an [SQLite3](https://sqlite.org) file for simplicity. The default set of data is at `data/baseline.db.gz`, and the server will create `data.db` from that file if it doesn't exist. 

**If you screw up your database somehow, you can delete `data.db` and restart the server, and it will recreate the file.**

SQLite does have some limitations compared to more full-featured SQL databases. Most notably for this case, functions such as `array_agg` are not present and date-handling functions are limited.

For this project, it's probably easiest to just implement those types of grouping operations yourself.

The database has a simple schema:

```sql
> sqlite3 data.db
SQLite version 3.31.1 2020-01-27 19:55:54
Enter ".help" for usage hints.
sqlite> .schema
CREATE TABLE orgs (
      id text PRIMARY KEY,
      name text
    );
CREATE TABLE users (
      id text PRIMARY KEY,
      org text,
      name text
    );
CREATE TABLE sessions (
  session_id text PRIMARY KEY,
  application text, -- 'tm' or 'omni' for our two applications
  user_id text,
  org text,
  timestamp text,
  session_time int -- in seconds
);

CREATE TABLE reports (
  user_id text,
  org text,
  timestamp text
);

CREATE INDEX sessions_org_timestamp ON sessions(org, timestamp);
CREATE INDEX sessions_timestamp ON sessions(timestamp);
CREATE INDEX reports_org_timestamp ON reports(org, timestamp);
CREATE INDEX reports_timestamp ON reports(timestamp);
```

## Server Application

All server files can be found in the `server` directory. The server is based on [fastify](https://www.fastify.io/) and implements a few endpoints that query the SQLite database and return the results.

The existing endpoints are all in the `server/routes.ts` file, and take this form:

```js
 fastify.get('/logins_by_org', async (request, reply) => {
  let byOrg = await fastify.db.all(`
    WITH users AS (
      SELECT DISTINCT user_id, orgs.name as org
      FROM sessions
      JOIN orgs on events.org=orgs.id
    )
    SELECT org, count(*) as users
    FROM users
    GROUP BY org
  `);

  return byOrg;
});
```

You can see that the database is exposed as `fastify.db`. This is an instance of the [sqlite](https://www.npmjs.com/package/sqlite) package, which wraps the original [sqlite3](https://www.npmjs.com/package/sqlite3) package with Promise support.

## Client Application

The client is a simple Svelte application with the root at `src/App.svelte`. We use Tailwind for the styling, so that is all set up.

### CSS

We're using the [TailwindCSS](https://tailwindcss.com/) framework for our development at Carevoyance, and it is set up on this project as well.

### Charts

We've also included some components from our charts library at `src/charts`.

The charts are based around the [layercake](https://layercake.graphics) Svelte package. Each chart is built around a paradigm of a single data array of objects with multiple dimensions that expose various aspects of it.

The provided example code sets up two charts, each with just a single dimension. Each dimension contains accessors that tell it how to extract data from each data object, and an accessor can be either a function that takes a data object, or a string that references a key in the object.

The chart attributes all have Typescript definitions in `src/dimensions.ts`, which can be useful for figuring out what's supported. Our charts libraries are a work in progress, so please let us know if you think you've found a bug.

### Other Libraries

We have some other libraries preinstalled in the client app. Feel free to use something else if you prefer though.

* [ky](https://www.npmjs.com/package/ky) is a nice interface around `fetch` for fetching data.
* The [just](https://github.com/angus-c/just) packages are nice small utility libraries.
* [day.js](https://day.js.org) is used for parsing dates
* [sorters](https://www.npmjs.com/package/sorters) is a small library to generate functions for use with `Array.sort`.
