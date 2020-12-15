import fastifyPlugin from 'fastify-plugin';
import * as sqlite3 from 'sqlite3';
import * as sqlite from 'sqlite';
import * as fs from 'fs';

declare module 'fastify' {
  export interface FastifyInstance {
    db: sqlite.Database;
  }
}

export default fastifyPlugin(async (fst, opts, done) => {
  try {
    let db = await sqlite.open({
      filename: opts.filename,
      driver: sqlite3.Database,
    });

    fst.decorate('db', db);
    fst.addHook('onClose', (_f, done) => db.close());
    done();
  } catch (e) {
    done(e);
  }
});
