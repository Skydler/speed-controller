var app = {};

app.version = function () {return chrome.runtime.getManifest().version};
app.homepage = function () {return chrome.runtime.getManifest().homepage_url};

app.tab = {
  "reload": function () {chrome.tabs.reload()},
  "open": function (url) {chrome.tabs.create({"url": url, "active": true})},
  "active": function (callback) {
    chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
      if (tabs && tabs.length) {
        callback(tabs[0]);
      }
    });
  },
  "inject": function (tab) {    
    chrome.tabs.executeScript(tab.id, {
      "allFrames": true,
      "matchAboutBlank": true,
      "file": "/data/content_script/inject.js"
    }, function () {});
  }
};

if (!navigator.webdriver) {
  chrome.runtime.setUninstallURL(app.homepage() + "?v=" + app.version() + "&type=uninstall", function () {});
  chrome.runtime.onInstalled.addListener(function (e) {
    chrome.management.getSelf(function (result) {
      if (result.installType === "normal") {
        window.setTimeout(function () {
          var previous = e.previousVersion !== undefined && e.previousVersion !== app.version();
          var doupdate = previous && parseInt((Date.now() - config.welcome.lastupdate) / (24 * 3600 * 1000)) > 45;
          if (e.reason === "install" || (e.reason === "update" && doupdate)) {
            var parameter = (e.previousVersion ? "&p=" + e.previousVersion : '') + "&type=" + e.reason;
            app.tab.open(app.homepage() + "?v=" + app.version() + parameter);
            config.welcome.lastupdate = Date.now();
          }
        }, 3000);
      }
    });
  });
}

app.button = {
  "icon": function (e) {
    var options = {
      "path": {
        "16": "../../data/icons/" + (e && e.action ? e.action + '/' : '') + "16.png",
        "32": "../../data/icons/" + (e && e.action ? e.action + '/' : '') + "32.png",
        "48": "../../data/icons/" + (e && e.action ? e.action + '/' : '') + "48.png",
        "64": "../../data/icons/" + (e && e.action ? e.action + '/' : '') + "64.png"
      }
    };
    /*  */
    if (e.tabId) options["tabId"] = e.tabId;
    chrome.browserAction.setIcon(options);
  }
};

app.storage = (function () {
  var objs = {};
  window.setTimeout(function () {
    chrome.storage.local.get(null, function (o) {
      objs = o;
      var script = document.createElement("script");
      script.src = "../common.js";
      document.body.appendChild(script);
    });
  }, 300);
  /*  */
  return {
    "read": function (id) {return objs[id]},
    "write": function (id, data) {
      var tmp = {};
      tmp[id] = data;
      objs[id] = data;
      chrome.storage.local.set(tmp, function () {});
    }
  }
})();

app.popup = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "popup-to-background") {
          if (request.method === id) tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data, tabId) {
      chrome.runtime.sendMessage({
        "data": data,
        "method": id,
        "path": "background-to-popup"
      });
    }
  }
})();

app.content_script = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "page-to-background") {
          if (request.method === id) tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data, tabId) {
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
          if (tab.id === tabId) {
            chrome.tabs.sendMessage(tab.id, {
              "data": data,
              "method": id,
              "path": "background-to-page"
            });
          }
        });
      });
    }
  }
})();
