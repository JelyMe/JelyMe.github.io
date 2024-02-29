document.querySelector('.search-input').addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  const downloadButton = document.querySelector('.download-button');

  if (searchTerm.includes('spin')) {
    downloadButton.classList.add('spinning');
  } else {
    downloadButton.classList.remove('spinning');
  }
});
