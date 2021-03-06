var User = require('./userModel.js');
var Q = require('q');
var jwt = require('jwt-simple');

module.exports = {
  login: function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var findUser = Q.nbind(User.findOne, User);

    findUser({ email: email }).then(function (user) {
      if (!user) {
        next(new Error('User does not exist'));
      } else {
        return user.comparePasswords(password).then(function(foundUser) {
          if (foundUser) {
            var token = jwt.encode(user, 'monkeydonkeyeater');
            res.json({ token: token });
          } else {
            return next(new Error('No User'));
          }
        });
      }
    }).fail(function (error) {
      next(error);
    });
  },

  signup: function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var uType = req.body.uType.value;
    var create;
    var newUser;
    var findOne = Q.nbind(User.findOne, User);

    findOne({ email: email }).then(function(user) {
      if (user) {
        next(new Error('User already exists!'));
      } else {
        create = Q.nbind(User.create, User);
        newUser = {
          email: email,
          password: password,
          uType: uType
        };
        return create(newUser);
      }
    }).then(function (user) {
      var token = jwt.encode(user, 'monkeydonkeyeater');
      res.json({ token: token });
    }).fail(function (error) {
      next(error);
    });
  },

  checkAuth: function (req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      var user = jwt.decode(token, 'monkeydonkeyeater');
      var findUser = Q.nbind(User.findOne, User);
      findUser({ email: user.email }).then(function (foundUser) {
        foundUser ? res.send(200) : res.send(401);
      }).fail(function (error) {
        next(error);
      });
    }
  },

  getUser: function (token, cb) {
    if (token) {
      var user = jwt.decode(token, 'monkeydonkeyeater');
      var findUser = Q.nbind(User.findOne, User);
      findUser({ email: user.email }).then(function(foundUser) {
        var newUser = {
          user: {
            email: foundUser.email,
            uType: foundUser.uType,
            _id: foundUser._id,
            profileId: foundUser.profileId
          }
        };
        foundUser ? cb(newUser) : cb(false);
      }).fail(function (error) {
        next(error);
      });
    }
  },

  dashboard: function(req, res, next) {
    var token = req.headers['x-access-token'];
    var user = module.exports.getUser(token, function(foundUser) {
      foundUser ? res.send(foundUser) : next(new Error('No user found!'));
    });
  },

  findUser: function(req, res, next, id) {
    var findUser = Q.nbind(User.findOne, User);
    findUser({ _id: id }).then(function (user) {
      req.queriedEmail =  user.email;
      next();
    }).fail(function (error) {
      next(new Error("No user found!"));
    });
  },

  sendUser: function(req, res, next) {
    res.send(req.queriedEmail);
  }
};
