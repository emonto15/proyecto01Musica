/**
 * Created by ejrmontoya on 7/28/17.
 */
var mongoose = require('mongoose'),
    users = [],
    ids = [],
    Songs = mongoose.model('Songs'),
    Users = mongoose.model('Person');

module.exports = {

  createNewSong: function (title, artist, album, genre, userId, priv, sharedWith, callback) {
    var song;
    if(sharedWith.length > 0)
    {
      var usernames=sharedWith.split(',');
      Users.find({username: {$in: usernames}}, function (err, users) {
        if (users.length === usernames.length) {
          song = new Songs({
            title: title,
            artist: artist,
            album: album,
            genre: genre,
            owner: userId,
            private: priv,
            sharedWith: usernames
          });
          song.save(function (err,song) {
            return callback(err,false,false);
          })
        } else {
          song = new Songs({
            title: title,
            artist: artist,
            album: album,
            genre: genre,
            owner: userId,
            private: priv
          });
          song.save(function (err,song) {
            return callback(err,true,song._id);
          })
        }
      })
    }else {
      song = new Songs({
        title: title,
        artist: artist,
        album: album,
        genre: genre,
        owner: userId,
        private: priv,
        sharedWith: []
      });
      song.save(function (err, song) {
        return callback(err, false, false);
      })
    }
  },

  getPublicSongs: function (callback) {
    Songs.find({private:false}).limit(10).exec(function(err,songs){
      return callback(err,songs);
    })
  },

  getSong: function (id,callback) {
    Songs.findOne({_id:id},function (err,song) {
      return callback(err,song);
    })
  },

  getPublicSongsByTitle: function (title, callback) {
    Songs.find({title:{$regex:title}},{private: false},function (err, songs) {
      callback(err,songs);
    })
  },

  getPrivateSongsByTitle: function (title,userId,callback) {
    Songs.find({$and: [{title:{$regex:title}},{owner:userId}]},function (err, songs) {
      callback(err,songs)
    })
  },

  getSongsByUser: function (userId,callback) {
    Songs.find({owner:userId}, function (err, songs) {
      if(err){
        return callback(err,false)
      }
      return callback(false,songs)
    })
  },

  getSharedSongs: function (userId,callback) {
    Songs.find({sharedWith: userId},function (err,songs) {
      callback(null,songs)
    })
  },
  getSharedSongsByTitle: function (title,userId,callback) {
    Songs.find({$and: [{title:{$regex:title}},{sharedWith:userId}]},function (err, songs) {
      callback(err,songs)
    })
  },

  editSong: function (song,callback) {
    if(song.private===true){
      if(song.sharedWith.length > 0) {
        song.sharedWith=song.sharedWith.split(',');
        Users.find({username: {$in: song.sharedWith}}, function (err, users) {
          if (users.length === song.sharedWith.length) {
            Songs.findByIdAndUpdate(song.id, song, {new: true},function (err, song) {
              return callback(err,false,false);
            })
          }else{
            song.sharedWith=[];
            Songs.findByIdAndUpdate(song.id, song, {new: true},function (err, song) {
              return callback(err,true,song.id);
            })
          }
        })
      }else{
        Songs.findByIdAndUpdate(song.id, song, {new: true},function (err, song) {
          return callback(err,false,false);
        })
      }
    }else{
      Songs.findByIdAndUpdate(song.id, song, {new: true},function (err, song) {
        return callback(err,false,false);
      })
    }
  },

  deleteSong: function (id, callback) {
    Songs.findByIdAndRemove(id,function(err){
      return callback(err);
    })
  },

  deleteUserFromSong: function (id,userId, callback) {
    var cursor = Songs.find({owner:id}).cursor();
    cursor.on('data',function (song) {
      Songs.findByIdAndRemove(song._id,function (err) {})
    })
    cursor.on('end',function (err) {
      Songs.find({sharedWith: userId}, function (err, songs) {
        songs.filter(function (object) {
          object.sharedWith.splice(object.sharedWith.indexOf(userId), 1)
          var newSong=object
          Songs.findByIdAndUpdate(object._id, newSong, {new: true}, function (err, song) {
            callback(true)
          })
        })
      })
    })
  }
}
