document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('edit-form');
  const keywordsContainer = document.getElementById('keywords-container');
  const addKeywordButton = document.getElementById('add-keyword');

  // Load stored data if available
  let autofillData = JSON.parse(localStorage.getItem('autofillData')) || {
    name: '',
    email: '',
    linkedin: '',
    github: '',
    keywords: {}
  };

  // Populate form fields with existing values
  form.name.value = autofillData.name || '';
  form.email.value = autofillData.email || '';
  form.linkedin.value = autofillData.linkedin || '';
  form.github.value = autofillData.github || '';

  // Populate existing keywords
  displayKeywords();

  // Save button functionality
  document.getElementById('save').addEventListener('click', () => {
    autofillData.name = form.name.value;
    autofillData.email = form.email.value;
    autofillData.linkedin = form.linkedin.value;
    autofillData.github = form.github.value;

    // Save data to localStorage
    localStorage.setItem('autofillData', JSON.stringify(autofillData));
    alert('Information saved successfully!');
  });

  // Add new keyword functionality
  addKeywordButton.addEventListener('click', () => {
    const newKeyword = document.getElementById('new-keyword').value.trim();
    const newValue = document.getElementById('new-value').value.trim();

    if (newKeyword && newValue) {
      autofillData.keywords[newKeyword] = newValue;
      displayKeywords();
      document.getElementById('new-keyword').value = '';
      document.getElementById('new-value').value = '';
      localStorage.setItem('autofillData', JSON.stringify(autofillData));
    }
  });

  // Display keywords dynamically
  function displayKeywords() {
    keywordsContainer.innerHTML = ''; // Clear container
    for (const [keyword, value] of Object.entries(autofillData.keywords)) {
      const keywordDiv = document.createElement('div');
      keywordDiv.classList.add('keyword-item');
      keywordDiv.innerHTML = `
        <span><strong>${keyword}:</strong> ${value}</span>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      `;

      // Add edit and delete functionality
      keywordDiv.querySelector('.edit-btn').addEventListener('click', () => {
        const newValue = prompt(`Edit value for "${keyword}"`, value);
        if (newValue !== null) {
          autofillData.keywords[keyword] = newValue;
          displayKeywords();
          localStorage.setItem('autofillData', JSON.stringify(autofillData));
        }
      });

      keywordDiv.querySelector('.delete-btn').addEventListener('click', () => {
        delete autofillData.keywords[keyword];
        displayKeywords();
        localStorage.setItem('autofillData', JSON.stringify(autofillData));
      });

      keywordsContainer.appendChild(keywordDiv);
    }
  }
});
