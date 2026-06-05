// config/middlewares.js
// Chaîne de middlewares Express appliqués à chaque requête HTTP
//
// Le plus critique ici : CORS
// Sans lui, le navigateur bloque toute requête depuis ripolldarcia.netlify.app
// vers l'API Koyeb (deux domaines différents = politique same-origin du navigateur)

'use strict';

module.exports = ({ env }) => [
  // ─── SÉCURITÉ DES EN-TÊTES HTTP ───
  // Ajoute automatiquement des headers de sécurité (X-Frame-Options, etc.)
  'strapi::security',

  // ─── CORS ───
  // Cross-Origin Resource Sharing
  // Autorise explicitement quels domaines peuvent appeler l'API
  {
    name: 'strapi::cors',
    config: {
      // Liste blanche des origines autorisées
      // process.env direct ici car on est hors fonction ({ env }) →
      // on utilise env() à la place pour rester cohérent
      origin: [
        // Frontend en production
        env('FRONTEND_URL', 'https://ripolldarcia.netlify.app'),

        // Dev local React/Vite (port 3000 ou 5173 selon l'outil)
        'http://localhost:3000',
        'http://localhost:5173',

        // Panel admin Strapi en local
        'http://localhost:1337',
      ],

      // Méthodes HTTP autorisées
      // HEAD et OPTIONS sont requis pour les preflight requests du navigateur
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],

      // Headers que le frontend peut envoyer dans ses requêtes
      headers: [
        'Content-Type',
        'Authorization',   // Pour les tokens JWT Strapi
        'Origin',
        'Accept',
      ],

      // Autorise l'envoi de cookies cross-origin
      // Nécessaire si tu implémentes une auth côté frontend plus tard
      credentials: true,
    },
  },

  // ─── MIDDLEWARES STRAPI STANDARDS ───
  // Ordre important : ne pas les déplacer

  // Compresse les réponses (gzip) → réduit la bande passante
  'strapi::compression',

  // Parse le body des requêtes POST/PUT en JSON
  'strapi::body',

  // Gère les fichiers uploadés (multipart/form-data)
  // Requis pour que Cloudinary reçoive les images
  'strapi::session',

  // Ajoute query-string parsing sur les URLs
  'strapi::query',

  // Parse les paramètres dans l'URL
  'strapi::params',

  // Gère les erreurs et formate les réponses d'erreur
  'strapi::errors',

  // Sert les fichiers statiques du panel admin (/admin/*)
  'strapi::public',
];