const fileBox = document.getElementById('file-box');
const addButton = document.getElementById('add-button');
const uploadButton = document.getElementById('upload-button');
const fileInput = document.getElementById('file-input');

let files = [];

// Handle file selection
function handleFileSelection(event) {
    Array.from(event.target.files).forEach(file => {
        if (!files.includes(file) && file.type.startsWith('image/')) {
            files.push(file);
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            fileItem.appendChild(img);

            fileBox.appendChild(fileItem);
        }
    });
}

// Handle file upload
function handleUpload() {
    if (files.length === 0) {
        alert("Please select at least one file to upload.");
        return; // Prevent upload if no files are selected
    }
    fetch('http://localhost:8000/reset-database', {
        method: 'POST',
    });

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Set a flag in session storage to indicate a successful upload
        sessionStorage.setItem('uploadSuccess', 'true');
        // Navigate to Main.html only after successful upload
        window.location.href = 'Main.html';
    })
    .catch(error => {
        console.error('Error uploading files:', error);
        alert('Upload failed. Please try again.');
    });
}

// Initial setup of event listeners
addButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', handleFileSelection);

uploadButton.addEventListener('click', handleUpload);