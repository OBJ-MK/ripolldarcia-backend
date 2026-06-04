// config/server.js
// Configuration du serveur HTTP de Strapi pour Koyeb
//
// Koyeb impose 2 contraintes :
//   1. Le port est injecté dynamiquement via process.env.PORT
//   2. Le host doit être '0.0.0.0' pour accepter le trafic externe

'use strict';

module.exports = ({ env }) => ({
  // ─── HOST ───
  // '0.0.0.0' = écoute sur toutes les interfaces réseau
  // '127.0.0.1' (localhost) ne fonctionnerait pas sur Koyeb :
  // le serveur serait invisible depuis l'extérieur
  host: env('HOST', '0.0.0.0'),

  // ─── PORT ───
  // Koyeb injecte automatiquement le port via PORT
  // En dev local, on tombe sur 1337 (port par défaut Strapi)
  port: env.int('PORT', 1337),

  // ─── APP KEYS ───
  // Utilisées par Strapi pour signer les sessions et cookies
  // Doit être une chaîne de secrets séparés par des virgules
  // JAMAIS en dur ici → toujours via variable d'environnement
  // Générer avec : node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  app: {
    keys: env.array('APP_KEYS'),
  },

  // ─── SÉCURITÉ ───
  webhooks: {
    // Valide la signature des webhooks entrants
    // Protège contre les appels frauduleux depuis l'extérieur
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});