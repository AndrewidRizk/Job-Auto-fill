document.getElementById('capture').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'capture' });
    });
  });
  
// Send a message to the content script to trigger autofill
  // Helper function to fill the field and trigger input event
  function fillFieldByName(name, value) {
    const inputField = document.querySelector(`input[name='${name}']`);
    if (inputField) {
      inputField.value = value;
      inputField.dispatchEvent(new Event('input', { bubbles: true }));  // Trigger input event to update field
    } else {
      console.error(`Input field with name '${name}' not found`);
    }
  }
  
  document.getElementById('edit').addEventListener('click', () => {
    // Open an edit info modal or another popup
    chrome.tabs.create({ url: 'edit.html' });
  });
  
  // popup.js

// Function to execute autofill directly in popup
document.getElementById('autofillButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const userInfo = {
          name: "Andro Rizk",
          firstname: 'Andro',
          lastname: 'Rizk',
          email: "androwmaged47@gmail.com",
          phone: "6475627770",
          linkedin: "https://linkedin.com/in/andrewrizk",
          github: "https://github.com/andrewrizk",
          website: "https://andrewrizk.com",
          location: "26 George Robinson dr, Brampton, ont, L6Y 2M7", 
        };
        
        const inputFields = {
          name: ['input[name="name"]'],
          email: ['input[name="email"]'],
          phone: ['input[name="phone"]'],
          linkedin: ['input[name="urls[LinkedIn]"]'],
          github: ['input[name="urls[GitHub]"]'],
          website: ['input[name="urls[Portfolio]"]'],
          location: ['input[name="location"]'],
        };

        function fillField(selectors, value) {
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              element.value = value;
              element.dispatchEvent(new Event('input'));
              break;
            }
          }
        }

        fillField(inputFields.name, userInfo.name);
        fillField(inputFields.email, userInfo.email);
        fillField(inputFields.phone, userInfo.phone);
        fillField(inputFields.linkedin, userInfo.linkedin);
        fillField(inputFields.github, userInfo.github);
        fillField(inputFields.website, userInfo.website);
        fillField(inputFields.location, userInfo.location);
      }
    });
  });
});
