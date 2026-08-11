'use strict';

/* Génère automatiquement un token de désabonnement unique et la date
 * d'inscription à chaque nouvel abonné — pas besoin de les saisir côté front.
 */

const crypto = require('crypto');

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    data.token_desabonnement = crypto.randomBytes(16).toString('hex');
    data.date_inscription = new Date();
  },
};