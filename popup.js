document.getElementById('capture').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'capture' });
    });
  });
  
  document.getElementById('autofill').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'autofill' });
    });
  });
  
  document.getElementById('edit').addEventListener('click', () => {
    // Open an edit info modal or another popup
    chrome.tabs.create({ url: 'edit.html' });
  });
  