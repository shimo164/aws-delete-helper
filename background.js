chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'fillDelete',
    title: 'Fill Delete',
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'fillDelete') {
    chrome.tabs.sendMessage(tab.id, { action: 'executeScript' });
  }
});

const isValidUrl = (url) => {
  return url.startsWith('http://') || url.startsWith('https://');
};

chrome.action.onClicked.addListener((tab) => {
  const url = tab.url;
  if (!isValidUrl(url)) return;

  chrome.tabs.sendMessage(tab.id, { action: 'executeScript' });
});
