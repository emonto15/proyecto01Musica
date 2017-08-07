var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'proyecto01musica'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/proyecto01musica-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'proyecto01musica'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/proyecto01musica-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'proyecto01musica'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://restapi:restapi@ds015962.mlab.com:15962/proyecto01musica-production'
  }
};

module.exports = config[env];
