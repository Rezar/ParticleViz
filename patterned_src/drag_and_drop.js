const dropzone = document.getElementById('dropzone');
const container = document.querySelector('.container');
const fileInput = document.getElementById('fileInput');

// Hide dropzone when image is loaded
function hideDropzone() {
  dropzone.classList.add('hidden');
}

// Show dropzone when no image is present
function showDropzone() {
  dropzone.classList.remove('hidden');
}

// Initially show the dropzone
showDropzone();

// Hide dropzone when file is selected through input
fileInput.addEventListener('change', (event) => {
  if (event.target.files && event.target.files[0]) {
    hideDropzone();
  }
});

// Drag and drop functionality
container.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

container.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();

  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type.startsWith('image/')) {
    fileInput.files = files;
    fileInput.dispatchEvent(new Event('change'));
  }
});