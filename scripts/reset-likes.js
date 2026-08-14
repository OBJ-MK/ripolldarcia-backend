'use strict';
/**
 * ⚠️ Script one-off déjà exécuté le 14/08/2026 pour corriger le bug
 * "likes bloqués à 0" (voir commit XXXX). Ne pas relancer --apply
 * sans relire ce que ça fait.
 */

/**
 * scripts/reset-likes.js
 *
 * Remet le compteur `likes` à 0 pour TOUS les blog-articles,
 * sur la version draft ET la version published.
 *
 * Usage :
 *   node scripts/reset-likes.js            → dry-run, affiche ce qui serait changé
 *   node scripts/reset-likes.js --apply    → applique réellement
 *
 * À lancer avec les bonnes variables d'env pointant sur Neon, ex :
 *   NODE_ENV=production node scripts/reset-likes.js --apply
 */

const { createStrapi, compileStrapi } = require('@strapi/strapi');

const APPLY = process.argv.includes('--apply');

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  try {
    const uid = 'api::blog-article.blog-article';

    const draftArticles = await app.documents(uid).findMany({
      status: 'draft',
      fields: ['likes', 'Titre'],
      pagination: { pageSize: 1000 }
    });

    console.log(`\n${draftArticles.length} article(s) trouvé(s) au total.\n`);

    for (const draft of draftArticles) {
      const published = await app.documents(uid).findOne({
        documentId: draft.documentId,
        status: 'published',
        fields: ['likes']
      });

      const draftLikes = draft.likes || 0;
      const publishedLikes = published ? (published.likes || 0) : null;

      console.log(
        `  [${APPLY ? 'RESET' : 'DRY-RUN'}] "${draft.Titre}" (${draft.documentId}) : ` +
        `draft ${draftLikes} → 0` +
        (published ? `, published ${publishedLikes} → 0` : ' (jamais publié, published ignoré)')
      );

      if (APPLY) {
        // Reset du draft (update sans status = écrit sur le draft)
        await app.documents(uid).update({
          documentId: draft.documentId,
          data: { likes: 0 }
        });

        // Reset du published, s'il existe
        if (published) {
          await app.documents(uid).update({
            documentId: draft.documentId,
            status: 'published',
            data: { likes: 0 }
          });
        }
      }
    }

    console.log(
      APPLY
        ? '\nTous les compteurs ont été remis à 0. ✅'
        : '\nDry-run terminé, aucune donnée modifiée. Relance avec --apply pour appliquer. ⚠️'
    );
  } catch (err) {
    console.error('Erreur pendant le reset :', err);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
}

main();