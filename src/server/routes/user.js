import user from '../controllers/user';

export default (router, pass) => {
  router.route('/v/user')
    .post(user.create)
    .get(pass.authenticated, user.read)
    .put(pass.authenticated, user.update)
    .delete(pass.authenticated, user.remove);
  // router.post('/v/user', user.create);
  // router.get('/v/user', pass.authenticated, user.read);
  // router.put('/v/user', pass.authenticated, user.update);
  // router.delete('/v/user', pass.authenticated, user.remove);

  router.post('/v/user/login', user.login);
  router.get('/v/user/logout', user.logout);
};
