const routes = (handler) => ([
  {
    method: 'GET',
    path: '/',
    handler: () => ({})
  },
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
  },
]);

module.exports = routes;
