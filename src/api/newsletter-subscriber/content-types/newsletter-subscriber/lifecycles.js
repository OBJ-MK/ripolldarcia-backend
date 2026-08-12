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

    // event.result ne contient pas les relations média — on refetch avec populate
    const fullArticle = await strapi.db
      .query('api::blog-article.blog-article')
      .findOne({
        where: { id: article.id },
        populate: ['image_couverture'],
      });

    const titre = fullArticle.Titre || 'Nouvel article';
    const description = fullArticle.description_courte || '';
    const slug = fullArticle.slug || '';
    const frontendUrl = process.env.FRONTEND_URL || '';
    const strapiUrl = process.env.STRAPI_URL || '';
    const lienArticle = `${frontendUrl}/#article?slug=${encodeURIComponent(slug)}`;

    // Cloudinary renvoie déjà une URL absolue — pas besoin de préfixer avec strapiUrl
    const cover = fullArticle.image_couverture;
    const coverUrlRaw = cover?.formats?.medium?.url || cover?.url || '';
    const coverUrl = coverUrlRaw
      ? (coverUrlRaw.startsWith('http') ? coverUrlRaw : `${strapiUrl}${coverUrlRaw}`)
      : '';

    const imageBlock = coverUrl
      ? `<img src="${coverUrl}" alt="${titre}" style="width:100%;max-width:560px;border-radius:12px;display:block;margin-bottom:20px;">`
      : '';

    for (const sub of subscribers) {
      const lienDesabonnement = `${strapiUrl}/api/newsletter-subscribers/desabonner/${sub.token_desabonnement}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color:#111;">
          <p style="text-transform:uppercase;letter-spacing:1px;font-size:11px;color:#f5c518;font-weight:700;margin-bottom:8px;">Nouvel article</p>
          ${imageBlock}
          <h2 style="margin:0 0 12px 0;font-size:22px;">${titre}</h2>
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