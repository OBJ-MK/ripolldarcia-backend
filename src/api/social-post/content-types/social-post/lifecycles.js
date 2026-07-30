'use strict';

function detectPlatform(url) {
  if (/instagram\.com/.test(url)) return 'Instagram';
  if (/facebook\.com/.test(url)) return 'Facebook';
  if (/(twitter\.com|x\.com)/.test(url)) return 'Twitter';
  if (/linkedin\.com/.test(url)) return 'LinkedIn';
  return null;
}

function getOembedUrl(platform, url) {
  const encoded = encodeURIComponent(url);
  if (platform === 'Instagram') return `https://graph.facebook.com/v22.0/instagram_oembed?url=${encoded}`;
  if (platform === 'Facebook') return `https://graph.facebook.com/v22.0/oembed_post?url=${encoded}`;
  if (platform === 'Twitter') return `https://publish.x.com/oembed?url=${encoded}&omit_script=true`;
  return null;
}

async function fetchEmbedHtml(oembedUrl) {
  try {
    const response = await fetch(oembedUrl);
    if (!response.ok) return null;
    const data = await response.json();
    return data.html || null;
  } catch (err) {
    strapi.log.error(`[social-post lifecycle] Erreur oEmbed: ${err.message}`);
    return null;
  }
}

// Décode les entités HTML les plus courantes renvoyées par l'oEmbed Twitter
function decodeHtmlEntities(str) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&mdash;': '—',
    '&nbsp;': ' ',
  };
  return str.replace(/&[a-zA-Z#0-9]+;/g, (match) => entities[match] || match);
}

// Extrait le texte brut du tweet depuis le HTML oEmbed de Twitter/X
function extractTwitterText(html) {
  if (!html) return null;

  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return null;

  const rawInner = match[1];
  // Supprime les balises internes (liens vers hashtags, mentions, etc.)
  const withoutTags = rawInner.replace(/<[^>]+>/g, '');
  const decoded = decodeHtmlEntities(withoutTags);

  return decoded.trim() || null;
}

async function enrichFromLink(data) {
  if (!data.lien_externe) return;

  const platform = detectPlatform(data.lien_externe);
  if (!platform) {
    // Lien non reconnu (ex: LinkedIn) : on laisse plateforme et html_embed
    // tels quels — pas d'écrasement, l'admin garde la main.
    return;
  }

  data.plateforme = platform;

  if (platform === 'LinkedIn') return;

  const oembedUrl = getOembedUrl(platform, data.lien_externe);
  const html = await fetchEmbedHtml(oembedUrl);
  data.html_embed = html;

  // Auto-remplissage du contenu uniquement pour Twitter (seule plateforme
  // dont l'oEmbed public expose le texte en clair), et seulement si le
  // champ n'a pas déjà été rempli manuellement par l'admin.
  if (platform === 'Twitter' && !data.contenu) {
    const extracted = extractTwitterText(html);
    if (extracted) data.contenu = extracted;
  }
}

module.exports = {
  async beforeCreate(event) {
    await enrichFromLink(event.params.data);
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;
    if (!data.lien_externe) return;

    const existing = await strapi.db
      .query('api::social-post.social-post')
      .findOne({ where, select: ['lien_externe'] });

    // Ne refetch que si le lien a réellement changé
    if (!existing || existing.lien_externe !== data.lien_externe) {
      await enrichFromLink(data);
    }
  },
};