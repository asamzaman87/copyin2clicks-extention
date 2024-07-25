chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isOn: true });
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
