var userController = require('./userController.js');

module.exports = function (app) {
  // app === userRouter from middleware.js

  app.param('id', userController.findUser);

  app.route('/')
    .get(userController.dashboard);
  app.post('/login', userController.login);
  app.post('/signup', userController.signup);
  app.get('/signedin', userController.checkAuth);
  app.get('/:id', userController.sendUser);
};