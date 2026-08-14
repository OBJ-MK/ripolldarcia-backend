'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::blog-article.blog-article', ({ strapi }) => ({
  async like(ctx) {
    const { id } = ctx.params;

    const article = await strapi.documents('api::blog-article.blog-article').findOne({
      documentId: id,
      status: 'published',
      fields: ['likes']
    });

    if (!article) {
      return ctx.notFound('Article introuvable');
    }

    const updated = await strapi.documents('api::blog-article.blog-article').update({
      documentId: id,
      status: 'published',
      data: { likes: (article.likes || 0) + 1 }
    });

    return { likes: updated.likes };
  }
}));