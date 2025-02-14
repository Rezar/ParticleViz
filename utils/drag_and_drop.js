/**
 * ----------------------------------------------------------------------------
 * FILE:        drag_and_drop.js
 * AUTHOR:      Bryce Schultz
 * DATE:        <11/30/2024>
 * DESCRIPTION:
 * This JavaScript file provides drag-and-drop file handling functionality
 * for an image upload system. It manages showing/hiding a dropzone and
 * handling file input events.
 *
 * FEATURES:
 * - Hides dropzone when an image is uploaded.
 * - Shows dropzone when no image is present.
 * - Supports drag-and-drop functionality for file selection.
 *
 * ----------------------------------------------------------------------------
 * USAGE:
 * Include this script in an HTML file with the following elements:
 * ```html
 * <div id="dropzone">Drop your file here</div>
 * <input type="file" id="fileInput" accept="image/*" />
 * ```
 * 
 * Ensure the `.container` class is present for drag-and-drop to work:
 * ```html
 * <div class="container">
 *     <!-- Dropzone and file input elements -->
 * </div>
 * ```
 *
 * ----------------------------------------------------------------------------
 * REVISION HISTORY:

 * ----------------------------------------------------------------------------
 */

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