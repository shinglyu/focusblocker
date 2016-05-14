chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) { 
  if (tab.url.includes("facebook.com")){
    chrome.tabs.executeScript(tabId, {file: "data/block.js"});
  }
});
