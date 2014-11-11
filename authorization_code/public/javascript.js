
        playlistIdsArray = [];
        songIdsArray = [];
      (function() {

        /**
         * Obtains parameters from the hash of the URL
         * @return Object
         */
        function getHashParams() {
          var hashParams = {};
          var e, r = /([^&;=]+)=?([^&;]*)/g,
              q = window.location.hash.substring(1);
          while ( e = r.exec(q)) {
             hashParams[e[1]] = decodeURIComponent(e[2]);
          }
          return hashParams;
        }

        // var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        //     userProfileTemplate = Handlebars.compile(userProfileSource),
        //     userProfilePlaceholder = document.getElementById('user-profile');

        var oauthSource = document.getElementById('oauth-template').innerHTML,
            oauthTemplate = Handlebars.compile(oauthSource),
            oauthPlaceholder = document.getElementById('oauth');

        var params = getHashParams();

        var access_token = params.access_token
            refresh_token = params.refresh_token,
            error = params.error;

        if (error) {
          alert('There was an error during the authentication');
        } else {
          if (access_token) {
            // render oauth info
            // oauthPlaceholder.innerHTML = oauthTemplate({
            //   access_token: access_token,
            //   refresh_token: refresh_token
            // });

            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                  // userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                  console.log("The Authorization response is: " + response.href);
                  $('#login').hide();
                  $('#loggedin').show();
                  playlistSongObjects = [];
                  playlistSongNames = [];
                  
                  getUserPlaylists = function(usernameParam){
                    //get list of playlists associated with user
                    //var myUserId = "andreas.jansson";
                    var myUserId = usernameParam;
                    $.ajax({
                        url: 'https://api.spotify.com/v1/users/' + myUserId + '/playlists',
                        headers: {
                          'Authorization': 'Bearer ' + access_token
                        },
                        success: function(response) {

                          for (var i = 0; i < response.items.length; i++) {
                            playlistIdsArray.push(response.items[i].id);
                          };
                          
                          for (var i = playlistIdsArray.length - 1; i >= 0; i--) {
                            //get data on each individual playlist associated with user 
                            $.ajax({
                              url: 'https://api.spotify.com/v1/users/' + myUserId + '/playlists/' + playlistIdsArray[i],
                              headers: {
                                'Authorization': 'Bearer ' + access_token
                              },
                              success: function(response) {
                                //console.log(response);
                                //debugger;
                                for (var i = 0; i < response.tracks.items.length; i++) {
                                  var track = response.tracks.items[i].track;
                                  //for each returned object, push the contents of the playlist on to the array. This should be a list of tracks
                                  playlistSongObjects.push(track.id);
                                  playlistSongNames.push(track.name);
                                  //debugger;
                                };
                                for (var i = 0; i < playlistSongObjects.length; i++) {
                                  console.log(playlistSongObjects[i]);
                                  console.log(playlistSongNames[i]);
                                  $("#song-list").append("<li>" + playlistSongNames[i] + "</li>");
                                };
                              }
                            });
                          };
                            
                        }
                    });
                  }

                  //console.log(playlistSongObjects)
                  $("#getUserPlaylists").click(function() {
                    //getUserPlaylists("namrekcam")
                      getUserPlaylists(125310539);
                      getUserPlaylists("namrekcam");
                    }

                  );
                  
                }
            });

          } else {
              // render initial screen
              $('#login').show();
              $('#loggedin').hide();
          }

          document.getElementById('obtain-new-token').addEventListener('click', function() {
            $.ajax({
              url: '/refresh_token',
              data: {
                'refresh_token': refresh_token
              }
            }).done(function(data) {
              access_token = data.access_token;
              oauthPlaceholder.innerHTML = oauthTemplate({
                access_token: access_token,
                refresh_token: refresh_token
              });
            });
          }, false);
        }
      })();
