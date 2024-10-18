chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isOn: true , isPopupon: true});
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (!tab.url.match(/^(chrome|chrome-extension):\/\//gi)) {
        chrome.tabs.reload(tab.id);
      }
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchUserData") {
    fetch("https://www.copyin2clicks.com/api/user-details")
      // fetch('http://localhost:3000/api/user-details')
      .then((response) => response.json())
      .then((data) => sendResponse(data))
      .catch((error) => sendResponse({ error: error.message }));
    return true; // Keep the message channel open for sendResponse
  }
});
