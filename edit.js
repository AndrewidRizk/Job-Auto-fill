// Load existing information from storage and display it
chrome.storage.sync.get(['name', 'email', 'linkedin', 'github'], (data) => {
    document.getElementById('name').value = data.name || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('linkedin').value = data.linkedin || '';
    document.getElementById('github').value = data.github || '';
  });
  
  // Save updated information to storage
  document.getElementById('save').addEventListener('click', () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const linkedin = document.getElementById('linkedin').value;
    const github = document.getElementById('github').value;
  
    chrome.storage.sync.set({ name, email, linkedin, github }, () => {
      alert('Information Saved');
    });
  });
  