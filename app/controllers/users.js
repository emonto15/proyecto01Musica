/**
 * Created by ejrmontoya on 27/07/2017.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('Person'),
  songs = require('./songs'),
  passport = require('passport');

module.exports = {
  /*@param username: username of the user to create.
    @param password: password of the user to create.
    @callback next: return if there was an error, and true if the user was successfully created, or false if there was a problem or the user already exists.
   */
  signupUser: function (username, passwd,req, next) {
    var user = new User({
      username: username,
      password: passwd
    });
    User.findOne({username: username}, function (err, person) {
      if (person) {
        return next(false,false)
      }
      user.save(function (err) {
        if (err) {
          next(err,false)
        }
        //this method login the user after the creation.
        req.logIn(user, function (err) {
          if (err) {
            next(err,false);
          }
          next(false,true)
        })
      })
    })
  },
  loginUser: function (req,next) {
    passport.authenticate('local', function (err, user, info) {
      if (err) {
        return next(err,false,false)
      }
      if (!user) {
        return next(false,false,info)

      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err,false,false);
        }
        songs.getSongsByUser(user._id,function (err,songs) {
          if(!err){
            user.songs = songs
            return next(false,user,false)
          }
        })
      })
    })(req,next);
  },
  logoutUser: function (req,next) {
    req.logout();
    next();
  },
  updateUser: function (req,user,callback) {
    if(req.user.username===user.username){
      if(req.user.password===user.password1){
        delete user.password1;
        User.findByIdAndUpdate(req.user._id,user,{new:true},function (err,user) {
          req.logOut();
          if(!err){
           return callback(true)
          }
        })
      }else{
        return callback(false)
      }
    }
  },
  deleteUser: function (req,userId,callback) {
    songs.deleteUserFromSong(req.user._id,userId,function (deleted) {
      if(deleted){
        User.findByIdAndRemove(req.user._id,function (err,user) {
          req.logOut()
          callback(true);
        })
      }
    })
  },
};
