'use strict';

/* Envoie un email à tous les abonnés newsletter dès qu'un blog-article
 * passe de "brouillon" à "publié" (création directe en publié, ou
 * publication différée depuis l'admin Strapi).
 *
 * Variables d'environnement utilisées :
 *   FRONTEND_URL - ex: https://ripolldarcia.com (sans slash final)
 *   STRAPI_URL   - ex: https://ripolldarcia-backend.onrender.com (sans slash final)
 */

const { sendBrevoEmail } = require('../../../../utils/brevo');

async function notifierAbonnes(article) {
  try {
    const subscribers = await strapi.db
      .query('api::newsletter-subscriber.newsletter-subscriber')
      .findMany({ select: ['email', 'token_desabonnement'] });

    if (!subscribers.length) return;

    const titre = article.Titre || 'Nouvel article';
    const description = article.description_courte || '';
    const slug = article.slug || '';
    const frontendUrl = process.env.FRONTEND_URL || '';
    const strapiUrl = process.env.STRAPI_URL || '';
    const lienArticle = `${frontendUrl}/#article?slug=${encodeURIComponent(slug)}`;

    for (const sub of subscribers) {
      const lienDesabonnement = `${strapiUrl}/api/newsletter-subscribers/desabonner/${sub.token_desabonnement}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color:#111;">
          <h2 style="margin-bottom:8px;">${titre}</h2>
          <p style="color:#444; line-height:1.6;">${description}</p>
          <p style="margin-top:24px;">
            <a href="${lienArticle}" style="background:#f5c518;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600;">Lire l'article →</a>
          </p>
          <hr style="margin-top:32px;border:none;border-top:1px solid #eee;">
          <p style="font-size:11px;color:#999;">
            Vous recevez cet email car vous êtes abonné(e) à la newsletter Ripoll Darcia.
            <a href="${lienDesabonnement}">Se désabonner</a>
          </p>
        </div>
      `;

      try {
        await sendBrevoEmail({
          to: { email: sub.email },
          subject: `Nouvel article : ${titre}`,
          htmlContent: html,
        });
      } catch (err) {
        // Un échec d'envoi à un abonné ne doit jamais bloquer les autres.
        strapi.log.error(`[newsletter] Échec envoi à ${sub.email}: ${err.message}`);
      }
    }
  } catch (err) {
    strapi.log.error(`[newsletter] Erreur notifierAbonnes: ${err.message}`);
  }
}

module.exports = {
  async afterCreate(event) {
    if (event.result?.publishedAt) {
      await notifierAbonnes(event.result);
    }
  },

  async beforeUpdate(event) {
    const { where } = event.params;
    const existing = await strapi.db
      .query('api::blog-article.blog-article')
      .findOne({ where, select: ['publishedAt'] });
    event.state = { wasPublished: !!existing?.publishedAt };
  },

  async afterUpdate(event) {
    const isNowPublished = !!event.result?.publishedAt;
    if (!event.state?.wasPublished && isNowPublished) {
      await notifierAbonnes(event.result);
    }
  },
};