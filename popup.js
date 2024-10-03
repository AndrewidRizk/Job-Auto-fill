// Load JSON data from the file and pass it to the autofill function
document.getElementById('autofillButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    fetch(chrome.runtime.getURL('data.json'))
      .then(response => response.json())
      .then(data => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: autofillFunction,
          args: [data.userInfo, data.inputMapping] // Pass userInfo and inputMapping as arguments
        });
      })
      .catch(error => console.error('Error loading JSON data:', error));
  });
});

// Define the autofill function that accepts userInfo and inputMapping as parameters
function autofillFunction(userInfo, inputMapping) {
  // Arrays to store filled and unfilled fields
  const filledFields = [];
  const unfilledFields = [];

  // Set to store inputs that have been filled
  const filledInputs = new Set();

  // Function to escape special regex characters in keywords
  function escapeRegExp(string) {
    if (!string) return '';
    return string.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
  }

  // Function to fill fields based on labels, placeholder, or name attribute
  function fillFieldFromLabel(fieldKey, keywords, value, doc = document) {
    const escapedKeywords = keywords.map(escapeRegExp);
    const fieldRegex = new RegExp('\\b(' + escapedKeywords.join('|') + ')\\b', 'i');

    const labels = Array.from(doc.querySelectorAll('label'));

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
        continue;
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
  }

  // Function to fill input elements
  function fillInputElement(input, value) {
    if (input.tagName.toLowerCase() === 'select') {
      const options = Array.from(input.options);
      let matchingOption = options.find(option => new RegExp(`^${escapeRegExp(value)}$`, 'i').test(option.text.trim()));
      if (!matchingOption) {
        matchingOption = options.find(option => new RegExp(`^${escapeRegExp(value)}$`, 'i').test(option.value.trim()));
      }
      if (matchingOption) {
        input.value = matchingOption.value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    } else {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    return false;
  }

  // Fill fields in the main document
  function fillFieldsInDocument(doc) {
    function fillField(fieldKey, keywords, value) {
      const success = fillFieldFromLabel(fieldKey, keywords, value, doc);
      if (!success && !unfilledFields.includes(fieldKey)) {
        unfilledFields.push(fieldKey);
      }
    }

    for (const key in inputMapping) {
      fillField(key, inputMapping[key], userInfo[key] || '');
    }

    // Recursively fill fields in iframes
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
  }

  fillFieldsInDocument(document);

  // Calculate the percentage of fields filled
  const totalFields = Object.keys(inputMapping).length;
  const successfulFills = filledFields.length;
  const percentage = Math.round((successfulFills / totalFields) * 100);

  // Create the report with circular chart and progress bar
function createReport() {
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
  reportDiv.style.border = '3px solid #ccc';
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

// Minimize Button
const minimizeButton = document.createElement('button');
minimizeButton.innerHTML = '&#9660;'; // Down arrow symbol (initial state)
minimizeButton.style.position = 'absolute';
minimizeButton.style.top = '5px';
minimizeButton.style.right = '3px';
minimizeButton.style.background = 'transparent'; // No background
minimizeButton.style.border = 'none'; // Remove border
minimizeButton.style.fontSize = '16px';
minimizeButton.style.cursor = 'pointer';
minimizeButton.style.outline = 'none'; // Remove the default focus outline
minimizeButton.style.width = '24px'; // Smaller button size
minimizeButton.style.height = '24px';
minimizeButton.style.display = 'flex';
minimizeButton.style.alignItems = 'center';
minimizeButton.style.justifyContent = 'center';
minimizeButton.style.transition = 'all 0.3s ease'; // Smooth transition
minimizeButton.style.borderRadius = '50%'; // Make it circular

// Hover effect
minimizeButton.onmouseover = () => {
  minimizeButton.style.backgroundColor = '#f1f1f1'; // Light background on hover
};
minimizeButton.onmouseout = () => {
  minimizeButton.style.backgroundColor = 'transparent'; // Revert to transparent
};

  // Event listener for minimizing the content
  minimizeButton.addEventListener('click', () => {
    const isVisible = reportContent.style.display !== 'none';
    reportContent.style.display = isVisible ? 'none' : 'block';
    minimizeButton.innerHTML = isVisible ? '&#9650;' : '&#9660;'; // Toggle between up and down arrow symbols
  });

  // Create a div for the content that can be hidden
  const reportContent = document.createElement('div');
  reportContent.id = 'report-content';

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

  // Append elements to report content
  reportContent.appendChild(svgContainer);
  reportContent.appendChild(progressBarContainer);
  reportContent.appendChild(successCountText);
  if (filledFields.length > 0) {
    reportContent.appendChild(filledFieldsTitle);
    reportContent.appendChild(filledFieldsList);
  }
  if (unfilledFields.length > 0) {
    reportContent.appendChild(errorText);
    reportContent.appendChild(unfilledFieldsTitle);
    reportContent.appendChild(unfilledFieldsList);
  }

  // Append minimize button and report content to report div
  reportDiv.appendChild(minimizeButton);
  reportDiv.appendChild(reportContent);

  // Append to body
  document.body.appendChild(reportDiv);
}

  // Create the report
  createReport();
}

// Edit button functionality
document.getElementById('edit').addEventListener('click', () => {
  chrome.tabs.create({ url: 'edit.html' });
});
