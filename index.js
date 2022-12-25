var fs = require("fs");
var SpotifyWebApi = require("spotify-web-api-node");
var Config = require("./config.json");
var scrobbles = require("./scrobbles.json");

async function main() {

  // For coping with spotify's rate limiting
  let retryWrapper = (client, param, limit) => {
    return new Promise((resolve, reject) => {
      client
        .searchTracks(param, limit)
        .then((data) => resolve(data))
        .catch((err) => {
          // If we get a 'too many requests' error then wait and retry
          if (err.statusCode === 429) {
            setTimeout(() => {
              client
                .searchTracks(param, limit)
                .then((data) => resolve(data))
                .catch((err) => reject(err));
            }, parseInt(err.headers["retry-after"]) * 1000 + 1000);
          } else {
            reject(err);
          }
        });
    });
  };

  // Configure your stuff in the config.json, and get an initial refreshToken and accessToken pair, the rest gets handled
  var spotifyApi = new SpotifyWebApi({
    accessToken: Config.access_token,
    refreshToken: Config.refresh_token,
    clientId: Config.client_id,
    clientSecret: Config.client_secret,
    redirectUri: Config.redirectUri,
  });

  let result = [];

  for (let page = 0; page < scrobbles.length; page++) {
    var pageV = scrobbles[page];

    for (let i = 0; i < pageV.length; i++) {
      var track = pageV[i];
      if (track["date"] == undefined) {
        continue;
      }

      // If you need to filter out streams before/after a particular UTC Timestamp, feel free to edit or else delete
      if (1664537585 > +track["date"]["uts"]) {
        let date = new Date(+track["date"]["uts"] * 1000).toISOString();
        try {
          var request = await retryWrapper(
            spotifyApi,
            `${track["name"] != "" ? "track:" : ""}${track["name"]} ${
              track["artist"]["#text"] != "" ? "artist:" : ""
            }${track["artist"]["#text"]}`,
            { limit: 3 }
          ).catch((err) => {
            throw err;
          });
        } catch (err) {
          if (err.statusCode == 401) {
            const result = await spotifyApi.refreshAccessToken();
            spotifyApi.setAccessToken(result.body.access_token);
            i--;
            continue;
          } else {
            console.log("i:" + i + " => Error: " + err);
            i--;
            continue;
          }
        }

        if (request.body.tracks.items[0] != undefined) {
          let duration = request.body.tracks.items[0]["duration_ms"];
          let id = request.body.tracks.items[0]["uri"];
          let name = request.body.tracks.items[0]["name"];

          result.push({
            ts: date,
            ms_played: duration,
            master_metadata_track_name: name,
            spotify_track_uri: id,
          });
        } else {
          console.log("page=" + page + "i=" + i + ". No Search results");
          continue;
        }
      }
    }
    
    // !! Create a folder named results, else this'll error out !!
    if (page % Config.pages_per_file == 0 && page > 0) {
      fs.writeFileSync(
        "./results/data" +
          (page - Config.pages_per_file).toString() +
          "_" +
          page +
          ".json",
        JSON.stringify(result, null, 4),
        "utf-8"
      );
      result = [];
    }
  }

  if (page % Config.pages_per_file == 0 && page > 0) {
    fs.writeFileSync(
      "./results/data" + page + ".json",
      JSON.stringify(result, null, 4),
      "utf-8"
    );
    result = [];
  }

  return [page, i, result];
}

main().then((result) => {
  console.log(result[0] + " " + result[1]);
});
