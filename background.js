let visitedUrls = [];
let startTime = null;
let timeSpent = 0;

function getDomain(url) {
  let hostname = new URL(url).hostname;
  if (hostname.startsWith("www.")) {
    hostname = hostname.slice(4);
  }
  return hostname;
}

function inArray(arr, item) {
  if (arr.length > 0) {
    for (let i = 0; i < arr.length; i++) {
      if (visitedUrls[i].url == item) {
        visitedUrls[i].timeSpent =
          (Date.now() - visitedUrls[i].timeStart) / 1000;
        return true;
      }
    }
  }
  return false;
}

function getVisitedUrls() {
  chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
      if (tab.url) {
        var tab_url = getDomain(tab.url);
        if (inArray(visitedUrls, tab_url) == false) {
          visitedUrls.push({
            id: tab.id,
            url: tab_url,
            timeSpent: timeSpent,
            timeStart: Date.now(),
          });
        }

        console.log("Visited URLs:", visitedUrls);
      }
      startTime = Date.now();
    });
  });
}

function refreshTabList(visitedurls) {
  chrome.tabs.query({}, function (tabs) {
    const tab = tabs;
    for (let i = 0; i < tab.length; i++) {
      if (inArray(visitedurls, getDomain(tabs[i].url))) {
        continue;
      }
    }
  });
}

function removeTab(tabs) {
  const _tabs = tabs;
  for (let i = 0; i < _tabs.length; i++) {
    if (_tabs[i].url !== "newtab") {
      if (_tabs[i].timeSpent > 30 * 60) {
        chrome.tabs.remove(_tabs[i].id, () => {
          console.log(`removed ${_tabs[i].url}`);
          _tabs.splice(i, 1);
        });
      }
    }
  }
}

getVisitedUrls();
setInterval(() => {
  refreshTabList(visitedUrls);
  console.log(visitedUrls);
}, 10000);

setInterval(() => {
  removeTab(visitedUrls);
  console.log(visitedUrls);
}, 10000);
