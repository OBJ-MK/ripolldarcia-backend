'use strict';

/**
 * social-post service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::social-post.social-post');
