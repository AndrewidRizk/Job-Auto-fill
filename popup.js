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
          location: "26 George Robinson dr, Brampton, ON, L6Y 2M7",
          city: "Brampton",
          province: "Ontario",
          country: "Canada",
          university: 'York University',
          postalcode: "L6Y 2M7",
          graduationDate: 'May 2026',
          study: 'Computer Science'
        };

        // Mapping of input fields
        const inputMapping = {
          location: ['address', 'location'],
          firstname: ['first name', 'legal first name', 'given name'],
          lastname: ['last name', 'surname', 'family name'],
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
          graduationDate: ['expected graduation date', 'graduation date', 'grad date'],
          study: ['area(s) of study', 'major', 'field of study']
        };

        // Arrays to store filled and unfilled fields
        const filledFields = [];
        const unfilledFields = [];

        // Object to store inputs that have been filled
        const filledInputs = new Set();

        // Function to fill fields based on labels, placeholder, or name attribute
        const fillFieldFromLabel = (fieldKey, keywords, value, doc = document) => {
          const labels = Array.from(doc.querySelectorAll('label'));
          const fieldRegex = new RegExp(keywords.join('|'), 'i');

          // Try to find input associated with a label
          for (const label of labels) {
            if (fieldRegex.test(label.innerText)) {
              const inputId = label.getAttribute('for');
              let inputElement = doc.getElementById(inputId);

              if (!inputElement) {
                // Try to find input inside the label element
                inputElement = label.querySelector('input, select, textarea');
              }

              if (inputElement && !filledInputs.has(inputElement)) {
                if (fillInputElement(inputElement, value)) {
                  filledInputs.add(inputElement);
                  filledFields.push(fieldKey);
                  return true;
                }
              }
            }
          }

          // If no matching label was found, try using placeholders or name attributes
          const inputs = Array.from(doc.querySelectorAll('input, textarea, select'));
          for (const input of inputs) {
            if (filledInputs.has(input)) {
              continue; // Skip if already filled
            }
            const placeholder = input.getAttribute('placeholder');
            const name = input.getAttribute('name');
            const ariaLabel = input.getAttribute('aria-label');
            const labelText = input.labels && input.labels[0] ? input.labels[0].innerText : '';

            if (
              (placeholder && fieldRegex.test(placeholder)) ||
              (name && fieldRegex.test(name)) ||
              (ariaLabel && fieldRegex.test(ariaLabel)) ||
              (labelText && fieldRegex.test(labelText))
            ) {
              if (fillInputElement(input, value)) {
                filledInputs.add(input);
                filledFields.push(fieldKey);
                return true;
              }
            }
          }

          return false;
        };

        // Function to fill input elements, handling different types
        const fillInputElement = (input, value) => {
          if (input.tagName.toLowerCase() === 'select') {
            // Handle select (dropdown)
            const options = Array.from(input.options);
            // Try to match the value with option text or value
            let matchingOption = options.find(option => new RegExp(`^${value}$`, 'i').test(option.text.trim()));
            if (!matchingOption) {
              matchingOption = options.find(option => new RegExp(`^${value}$`, 'i').test(option.value.trim()));
            }
            if (matchingOption) {
              input.value = matchingOption.value;
              input.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            } else {
              // If exact match not found, try partial match
              matchingOption = options.find(option => new RegExp(value, 'i').test(option.text));
              if (matchingOption) {
                input.value = matchingOption.value;
                input.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
              }
            }
          } else {
            // Handle input and textarea
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
          }
          return false;
        };

        // Function to fill fields in a document and its accessible iframes
        const fillFieldsInDocument = (doc) => {
          // Fill each field based on the mapping in this document
          const fillField = (fieldKey, keywords, value) => {
            const success = fillFieldFromLabel(fieldKey, keywords, value, doc);
            if (!success) {
              if (!unfilledFields.includes(fieldKey)) {
                unfilledFields.push(fieldKey);
              }
            }
          };

          for (const key in inputMapping) {
            fillField(key, inputMapping[key], userInfo[key] || '');
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
        const totalFields = Object.keys(inputMapping).length;
        const successfulFills = filledFields.length;
        const percentage = Math.round((successfulFills / totalFields) * 100);

        // Create the report with circular chart and progress bar
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
          reportDiv.style.backgroundColor = '#fff';
          reportDiv.style.border = '1px solid #ccc';
          reportDiv.style.padding = '15px';
          reportDiv.style.borderRadius = '10px';
          reportDiv.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
          reportDiv.style.zIndex = '9999';
          reportDiv.style.fontFamily = 'Arial, sans-serif';
          reportDiv.style.fontSize = '14px';
          reportDiv.style.color = '#333';
          reportDiv.style.maxWidth = '350px';
          reportDiv.style.maxHeight = '450px';
          reportDiv.style.overflowY = 'auto';
          reportDiv.style.textAlign = 'center';

          // Create circular percentage chart using SVG
          const svgNS = "http://www.w3.org/2000/svg";
          const chartSize = 100;
          const radius = (chartSize / 2) - 5;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (percentage / 100) * circumference;

          const svg = document.createElementNS(svgNS, 'svg');
          svg.setAttribute('width', chartSize);
          svg.setAttribute('height', chartSize);
          svg.style.display = 'block';
          svg.style.margin = '0 auto';

          // Background circle
          const bgCircle = document.createElementNS(svgNS, 'circle');
          bgCircle.setAttribute('cx', chartSize / 2);
          bgCircle.setAttribute('cy', chartSize / 2);
          bgCircle.setAttribute('r', radius);
          bgCircle.setAttribute('fill', 'none');
          bgCircle.setAttribute('stroke', '#e6e6e6');
          bgCircle.setAttribute('stroke-width', '10');
          svg.appendChild(bgCircle);

          // Foreground circle
          const fgCircle = document.createElementNS(svgNS, 'circle');
          fgCircle.setAttribute('cx', chartSize / 2);
          fgCircle.setAttribute('cy', chartSize / 2);
          fgCircle.setAttribute('r', radius);
          fgCircle.setAttribute('fill', 'none');
          fgCircle.setAttribute('stroke', '#4caf50');
          fgCircle.setAttribute('stroke-width', '10');
          fgCircle.setAttribute('stroke-dasharray', circumference);
          fgCircle.setAttribute('stroke-dashoffset', offset);
          fgCircle.setAttribute('transform', `rotate(-90 ${chartSize / 2} ${chartSize / 2})`);
          svg.appendChild(fgCircle);

          // Percentage text in the center
          const percentageText = document.createElement('div');
          percentageText.textContent = `${percentage}%`;
          percentageText.style.position = 'absolute';
          percentageText.style.top = '50%';
          percentageText.style.left = '50%';
          percentageText.style.transform = 'translate(-50%, -50%)';
          percentageText.style.fontSize = '24px';
          percentageText.style.fontWeight = 'bold';

          const svgContainer = document.createElement('div');
          svgContainer.style.position = 'relative';
          svgContainer.style.display = 'inline-block';
          svgContainer.appendChild(svg);
          svgContainer.appendChild(percentageText);

          // Progress bar
          const progressBarContainer = document.createElement('div');
          progressBarContainer.style.width = '100%';
          progressBarContainer.style.backgroundColor = '#e6e6e6';
          progressBarContainer.style.borderRadius = '5px';
          progressBarContainer.style.marginTop = '15px';
          progressBarContainer.style.height = '20px';
          progressBarContainer.style.overflow = 'hidden';

          const progressBar = document.createElement('div');
          progressBar.style.width = `${percentage}%`;
          progressBar.style.height = '100%';
          progressBar.style.backgroundColor = '#4caf50';

          progressBarContainer.appendChild(progressBar);

          // Success and error counts
          const successCountText = document.createElement('p');
          successCountText.textContent = `${successfulFills} field(s) filled successfully`;
          successCountText.style.marginTop = '15px';

          const errorCount = unfilledFields.length;
          const errorText = document.createElement('p');
          errorText.textContent = `${errorCount} field(s) not found`;

          // List of filled fields
          const filledFieldsList = document.createElement('ul');
          filledFieldsList.style.listStyleType = 'disc';
          filledFieldsList.style.marginTop = '10px';
          filledFieldsList.style.paddingLeft = '20px';
          filledFieldsList.style.textAlign = 'left';

          const filledFieldsTitle = document.createElement('p');
          filledFieldsTitle.textContent = 'Fields Filled:';
          filledFieldsTitle.style.marginTop = '10px';
          filledFieldsTitle.style.fontWeight = 'bold';

          for (const field of filledFields) {
            const li = document.createElement('li');
            li.textContent = field;
            filledFieldsList.appendChild(li);
          }

          // List of unfilled fields
          const unfilledFieldsList = document.createElement('ul');
          unfilledFieldsList.style.listStyleType = 'disc';
          unfilledFieldsList.style.marginTop = '10px';
          unfilledFieldsList.style.paddingLeft = '20px';
          unfilledFieldsList.style.textAlign = 'left';

          const unfilledFieldsTitle = document.createElement('p');
          unfilledFieldsTitle.textContent = 'Fields Not Found:';
          unfilledFieldsTitle.style.marginTop = '10px';
          unfilledFieldsTitle.style.fontWeight = 'bold';

          for (const field of unfilledFields) {
            const li = document.createElement('li');
            li.textContent = field;
            unfilledFieldsList.appendChild(li);
          }

          // Append elements to report
          reportDiv.appendChild(svgContainer);
          reportDiv.appendChild(progressBarContainer);
          reportDiv.appendChild(successCountText);
          if (filledFields.length > 0) {
            reportDiv.appendChild(filledFieldsTitle);
            reportDiv.appendChild(filledFieldsList);
          }
          if (unfilledFields.length > 0) {
            reportDiv.appendChild(errorText);
            reportDiv.appendChild(unfilledFieldsTitle);
            reportDiv.appendChild(unfilledFieldsList);
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
