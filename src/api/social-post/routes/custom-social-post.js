module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/social-oembed',
      handler: 'api::social-post.social-post.getOembed',
      config: {
        auth: false,
      },
    },
  ],
};