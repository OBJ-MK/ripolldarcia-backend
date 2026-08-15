// src/middlewares/permissions-policy.js (nouveau fichier)
'use strict';

module.exports = () => {
  return async (ctx, next) => {
    await next();
    ctx.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=()');
  };
};
