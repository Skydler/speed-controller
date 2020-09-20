var core = {
  "send": {
    "page": function () {
      app.tab.active(function (tab) {        
        app.content_script.send("storage", {
          "playbackRate": Number(config.playback.rate)
        }, tab.id);
      });
    }
  }
};

app.popup.receive("store", function (e) {
  config.playback.rate = e.playbackRate;
  core.send.page();
});

app.popup.receive("activate", function () {
  app.tab.active(function (tab) {
    app.tab.inject(tab);
  });
});

app.content_script.receive("playbackrate-success", function () {
  app.tab.active(function (tab) {
    app.button.icon({"tabId": tab.id, "action": "ON"});
  });
});

app.popup.receive("reload", function () {app.tab.reload()});
app.popup.receive("support", function () {app.tab.open(app.homepage())});
app.popup.receive("donation", function () {app.tab.open(app.homepage() + "?reason=support")});
app.popup.receive("load", function () {app.popup.send("storage", {"playbackRate": config.playback.rate})});

app.content_script.receive("load", core.send.page);
window.setTimeout(function () {app.button.icon({"action": "OFF"})}, 300);
