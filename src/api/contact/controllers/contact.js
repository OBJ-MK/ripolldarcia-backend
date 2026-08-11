'use strict';

/* api/contact/controllers/contact.js
 * Role: reçoit la soumission du formulaire de contact et l'envoie par email
 * via Brevo, à l'adresse définie par CONTACT_EMAIL (ou BREVO_SENDER_EMAIL
 * à défaut).
 */

const { sendBrevoEmail } = require('../../../utils/brevo');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = {
  async envoyer(ctx) {
    const body = ctx.request.body || {};
    const { prenom, nom, email, sujet, message } = body;
    const botField = body['bot-field'];

    // Honeypot anti-spam : un vrai visiteur ne remplit jamais ce champ caché.
    // On répond "succès" sans rien envoyer, pour ne pas alerter le bot.
    if (botField) {
      ctx.status = 200;
      ctx.body = { success: true };
      return;
    }

    if (!prenom || !nom || !email || !message) {
      return ctx.badRequest('Merci de remplir tous les champs obligatoires.');
    }
    if (!EMAIL_REGEX.test(email)) {
      return ctx.badRequest('Adresse email invalide.');
    }

    const destinataire = process.env.CONTACT_EMAIL || process.env.BREVO_SENDER_EMAIL;

    const html = `
      <div style="font-family: sans-serif; max-width: 560px; margin:0 auto; color:#111;">
        <h2 style="margin-bottom:8px;">Nouveau message via le formulaire de contact</h2>
        <p><strong>De :</strong> ${prenom} ${nom} (${email})</p>
        <p><strong>Sujet :</strong> ${sujet || '(non renseigné)'}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        <p style="white-space:pre-line; line-height:1.6;">${message}</p>
      </div>
    `;

    try {
      await sendBrevoEmail({
        to: { email: destinataire },
        subject: `[Contact site] ${sujet || 'Nouveau message'}`,
        htmlContent: html,
        replyTo: { email, name: `${prenom} ${nom}` },
      });

      ctx.status = 200;
      ctx.body = { success: true };
    } catch (err) {
      strapi.log.error(`[contact] Échec envoi: ${err.message}`);
      ctx.status = 500;
      ctx.body = { success: false, error: "Erreur lors de l'envoi du message." };
    }
  },
};