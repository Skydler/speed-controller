if (!background) {
  var background = (function () {
    var tmp = {};
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      for (var id in tmp) {
        if (tmp[id] && (typeof tmp[id] === "function")) {
          if (request.path === "background-to-page") {
            if (request.method === id) tmp[id](request.data);
          }
        }
      }
    });
    /*  */
    return {
      "receive": function (id, callback) {tmp[id] = callback},
      "send": function (id, data) {chrome.runtime.sendMessage({"path": "page-to-background", "method": id, "data": data})}
    }
  })();
  /*  */
  background.receive("storage", function (e) {
    var videos = document.querySelectorAll("video, audio");
    if (videos && videos.length) {
      for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        var flag_1 = video.paused === false;
        var flag_2 = video.playbackRate !== e.playbackRate;
        if (flag_1 && flag_2) {
          video.playbackRate = e.playbackRate;
          background.send("playbackrate-success", {});
        }
      }
    }
  });
  /*  */
  background.send("load", {});
} else background.send("load", {});
