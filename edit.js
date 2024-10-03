document.addEventListener('DOMContentLoaded', () => {
  const dataContainer = document.getElementById('data-container');
  const addNewEntryModal = document.getElementById('add-entry-modal');
  const addNewEntryButton = document.getElementById('add-new-entry');
  const addEntryBtn = document.getElementById('add-entry-btn');
  let jsonData = {};

  // Check if the dataContainer exists
  if (!dataContainer) {
    console.error('Error: data-container element not found in the DOM.');
    return;
  }

  // Load JSON data from the file and display it
  fetch(chrome.runtime.getURL('data.json'))
    .then(response => response.json())
    .then(data => {
      jsonData = data;
      populateDataContainer(jsonData);
    })
    .catch(error => console.error('Error loading JSON data:', error));

  // Function to populate the container with userInfo and inputMapping data
  function populateDataContainer(data) {
    dataContainer.innerHTML = ''; // Clear the container

    for (const field in data.userInfo) {
      // Create a row container
      const row = document.createElement('div');
      row.classList.add('data-row');

      // Create the User Info Field and Value
      const userInfoField = document.createElement('span');
      userInfoField.classList.add('info-field');
      userInfoField.textContent = field;

      const userInfoInput = document.createElement('input');
      userInfoInput.type = 'text';
      userInfoInput.value = data.userInfo[field];
      userInfoInput.dataset.field = field; // Attach field name for reference
      userInfoInput.classList.add('userinfo-input');

      // Create a container for keywords
      const keywordContainer = document.createElement('div');
      keywordContainer.classList.add('keyword-container');

      if (data.inputMapping[field]) {
        data.inputMapping[field].forEach((keyword, index) => {
          const keywordInput = document.createElement('input');
          keywordInput.type = 'text';
          keywordInput.value = keyword;
          keywordInput.dataset.field = field; // Attach field name for reference
          keywordInput.dataset.index = index; // Track index for this keyword
          keywordInput.classList.add('keyword-input');
          keywordContainer.appendChild(keywordInput);
        });
      }

      // Add Keyword Button
      const addKeywordBtn = document.createElement('button');
      addKeywordBtn.type = 'button';
      addKeywordBtn.textContent = '+';
      addKeywordBtn.classList.add('add-keyword-btn');
      addKeywordBtn.dataset.field = field; // Attach field name for adding keywords

      addKeywordBtn.addEventListener('click', () => {
        const newKeywordInput = document.createElement('input');
        newKeywordInput.type = 'text';
        newKeywordInput.placeholder = 'New keyword';
        newKeywordInput.dataset.field = field;
        newKeywordInput.classList.add('keyword-input');
        keywordContainer.appendChild(newKeywordInput);
      });

      // Append elements to the row
      row.appendChild(userInfoField);
      row.appendChild(userInfoInput);
      row.appendChild(keywordContainer);
      row.appendChild(addKeywordBtn);

      // Append the row to the main container
      dataContainer.appendChild(row);
    }
  }

  // Save button functionality
  document.getElementById('save').addEventListener('click', () => {
    // Read updated values from the UI
    const userInfoInputs = document.querySelectorAll('.userinfo-input');
    const keywordInputs = document.querySelectorAll('.keyword-input');

    userInfoInputs.forEach(input => {
      const field = input.dataset.field;
      jsonData.userInfo[field] = input.value; // Update userInfo values
    });

    // Clear and update the inputMapping
    jsonData.inputMapping = {};

    keywordInputs.forEach(input => {
      const field = input.dataset.field;
      if (!jsonData.inputMapping[field]) {
        jsonData.inputMapping[field] = [];
      }
      jsonData.inputMapping[field].push(input.value); // Update keywords
    });

    // Save updated data to local storage or a server (if applicable)
    saveJsonData(jsonData);
    alert('Data saved successfully!');
  });

  // Function to save JSON data to local storage (for demo purposes)
  function saveJsonData(data) {
    localStorage.setItem('autofillData', JSON.stringify(data)); // You can replace this with actual file-saving logic
  }

  // Handle adding new entries via modal
  addNewEntryButton.addEventListener('click', () => {
    addNewEntryModal.style.display = 'block';
  });

  addEntryBtn.addEventListener('click', () => {
    const newInfoField = document.getElementById('new-info-field').value.trim();
    const newInfoValue = document.getElementById('new-info-value').value.trim();
    const newKeywords = document.getElementById('new-keywords').value.split(',').map(k => k.trim());

    if (newInfoField && newInfoValue) {
      jsonData.userInfo[newInfoField] = newInfoValue;
      jsonData.inputMapping[newInfoField] = newKeywords;

      // Update UI
      populateDataContainer(jsonData);
      saveJsonData(jsonData);
      alert('New entry added successfully!');
    }

    // Close the modal and reset fields
    addNewEntryModal.style.display = 'none';
    document.getElementById('new-info-field').value = '';
    document.getElementById('new-info-value').value = '';
    document.getElementById('new-keywords').value = '';
  });

  // Close modal
  document.querySelector('.close').addEventListener('click', () => {
    addNewEntryModal.style.display = 'none';
  });
});
