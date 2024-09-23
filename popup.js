document.getElementById('capture').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'capture' });
  });
});

// Function to fill fields based on labels and other attributes
document.getElementById('autofillButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {

        // User information to autofill
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
          city: "Brampton",
          province: "Ontario",
          country: "Canada",
          university: 'York University',
          postalcode: "L6Y 2M7",
          graduationDate: 'May 2026'
        };

        // Mapping of input fields
        const inputMapping = {
          location: ['address', 'location'],
          firstname: ['first name', 'legal first name'],
          email: ['username', 'email', 'e-mail', 'login'],
          phone: ['phone', 'mobile', 'telephone', 'number'],
          linkedin: ['linkedin'],
          github: ['github'],
          website: ['website', 'portfolio', 'other website'],
          city: ['city'],
          province: ['state', 'province'],
          country: ["country"],
          university: ["university", "school"],
          postalcode: ['zip', 'postal', 'postal code', 'zip code'],
          name: ['name', 'full name', 'legal full name'],
          graduationDate: ['Expected'],
          study: ['Area(s) of study']

        };

        // Function to zoom into iframe if it exists
        const switchToIframe = () => {
          const iframes = document.querySelectorAll('iframe');
          for (let iframe of iframes) {
            try {
              const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
              if (iframeDocument) {
                return iframeDocument;
              }
            } catch (e) {
              console.warn('Could not access iframe:', e);
            }
          }
          return document;
        };

        // Function to fill fields based on labels, placeholder, or name attribute
        const fillFieldFromLabel = (keywords, value, doc = document) => {
          const labels = Array.from(doc.querySelectorAll('label'));

          for (const label of labels) {
            for (const keyword of keywords) {
              if (new RegExp(keyword, 'i').test(label.innerText)) {
                const inputId = label.getAttribute('for');
                const inputElement = doc.getElementById(inputId);

                if (inputElement) {
                  console.log(`Filling input: ${inputId}`);
                  inputElement.value = value;
                  inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                  return true;
                } else {
                  console.warn(`Input not found for label "${label.innerText}" with for="${inputId}"`);
                }
              }
            }
          }

          // If no matching label was found, try using placeholders or name attributes
          const inputs = Array.from(doc.querySelectorAll('input, textarea'));
          for (const input of inputs) {
            const placeholder = input.getAttribute('placeholder');
            const name = input.getAttribute('name');
            for (const keyword of keywords) {
              if (
                (placeholder && new RegExp(keyword, 'i').test(placeholder)) ||
                (name && new RegExp(keyword, 'i').test(name))
              ) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                return true;
              }
            }
          }
          
          return false;
        };

        // Switch to iframe context if necessary
        const doc = switchToIframe();

        // Array to store errors
        const errors = [];

        // Fill each field based on the mapping
        const fillField = (keywords, value) => {
          const success = fillFieldFromLabel(keywords, value, doc);
          if (!success) {
            errors.push(`Failed to find input for: ${keywords.join(', ')}`);
          }
        };

        fillField(inputMapping.name, userInfo.name);
        fillField(inputMapping.email, userInfo.email);
        fillField(inputMapping.phone, userInfo.phone);
        fillField(inputMapping.linkedin, userInfo.linkedin);
        fillField(inputMapping.github, userInfo.github);
        fillField(inputMapping.website, userInfo.website);
        fillField(inputMapping.location, userInfo.location);
        fillField(inputMapping.city, userInfo.city);
        fillField(inputMapping.province, userInfo.province);
        fillField(inputMapping.postalcode, userInfo.postalcode);

        // Notify user of success or errors
        if (errors.length > 0) {
          alert('Some fields could not be autofilled:\n' + errors.join('\n'));
          console.error(errors.join('\n'));
        } else {
          alert('Autofill successful!');
        }
      }
    });
  });
});

// Edit button functionality
document.getElementById('edit').addEventListener('click', () => {
  chrome.tabs.create({ url: 'edit.html' });
});
