'use strict';

/**
 * @param {{ env: (key: string, defaultValue?: any) => any }} options
 */
module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'global::permissions-policy',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        env('FRONTEND_URL', 'https://ripolldarcia.com'),
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost:1337',
        'http://0.0.0.0:8000'
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];