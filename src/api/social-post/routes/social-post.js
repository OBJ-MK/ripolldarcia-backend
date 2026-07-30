'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::social-post.social-post');

module.exports = {
  routes: [
    ...defaultRouter.routes,
    {
      method: 'GET',
      path: '/social-oembed',
      handler: 'social-post.getOembed',
      config: {
        auth: false,
      },
    },
  ],
};