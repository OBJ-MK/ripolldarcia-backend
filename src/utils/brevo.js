'use strict';

/* utils/brevo.js
 * Role: petit wrapper autour de l'API transactionnelle Brevo (ex-Sendinblue).
 * Nécessite les variables d'environnement :
 *   BREVO_API_KEY       - clé API générée depuis le dashboard Brevo
 *   BREVO_SENDER_EMAIL   - email expéditeur, doit être vérifié dans Brevo
 *   BREVO_SENDER_NAME    - nom affiché comme expéditeur (optionnel)
 *   RIPOLL_NOTIFICATION_EMAIL - email de Ripoll pour les notifications de commentaires
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

async function sendBrevoEmail({ to, subject, htmlContent, replyTo = null}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY manquant dans les variables d\'environnement.');
  }
  if (!process.env.BREVO_SENDER_EMAIL) {
    throw new Error('BREVO_SENDER_EMAIL manquant dans les variables d\'environnement.');
  }

  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME || 'Ripoll Darcia',
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: Array.isArray(to) ? to : [to],
    subject,
    htmlContent,
  };

  if (replyTo) payload.replyTo = replyTo;

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API error ${response.status}: ${errText}`);
  }

  return response.json();
}

async function sendCommentNotification({ articleTitle, authorName, authorEmail, content }) {
  const notifEmail = process.env.RIPOLL_NOTIFICATION_EMAIL;
  if (!notifEmail) {
    throw new Error('RIPOLL_NOTIFICATION_EMAIL manquant dans les variables d\'environnement.');
  }

  return sendBrevoEmail({
    to: notifEmail,
    subject: `Nouveau commentaire sur "${articleTitle}"`,
    htmlContent: `
      <p><strong>${authorName}</strong> (${authorEmail}) a commenté <strong>${articleTitle}</strong> :</p>
      <blockquote>${content}</blockquote>
      <p><a href="${process.env.STRAPI_URL}/admin">Voir dans Strapi</a></p>
    `,
  });
}

module.exports = { sendBrevoEmail, sendCommentNotification };