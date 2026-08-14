module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/blog-articles/:id/like',
      handler: 'blog-article.like',
      config: { auth: false }
    }
  ]
};