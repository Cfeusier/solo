var Project = require('./projectModel.js');
var Profile = require('../np_profiles/profileModel.js');
var User = require('../users/userModel.js');
var Q = require('q');

module.exports = {

  index: function (req, res, next) {
    var findAll = Q.nbind(Project.find, Project);
    findAll({}).then(function (projects) {
      res.json(projects)
    }).fail(function (err) {
      next(err);
    })
  },

  create: function (req, res, next) {
    var projectTitle = req.body.title;
    var requirements = req.body.requirements;
    var npId = req.body.npId;

    var findOne = Q.nbind(Project.findOne, Project);

    findOne({ _id: npId }).then(function (err, project) {
      if (!project) {
        var createProject = Q.nbind(Project.create, Project);
        var newProj = {
          title: projectTitle,
          requirements: requirements,
          npId: npId
        };
        return createProject(newProj);
      }
    }).then(function (newProject) {
      var findUser = Q.nbind(Profile.findOne, Profile);

      findUser({ userId: npId }).then(function (profile) {
        profile.projects.push(newProject);
        profile.save();
      });

      res.send(newProject);
    }).fail(function (err) {
      console.error(err);
    });
  },

  sendProject: function (req, res, next) {
    var projectId = req.params.id;
    var findProj = Q.nbind(Project.findOne, Project);

    findProj({ _id: projectId }).then(function (proj) {
      res.send(proj);
    });


  }

};