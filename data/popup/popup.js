var background = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path == 'background-to-popup') {
          if (request.method === id) tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data) {chrome.runtime.sendMessage({"path": 'popup-to-background', "method": id, "data": data})}
  }
})();

var config = {};

config.max = 16.0;
config.step = 0.1;
config.min = 0.07;

config.adjust = function (e) {
  var e = Number(e);
  var tmp = e > config.max ? config.max : (e < config.min ? config.min : e);
  return tmp.toFixed(2);
};

config.load = function () {
  config.plus = document.getElementById("plus");
  config.reset = document.getElementById("reset");
  config.minus = document.getElementById("minus");
  config.reload = document.getElementById("reload");
  config.support = document.getElementById("support");
  config.range = document.getElementById("rate-range");
  config.value = document.getElementById("rate-value");
  config.donation = document.getElementById("donation");
  config.activate = document.getElementById("activate");
  /*  */
  config.range.addEventListener("input", function (e) {
    config.value.value = config.adjust(e.target.value);
    background.send("store", {"playbackRate": Number(config.value.value)});
  });
  /*  */
  config.value.addEventListener("change", function (e) {
    config.value.value = config.adjust(e.target.value);
    config.range.value = config.value.value;
    background.send("store", {"playbackRate": Number(config.value.value)});
  });
  /*  */
  config.reset.addEventListener("click", function () {
    config.value.value = 1;
    config.range.value = config.value.value;
    background.send("store", {"playbackRate": Number(config.value.value)});
  });
  /*  */
  config.plus.addEventListener("click", function () {
    var tmp = Number(config.value.value) + config.step;
    config.value.value = config.adjust(tmp);
    config.range.value = config.value.value;
    background.send("store", {"playbackRate": Number(config.value.value)});
  });
  /*  */
  config.minus.addEventListener("click", function () {
    var tmp = Number(config.value.value) - config.step;
    config.value.value = config.adjust(tmp);
    config.range.value = config.value.value;
    background.send("store", {"playbackRate": Number(config.value.value)});
  });
  /*  */
  config.reload.addEventListener("click", function () {background.send("reload")});
  config.support.addEventListener("click", function () {background.send("support")});
  config.donation.addEventListener("click", function () {background.send("donation")});
  config.activate.addEventListener("click", function () {background.send("activate")});
  /*  */
  background.send("load");
  window.removeEventListener("load", config.load, false);
};

background.receive("storage", function (e) {
  config.value.value = Number(e.playbackRate);
  config.range.value = config.value.value;
});

window.addEventListener("load", config.load, false);
