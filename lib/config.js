var config = {};

config.welcome = {
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.playback = {
  set rate (val) {app.storage.write("playback-rate", val)},
  get rate () {return app.storage.read("playback-rate") !== undefined ? app.storage.read("playback-rate") : 2}
};
