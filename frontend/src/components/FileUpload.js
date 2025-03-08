import React, { useState } from 'react';
import './FileUpload.css';
import { Link } from 'react-router-dom';


const FileUpload = () => {
  const [files, setFiles] = useState([]);

  const handleFileSelection = (event) => {
    const selectedFiles = Array.from(event.target.files).filter(
      (file) => file.type.startsWith('image/')
    );
    setFiles([...files, ...selectedFiles]);
  };

  // Handle file upload
  const handleUpload = () => {
    if (files.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }

    // Reset the database
    fetch('http://localhost:8000/reset-database', {
      method: 'POST',
    })
      .then(() => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));

        // Upload files after database is reset
        return fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData,
        });
      })
      //if there is a response get it to json format
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error uploading files:', error);
      });
  };

  return (
    <div className="app">
      <div className="container">
        {/* File display area */}
        <div className="file-box">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <img
                src={URL.createObjectURL(file)}
                alt={`uploaded-image-${index}`}
              />
            </div>
          ))}
        </div>

        <div className="controls">
          <button
            className="add-button"
            onClick={() => document.getElementById('file-input').click()}
          >
            Add
          </button>
          <Link to="/main">
          <button className="upload-button" onClick={handleUpload}>
            Upload
          </button>
          </Link>
        </div>
      </div>

      <input
        id="file-input"
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelection}
      />
    </div>
  );
};

export default FileUpload;