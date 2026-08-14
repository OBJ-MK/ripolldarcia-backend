'use strict';
/**
 * ⚠️ Script one-off déjà exécuté le 14/08/2026 pour corriger le bug
 * "likes bloqués à 0" (voir commit XXXX). Ne pas relancer --apply
 * sans relire ce que ça fait.
 */

/**
 * scripts/sync-likes.js
 *
 * Contexte :
 * Avant le fix du contrôleur `like`, chaque clic incrémentait `likes`
 * uniquement sur la version DRAFT du document (comportement par défaut
 * de la Document Service API quand aucun `status` n'est précisé).
 * La version PUBLISHED, elle, ne bougeait jamais — c'est elle que le
 * front affiche via l'API REST publique.
 *
 * Ce script parcourt tous les blog-articles, compare le compteur `likes`
 * du draft et du published, et remonte le published au niveau du draft
 * quand le draft est plus élevé (jamais l'inverse, par sécurité).
 *
 * Usage :
 *   node scripts/sync-likes.js            → dry-run, affiche ce qui serait changé
 *   node scripts/sync-likes.js --apply    → applique réellement les changements
 */

const { createStrapi, compileStrapi } = require('@strapi/strapi');

const APPLY = process.argv.includes('--apply');

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  try {
    const uid = 'api::blog-article.blog-article';

    // La vue "draft" du Document Service liste TOUS les documents
    // (qu'ils aient ou non une version publiée).
    const draftArticles = await app.documents(uid).findMany({
      status: 'draft',
      fields: ['likes', 'Titre'],
      pagination: { pageSize: 1000 }
    });

    console.log(`\n${draftArticles.length} article(s) trouvé(s) au total.\n`);

    let toFix = [];
    let neverPublished = 0;
    let alreadyInSync = 0;

    for (const draft of draftArticles) {
      const published = await app.documents(uid).findOne({
        documentId: draft.documentId,
        status: 'published',
        fields: ['likes', 'Titre']
      });

      if (!published) {
        neverPublished += 1;
        continue; // rien à synchroniser, l'article n'est même pas publié
      }

      const draftLikes = draft.likes || 0;
      const publishedLikes = published.likes || 0;

      if (draftLikes > publishedLikes) {
        toFix.push({
          documentId: draft.documentId,
          titre: draft.Titre,
          draftLikes,
          publishedLikes
        });
      } else {
        alreadyInSync += 1;
      }
    }

    console.log(`- Déjà synchronisés : ${alreadyInSync}`);
    console.log(`- Jamais publiés (ignorés) : ${neverPublished}`);
    console.log(`- À corriger : ${toFix.length}\n`);

    if (toFix.length === 0) {
      console.log('Rien à faire. ✅');
    } else {
      for (const item of toFix) {
        console.log(
          `  [${APPLY ? 'FIX' : 'DRY-RUN'}] "${item.titre}" (${item.documentId}) : ` +
          `published ${item.publishedLikes} → ${item.draftLikes}`
        );

        if (APPLY) {
          await app.documents(uid).update({
            documentId: item.documentId,
            status: 'published',
            data: { likes: item.draftLikes }
          });
        }
      }

      console.log(
        APPLY
          ? '\nMigration appliquée. ✅'
          : '\nDry-run terminé, aucune donnée modifiée. Relance avec --apply pour appliquer. ⚠️'
      );
    }
  } catch (err) {
    console.error('Erreur pendant la migration :', err);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
}

main();