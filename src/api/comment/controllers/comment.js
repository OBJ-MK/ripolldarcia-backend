'use strict';
const { createCoreController } = require('@strapi/strapi').factories;
const { sendCommentNotification } = require('../../../utils/brevo');

module.exports = createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    const { website, ...data } = ctx.request.body.data || {};

    if (website) {
      return { data: null, meta: { skipped: true } };
    }

    if (!data.author_name || !data.author_email || !data.content) {
      return ctx.badRequest('Champs requis manquants');
    }

    const created = await strapi.documents('api::comment.comment').create({
      data: {
        author_name: data.author_name.trim().slice(0, 100),
        author_email: data.author_email.trim(),
        content: data.content.trim().slice(0, 2000),
        blog_article: data.blog_article
      }
    });

    strapi.documents('api::blog-article.blog-article')
      .findOne({ documentId: data.blog_article, fields: ['Titre'] })
      .then(article => sendCommentNotification({
        articleTitle: article?.Titre || 'Article',
        authorName: created.author_name,
        authorEmail: created.author_email,
        content: created.content
      }))
      .catch(err => strapi.log.error('Erreur notification commentaire:', err));

    return { data: created };
  }
}));