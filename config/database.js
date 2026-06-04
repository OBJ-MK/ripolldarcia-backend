// config/database.js
// Connexion Strapi → Neon PostgreSQL
//
// Neon impose 2 contraintes :
//   1. SSL requis en production (rejectUnauthorized: false car cert auto-signé)
//   2. Pool de connexions limité sur le plan gratuit → on bride à 2 connexions max

'use strict';

const { parse } = require('pg-connection-string');

module.exports = ({ env }) => {
  const isProd = env('NODE_ENV') === 'production';

  // En production, on utilise l'URL complète fournie par Neon
  // En dev local, on peut utiliser des variables séparées
  if (isProd) {
    const { host, port, database, user, password } = parse(env('DATABASE_URL'));

    return {
      connection: {
        client: 'postgres',
        connection: {
          host,
          port: parseInt(port) || 5432,
          database,
          user,
          password,
          ssl: {
            // Neon utilise un certificat auto-signé
            // rejectUnauthorized: false est requis
            rejectUnauthorized: false,
          },
        },
        pool: {
          // Plan gratuit Neon = 10 connexions max au total
          // On laisse de la marge pour les autres processus
          min: 0,
          max: 2,
          // Libère les connexions inactives après 10s
          // Évite le "too many connections" après les cold starts Koyeb
          idleTimeoutMillis: 10000,
          acquireTimeoutMillis: 30000,
        },
        debug: false,
      },
    };
  }

  // ─── DEV LOCAL ───
  // Lance un PostgreSQL local ou utilise aussi Neon en dev
  return {
    connection: {
      client: 'postgres',
      connection: {
        host:     env('DATABASE_HOST',     '127.0.0.1'),
        port:     env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME',     'ripolldarcia'),
        user:     env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', ''),
        ssl:      env.bool('DATABASE_SSL', false)
          ? { rejectUnauthorized: false }
          : false,
      },
      pool: {
        min: 0,
        max: 5,
      },
    },
  };
};