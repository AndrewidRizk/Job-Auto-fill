chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'autofill') {
      chrome.storage.sync.get(['name', 'email', 'linkedin', 'github'], (data) => {
        document.querySelector('input[name="name"]').value = data.name || '';
        document.querySelector('input[name="email"]').value = data.email || '';
        document.querySelector('input[name="linkedin"]').value = data.linkedin || '';
        document.querySelector('input[name="github"]').value = data.github || '';
      });
    } else if (message.action === 'capture') {
      const jobTitle = document.querySelector('h1.job-title')?.innerText || 'No job title found';
      const companyName = document.querySelector('div.company-name')?.innerText || 'No company name found';
      
      chrome.storage.sync.set({ jobTitle, companyName }, () => {
        alert(`Captured Job: ${jobTitle} at ${companyName}`);
      });
    }
  });
  