const routes = (handler) => ([
  {
    method: 'GET',
    path: '/',
    handler: () => ({ value: 'Hello ges!' }),
  },
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
  },
]);

module.exports = routes;
