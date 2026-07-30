'use strict';

/**
 * social-post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = {
  async getOembed(ctx) {
    const { url } = ctx.query;
    if (!url) {
      return ctx.badRequest('Le paramètre "url" est requis.');
    }

    let platform = null;
    let oembedUrl = null;

    if (/instagram\.com/.test(url)) {
      platform = 'Instagram';
      oembedUrl = `https://graph.facebook.com/v22.0/instagram_oembed?url=${encodeURIComponent(url)}`;
    } else if (/facebook\.com/.test(url)) {
      platform = 'Facebook';
      oembedUrl = `https://graph.facebook.com/v22.0/oembed_post?url=${encodeURIComponent(url)}`;
    } else if (/(twitter\.com|x\.com)/.test(url)) {
      platform = 'Twitter';
      oembedUrl = `https://publish.x.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
    } else {
      return ctx.badRequest('Lien non reconnu (Instagram, Facebook ou X/Twitter uniquement).');
    }

    try {
      const response = await fetch(oembedUrl);
      if (!response.ok) {
        return ctx.badRequest(`${platform} a refusé la requête (HTTP ${response.status}). Le post est peut-être privé, ou le lien est invalide.`);
      }
      const data = await response.json();
      ctx.body = {
        plateforme: platform,
        lien_externe: url,
        html: data.html || null,
      };
    } catch (err) {
      ctx.badRequest(`Erreur lors de la récupération de l'aperçu : ${err.message}`);
    }
  },
};
