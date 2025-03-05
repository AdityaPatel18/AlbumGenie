const fileBox = document.getElementById('file-box');
const addButton = document.getElementById('add-button');
const uploadButton = document.getElementById('upload-button');
const fileInput = document.getElementById('file-input');

let files = [];

addButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  //turn user selected files into array and add the image of each file to the view
    Array.from(event.target.files).forEach(file => {
        if (!files.includes(file) && file.type.startsWith('image/')) {
            files.push(file);
            //create img for each file
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            fileItem.appendChild(img);

            fileBox.appendChild(fileItem);
        }
    });
});

uploadButton.addEventListener('click', () => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert('Files uploaded successfully!');
    })
    .catch(error => {
        console.error('Error uploading files:', error);
    });
});