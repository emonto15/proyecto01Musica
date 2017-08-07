/**
 * Created by ejrmontoya on 7/28/17.
 */
var songController=require('./controllers/songs'),
    userController= require('./controllers/users'),
    passportConfig = require('../config/passport'),
    express = require('express'),
    router = express.Router();

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function(req,res) {
    passportConfig.estaAutenticado(req, function (logged) {
      if (!logged) {
        if(req.query.term){
          songController.getPublicSongsByTitle(req.query.term,function (err,songs) {
            if(err){}
            if(songs.length>0){
              return res.status(200).render('home-public', {
                title: "home",
                uri: "login",
                text: "Login",
                songs: songs,
                searchBy: "Resultados para: "+req.query.term+"\"",
                message:""
              })
            }else{
              return res.status(200).render('home-public', {
                title: "home",
                uri: "login",
                text: "login",
                songs: [],
                searchBy: "Resultados para: "+req.query.term+"\"",
                message: "No se encontraron coincidencias!"
              })
            }
          })
        }else{
          songController.getPublicSongs(function (err, songs) {
            if (err) {
              console.log(err);
            } else {
              if(songs.length>0){
                return res.status(200).render('home-public', {
                  title: "home",
                  uri: "login",
                  text: "Login",
                  songs: songs,
                  searchBy: "",
                  message:""
                })
              }else{
                return res.status(200).render('home-public', {
                  title: "home",
                  uri: "login",
                  text: "Login",
                  songs: songs,
                  searchBy: "",
                  message:"No hay Canciones!"
                })
              }
            }
          })
        }
      }else{
        if(req.query.term){
          songController.getPublicSongsByTitle(req.query.term,function (err,songs) {
            if(err){}
            if(songs.length>0){
              return res.status(200).render('home-public', {
                title: "home",
                uri: "home",
                text: "Mis Canciones",
                songs: songs,
                searchBy: "Resultados para: "+req.query.term+"\"",
                message:""
              })
            }else{
              return res.status(200).render('home-public', {
                title: "home",
                uri: "home",
                text: "Mis canciones",
                songs: [],
                searchBy: "Resultados para: "+req.query.term+"\"",
                message: "No se encontraron coincidencias!"
              })
            }
          })
        }else{
          songController.getPublicSongs(function (err, songs) {
            if (err) {
              console.log(err);
            } else {
              return res.status(200).render('home-public', {
                title: "home",
                uri: "home",
                text: "Mis Canciones",
                songs: songs,
                searchBy: "",
                message:""
              })
            }
          })
        }
      }
    })
  });

router.get('/home', function (req,res) {
  passportConfig.estaAutenticado(req,function (logged) {
    if(logged){
      if(req.query.term){
        songController.getPrivateSongsByTitle(req.query.term,req.user._id,function (err,songs) {
          if(err){
          }
          if(songs.length>0){
            return res.render('home',{
              title: "Mis canciones",
              songs: songs,
              searchBy: "Resultados para: \""+req.query.term+"\"",
              message: ""
            })
          }else{
            return res.render('home',{
              title: "Mis canciones",
              songs: [],
              searchBy: "Resultados para: \""+req.query.term+"\"",
              message: "No se encontraron coincidencias"
            })
          }
        })
      }else{
        songController.getSongsByUser(req.user._id,function (err,songs) {
          if(err){
          }
          if(songs.length>0){
            return res.render('home',{
              title: "Mis canciones",
              songs: songs,
              message: "",
              searchBy:""
            })
          }else{
            return res.render('home',{
              title: "Mis canciones",
              songs: [],
              message: "No Hay Canciones!",
              searchBy:""
            })
          }
        })
      }
    }else{
      return res.render('home-notAuth')
    }
  })
});

router.get('/sharedWithMe',function (req,res) {
  passportConfig.estaAutenticado(req,function (logged) {
    if(logged){
      if(req.query.term){
        songController.getSharedSongsByTitle(req.query.term,req.user.username,function (err,songs) {
          if(!err){
            if(songs.length>0){
              res.status(200).render('sharedWithMe',{
                title: "Compartidas conmigo",
                songs: songs,
                searchBy: "Resultados para: \""+req.query.term+"\"",
                message: ""
              })
            }else{
              res.status(200).render('sharedWithMe',{
                title: "Compartidas conmigo",
                songs: songs,
                searchBy: "Resultados para: \""+req.query.term+"\"",
                message: "No se encontraron coincidencias"
              })
            }
          }
        })
      }else{
        songController.getSharedSongs(req.user.username,function (err,songs) {
          if(!err){
            if(songs.length>0){
              res.status(200).render('sharedWithMe',{
                title: "Compartidas conmigo",
                songs: songs,
                searchBy: "",
                message: ""
              })
            }else{
              res.status(200).render('sharedWithMe',{
                title: "Compartidas conmigo",
                songs: songs,
                searchBy: "",
                message: "No Tienes Canciones Compartidas!"
              })
            }
          }
        })
      }
    }else{
      return res.render('home-notAuth')
    }
  })
});

router.get('/login',function (req,res) {
  res.status(200).render('login',{
    title:"Login",
    message: ""
  })
});

router.get('/newSong',function (req,res) {
  return res.status(200).render('newSong',{
    title:"Crea una cancion",
    userId: req.user._id
  });
});

