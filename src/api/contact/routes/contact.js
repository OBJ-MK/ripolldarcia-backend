'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/contact',
      handler: 'contact.envoyer',
      config: {
        auth: false, // route publique, appelée depuis le formulaire du site
      },
    },
  ],
};