// config/plugins.js
// Déclare et configure les plugins Strapi activés
//
// Deux plugins ici :
//   1. Cloudinary  → remplace le stockage local des médias
//   2. Sendgrid    → remplace le provider email par défaut de Strapi

'use strict';

module.exports = ({ env }) => ({

  // ─── UPLOAD → CLOUDINARY ───
  // Par défaut, Strapi stocke les images sur le disque local
  // Sur Koyeb, ce disque est éphémère : tout est effacé à chaque redéploiement
  // Cloudinary prend le relais : chaque upload va directement dans le cloud
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        // Ces 3 valeurs se trouvent dans ton dashboard Cloudinary
        // Settings → API Keys
        cloud_name: env('CLOUDINARY_NAME'),
        api_key:    env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        // Options passées à l'API Cloudinary lors de l'upload
        upload: {
          // Dossier dans lequel ranger les médias sur Cloudinary
          // Pratique pour ne pas mélanger avec d'autres projets
          folder: env('CLOUDINARY_FOLDER', 'ripolldarcia'),
        },
        // Options pour la suppression d'un média depuis le panel admin
        delete: {},
      },
    },
  },

  // ─── EMAIL → SENDGRID ───
  // Utilisé par Strapi pour :
  //   - "Mot de passe oublié" de l'admin
  //   - Notifications de nouveaux messages (si on branche le formulaire contact)
  //   - Tout envoi d'email via strapi.plugins.email.services.email.send()
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        // Clé API Sendgrid : Settings → API Keys → Create API Key
        // Permission minimale requise : "Mail Send"
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        // Adresse expéditrice — DOIT être vérifiée dans Sendgrid
        // (Sendgrid bloque les envois depuis des adresses non vérifiées)
        defaultFrom: env('SENDGRID_FROM_EMAIL', 'contact@ripolldarcia.dev'),
        defaultReplyTo: env('SENDGRID_REPLY_TO', 'contact@ripolldarcia.dev'),
      },
    },
  },

});