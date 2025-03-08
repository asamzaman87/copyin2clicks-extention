chrome.runtime.onInstalled.addListener(() =>
{
    chrome.storage.local.set({ isOn: true, isPopupon: false });
    chrome.tabs.query({}, (tabs) =>
    {
        for (const tab of tabs)
        {
            if (!tab.url.match(/^(chrome|chrome-extension):\/\//gi))
            {
                chrome.tabs.reload(tab.id);
            }
        }
    });
});