router.post('/newSong',function (req,res) {
  if (req.body.private === "") {
    songController.createNewSong(req.body.title, req.body.artist, req.body.album, req.body.genre, req.user._id, false, req.body.sharedWith, function (err) {
      if (err) return res.status(500).render('error', {
        message: err.message,
        error: err
      })
       return res.redirect('home');
    })
  }else {
    songController.createNewSong(req.body.title, req.body.artist, req.body.album, req.body.genre, req.user._id, true,req.body.sharedWith, function (err, shareError, songId) {
      if (err) {
        return res.status(500).render('error', {
          message: err.message,
          error: err
        })
      } else {
        if (shareError) {
          songController.getSong(songId, function (err, song) {
            if(err) res.status(500).render('error',{
              message: err.message,
              error: err
            })
            res.status(200).render('editSong',{
              title: 'editar',
              message: 'Tu cancion fue creada exitosamente, pero no reconocimos uno o varios de los usuarios con los que compartirste la cancion, porfavor verifica esta información',
              song: song
            })
          })
        }
        res.redirect('./')
      }
    })
  }
});

router.post('/editSong',function (req,res) {
  if (req.body.private !== "on") {
    req.body.private=false;
    songController.editSong(req.body, function (err) {
      if (err) return res.status(500).render('error', {
        message: err.message,
        error: err
      })
      return res.redirect('home');
    })
  }else {
    req.body.private=true;

    songController.editSong(req.body,function (err, shareError, songId) {
      if (err) {
        return res.status(500).render('error', {
          message: err.message,
          error: err
        })
      } else {
        if (shareError) {
          songController.getSong(songId, function (err, song) {
            if(err) res.status(500).render('error',{
              message: err.message,
              error: err
            })
            res.status(200).render('editSong',{
              title: 'editar',
              message: 'Tu cancion fue editada exitosamente, pero no reconocimos uno o varios de los usuarios con los que compartirste la cancion, porfavor verifica esta información',
              song: song,
              checked: ""
            })
          })
        }else{
          return res.redirect('home');
        }
      }
    })
  }
});

router.get('/editSong', function (req, res) {
  songController.getSong(req.query.id, function (err, song) {
    if(song){
      if(err) res.status(500).render('error',{
        message: err.message,
        error: err
      })
      if(song.private===true){
        return res.status(200).render('editSong',{
          title: 'editar',
          message: '',
          song: song,
          checked: false
        })
      }else{
        res.status(200).render('editSong',{
          title: 'editar',
          message: '',
          song: song,
          checked: true
        })
      }
    }else{
      return res.render('songNotFound')
    }
  })
});

router.post('/deleteSong', function (req, res) {
  songController.deleteSong(req.body.id,function (err) {
    if(err) res.status(500).render('error', {
      message: err.message,
      error: err
    })

    songController.getSongsByUser(req.user._id,function (err, songs) {
      if(songs.length>0){
        return res.status(200).render('home', {
          title: "home",
          songs: songs,
          searchBy: "",
          message: ""
        })
      }else{
        return res.status(200).render('home', {
          title: "home",
          songs: songs,
          searchBy: "",
          message: "No Hay Canciones!"
        })
      }
    })
  })
});

router.post('/signup',function (req,res) {
  userController.signupUser(req.body.username, req.body.password,req, function (err, created) {
    if(err){
      console.log(err);
      return res.status(500).render('error',{
        message: err.message,
        error: err
      })
    }else{
      if(created){
        songController.getPublicSongs(function (err, songs) {
          if (err) {
            console.log(err);
          } else {
            if(songs.length>0){
              return res.status(200).render('home-public', {
                title: "home",
                uri: "home",
                text: "Mis canciones",
                songs: songs,
                searchBy: "",
                message: ""
              })
            }else{
              return res.status(200).render('home-public', {
                title: "home",
                uri: "home",
                text: "Mis canciones",
                songs: [],
                searchBy: "",
                message: "No hay Canciones!"
              })
            }
          }
        })
      }else{
        res.render('register', {
          title: "Registro",
          message: "El usuario ya existe"
        })
      }
    }
  })
});

router.get('/signup', function (req,res) {
  res.status(200).render('register',{
      title: "Registro",
      message: ""
    })
});

router.post('/login',function(req,res){
  userController.loginUser(req, function (err,user,info) {
    if(err){
      console.log(err);
      return res.status(500).render('error',{
        message: err.message,
        error: err
      })
    }
    if(info){
      return res.status(401).render('login', {
        title: "Login",
        message: info.message
      })
    }else{
      return res.redirect('/home')
    }
  })
});

router.get('/logout', function (req,res) {
  passportConfig.estaAutenticado(req, function (logged) {
    if (logged) {
      userController.logoutUser(req,function () {
        return res.redirect('./');
      })
    } else {
      return res.redirect('/test');
    }
  })
});

router.get('/profile', function (req,res) {
  passportConfig.estaAutenticado(req,function (logged) {
    if(logged){
      res.render('profile',{
        title: "Perfil",
        username: req.user.username,
        message: ""
      })
    }
  })
});

router.post('/updateProfile',function (req,res) {
  passportConfig.estaAutenticado(req,function (logged) {
    if(logged){
      userController.updateUser(req,req.body,function (success) {
        if(success){
          res.redirect('/login');
        }
      })
    }
  })
});

router.get('/deleteUser',function (req,res) {
  passportConfig.estaAutenticado(req,function (logged) {
    if(logged){
      userController.deleteUser(req,req.user.username,function (done) {
        if(done){
          res.redirect('./')
        }
      });
    }
  })
});
