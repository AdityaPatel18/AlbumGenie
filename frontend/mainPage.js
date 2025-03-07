// Check if the user came from a successful upload
if (!sessionStorage.getItem("uploadSuccess")) {
  // Redirect to WebPage.html if the upload wasn't successful
  window.location.href = "WebPage.html";
} else {
  // Clear the flag after the page loads
  sessionStorage.removeItem("uploadSuccess");
}

async function fetchImages() {
    const response = await fetch('http://localhost:8000/images');
    const data = await response.json();
    const gridPane = document.getElementById('grid-pane');
    gridPane.innerHTML = '';
    data.images.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = `data:image/jpeg;base64,${image.image_data}`; // Display the image
        gridPane.appendChild(imgElement);
    });
}

fetchImages();

