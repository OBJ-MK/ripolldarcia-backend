'use strict';

/**
 * social-post router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/social-oembed',
      handler: 'social-oembed.getOembed',
      config: {
        auth: false,
      },
    },
  ],
};