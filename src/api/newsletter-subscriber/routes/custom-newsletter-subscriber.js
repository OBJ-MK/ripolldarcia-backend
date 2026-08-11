'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/newsletter-subscribers/desabonner/:token',
      handler: 'newsletter-subscriber.desabonner',
      config: {
        auth: false, // route publique, cliquée depuis un email
      },
    },
  ],
};