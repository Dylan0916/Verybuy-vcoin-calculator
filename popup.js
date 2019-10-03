let tabID;

function getSelectedTab(tab) {
  tabID = tab.id;
}

function sendMessageToTab(messageObj) {
  chrome.tabs.sendMessage(tabID, messageObj);
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.getSelected(null, getSelectedTab);

  const counter = document.getElementById('counter');

  counter.addEventListener('click', () =>
    sendMessageToTab({ actions: 'calculate' }),
  );
});
