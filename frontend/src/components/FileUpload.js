import React, { useState } from 'react';
import './FileUpload.css';
import { Link } from 'react-router-dom';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';

import { useNavigate } from 'react-router-dom';


const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const handleFileSelection = (event) => {
    const selectedFiles = Array.from(event.target.files).filter(
      (file) => file.type.startsWith('image/')
    );
    setFiles([...files, ...selectedFiles]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }

    try {
    // Reset the database
    await fetch('http://localhost:8000/reset-database', {
      method: 'POST',
    });
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));

        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        const result = await response.json();
        console.log('Upload successful:', result);
      navigate('/FaceIdentification');
    }
    catch(error){
        console.error('Error uploading files:', error);
      }
  };

  return (
    <div className="app-container">
      <div className="album-genie-wrapper">
        <div className="decorative-bubble bubble-top-left"></div>
        <div className="decorative-bubble bubble-bottom-right"></div>
        
        {/* Main container */}
        <div className="main-container">
          {/* Header */}
          <div className="app-header">
            <h1 className="app-title">
              <ImageIcon className="app-icon" />
              AlbumGenie
            </h1>
            <p className="app-subtitle">Upload and organize your photos</p>
          </div>
          
          {/* Content */}
          <div className="app-content">
            {/* File display area */}
            <div className="file-display-area">
              {files.length === 0 ? (
                <div className="empty-state">
                  <ImageIcon size={48} strokeWidth={1} />
                  <p>Drag photos here or use the Add button</p>
                </div>
              ) : (
                <div className="file-grid">
                  {files.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-thumbnail">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`uploaded-image-${index}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Controls */}
            <div className="control-buttons">
              <button
                onClick={() => {
                  const fileInput = document.getElementById('file-input');
                  if (fileInput) {
                    fileInput.click();
                  }
                }}
                className="add-button"
              >
                <Upload size={18} />
                Add Photos
              </button>
              
              <button 
                onClick={handleUpload}
                className="process-button"
                disabled={files.length === 0}
              >
                <Check size={18} />
                Process
              </button>
            </div>
            
            <div className="file-formats">
              Supported formats: JPG, PNG, WEBP
            </div>
          </div>
        </div>
      </div>
      
      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*"
        className="hidden-input"
        onChange={handleFileSelection}
      />
    </div>
  );
}

export default FileUpload;