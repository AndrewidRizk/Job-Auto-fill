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
          graduationDate: ['expected graduation date', 'graduation date'],
          study: ['area(s) of study']
        };

        // Array to store errors
        const errors = [];

        // Array to store inputs that have been filled
        const filledInputs = [];

        // Counter for total fields to fill and successful fills
        const totalFields = Object.keys(inputMapping).length;
        let successfulFills = 0;

        // Function to fill fields based on labels, placeholder, or name attribute
        const fillFieldFromLabel = (keywords, value, filledInputs, doc = document) => {
          const labels = Array.from(doc.querySelectorAll('label'));

          for (const label of labels) {
            for (const keyword of keywords) {
              if (new RegExp(keyword, 'i').test(label.innerText)) {
                const inputId = label.getAttribute('for');
                const inputElement = doc.getElementById(inputId);

                if (inputElement && !filledInputs.includes(inputElement)) {
                  inputElement.value = value;
                  inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                  filledInputs.push(inputElement);
                  successfulFills++;
                  return true;
                }
              }
            }
          }

          // If no matching label was found, try using placeholders or name attributes
          const inputs = Array.from(doc.querySelectorAll('input, textarea, select'));
          for (const input of inputs) {
            if (filledInputs.includes(input)) {
              continue; // Skip if already filled
            }
            const placeholder = input.getAttribute('placeholder');
            const name = input.getAttribute('name');
            for (const keyword of keywords) {
              if (
                (placeholder && new RegExp(keyword, 'i').test(placeholder)) ||
                (name && new RegExp(keyword, 'i').test(name))
              ) {
                if (input.tagName.toLowerCase() === 'select') {
                  // Handle select (dropdown)
                  const options = Array.from(input.options);
                  const matchingOption = options.find(option => new RegExp(value, 'i').test(option.text));
                  if (matchingOption) {
                    input.value = matchingOption.value;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    filledInputs.push(input);
                    successfulFills++;
                    return true;
                  }
                } else {
                  input.value = value;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  filledInputs.push(input);
                  successfulFills++;
                  return true;
                }
              }
            }
          }

          return false;
        };

        // Function to fill fields in a document and its accessible iframes
        const fillFieldsInDocument = (doc) => {
          // Fill each field based on the mapping in this document
          const fillField = (keywords, value) => {
            const success = fillFieldFromLabel(keywords, value, filledInputs, doc);
            if (!success) {
              errors.push(`Failed to find input for: ${keywords.join(', ')}`);
            }
          };

          for (const key in inputMapping) {
            fillField(inputMapping[key], userInfo[key] || '');
          }

          // Recursively fill fields in accessible iframes
          const iframes = doc.querySelectorAll('iframe');
          for (let iframe of iframes) {
            try {
              const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
              if (iframeDocument) {
                fillFieldsInDocument(iframeDocument);
              }
            } catch (e) {
              console.warn('Could not access iframe:', e);
            }
          }
        };

        // Start filling fields from the main document
        fillFieldsInDocument(document);

        // Calculate the percentage of fields filled
        const percentage = Math.round((successfulFills / totalFields) * 100);

        // Create the report
        const createReport = () => {
          // Remove existing report if any
          const existingReport = document.getElementById('autofill-report');
          if (existingReport) {
            existingReport.remove();
          }

          // Create report container
          const reportDiv = document.createElement('div');
          reportDiv.id = 'autofill-report';
          reportDiv.style.position = 'fixed';
          reportDiv.style.bottom = '10px';
          reportDiv.style.right = '10px';
          reportDiv.style.backgroundColor = '#f9f9f9';
          reportDiv.style.border = '1px solid #ccc';
          reportDiv.style.padding = '10px';
          reportDiv.style.borderRadius = '5px';
          reportDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
          reportDiv.style.zIndex = '9999';
          reportDiv.style.fontFamily = 'Arial, sans-serif';
          reportDiv.style.fontSize = '14px';
          reportDiv.style.color = '#333';

          // Create content
          const percentageText = document.createElement('p');
          percentageText.textContent = `Autofill completed: ${percentage}%`;

          const errorCount = errors.length;
          const errorText = document.createElement('p');
          errorText.textContent = `${errorCount} field(s) not found`;

          // Create a button or link to show/hide details
          if (errorCount > 0) {
            const toggleButton = document.createElement('button');
            toggleButton.textContent = 'Show Details';
            toggleButton.style.marginTop = '5px';
            toggleButton.style.cursor = 'pointer';
            toggleButton.style.backgroundColor = '#007BFF';
            toggleButton.style.color = '#fff';
            toggleButton.style.border = 'none';
            toggleButton.style.padding = '5px 10px';
            toggleButton.style.borderRadius = '3px';

            const errorList = document.createElement('ul');
            errorList.style.display = 'none';
            errorList.style.listStyleType = 'disc';
            errorList.style.marginTop = '10px';
            errorList.style.paddingLeft = '20px';

            for (const error of errors) {
              const li = document.createElement('li');
              li.textContent = error;
              errorList.appendChild(li);
            }

            toggleButton.addEventListener('click', () => {
              if (errorList.style.display === 'none') {
                errorList.style.display = 'block';
                toggleButton.textContent = 'Hide Details';
              } else {
                errorList.style.display = 'none';
                toggleButton.textContent = 'Show Details';
              }
            });

            reportDiv.appendChild(percentageText);
            reportDiv.appendChild(errorText);
            reportDiv.appendChild(toggleButton);
            reportDiv.appendChild(errorList);
          } else {
            reportDiv.appendChild(percentageText);
          }

          // Append to body
          document.body.appendChild(reportDiv);
        };

        // Create the report
        createReport();
      }
    });
  });
});

// Edit button functionality
document.getElementById('edit').addEventListener('click', () => {
  chrome.tabs.create({ url: 'edit.html' });
});
