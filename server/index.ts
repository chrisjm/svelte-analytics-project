import 'source-map-support/register';
import fastifyMod from 'fastify';
import * as path from 'path';
import * as fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';
import * as zlib from 'zlib';
import dbPlugin from './db';
import routes from './routes';

const pipeline = promisify(stream.pipeline);

async function start() {
  const fastify = fastifyMod({
    logger: true,
  });

  const dbFilename = path.resolve(process.cwd(), 'data.db');
  if (!fs.existsSync(dbFilename)) {
    let baselineDb = path.resolve(
      path.dirname(dbFilename),
      'data/baseline.db.gz'
    );
    fastify.log.info(`Initializing database...`);
    await pipeline(
      fs.createReadStream(baselineDb),
      zlib.createGunzip(),
      fs.createWriteStream(dbFilename)
    );
  }

  fastify.register(dbPlugin, { filename: dbFilename }).after((e) => {
    if (e) {
      fastify.log.error(e.stack || e.message);
      process.exit(1);
    }
  });

  fastify.register(routes);

  return fastify.listen(
    process.env.API_PORT || process.env.PORT || 5005,
    process.env.BIND_IP || '127.0.0.1',
    (err, addr) => {
      if (err) {
        fastify.log.error(err.stack || err.message);
        process.exit(1);
      }

      fastify.log.info({ addr }, `Server started!`);
    }
  );
}

start().catch((e) => {
  console.log(e.stack);
  process.exit(1);
});
