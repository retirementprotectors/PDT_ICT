require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'pdt_ict_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './server/db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './server/db/seeds'
    }
  },

  test: {
    client: 'postgresql',
    connection: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: process.env.TEST_DB_PORT || 5432,
      database: process.env.TEST_DB_NAME || 'pdt_ict_test',
      user: process.env.TEST_DB_USER || 'postgres',
      password: process.env.TEST_DB_PASSWORD || 'postgres'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './server/db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './server/db/seeds'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './server/db/migrations',
      tableName: 'knex_migrations'
    }
  }
}; 