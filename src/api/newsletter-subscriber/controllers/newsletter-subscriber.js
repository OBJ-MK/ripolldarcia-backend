'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::newsletter-subscriber.newsletter-subscriber',
  ({ strapi }) => ({
    // GET /api/newsletter-subscribers/desabonner/:token
    // Route publique cliquée depuis le lien "Se désabonner" des emails.
    async desabonner(ctx) {
      const { token } = ctx.params;
      ctx.type = 'html';

      if (!token) {
        ctx.status = 400;
        ctx.body = '<p>Lien de désabonnement invalide.</p>';
        return;
      }

      const subscriber = await strapi.db
        .query('api::newsletter-subscriber.newsletter-subscriber')
        .findOne({ where: { token_desabonnement: token } });

      if (!subscriber) {
        ctx.status = 200;
        ctx.body = '<p>Ce lien de désabonnement n\'est plus valide (déjà utilisé ou incorrect).</p>';
        return;
      }

      await strapi.db
        .query('api::newsletter-subscriber.newsletter-subscriber')
        .delete({ where: { id: subscriber.id } });

      ctx.status = 200;
      ctx.body = '<p>Vous avez bien été désabonné(e) de la newsletter Ripoll Darcia.</p>';
    },
  })
);