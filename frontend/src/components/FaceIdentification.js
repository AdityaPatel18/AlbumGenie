import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FaceIdentification.css'
import { Save, User } from 'lucide-react';


const FaceIdentification = () => {
  const [faces, setFaces] = useState([]);
  const [nameInputs, setNameInputs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFaces = async () => {
      try {
        const response = await fetch('http://localhost:8000/get_faces');
        const data = await response.json();
        
        const imageUrls = data.images.map((image) => ({
            url: `data:image/jpeg;base64,${image.image_data}`
            
          }));
        if (data.images && data.images.length > 0) {
          setFaces(imageUrls);
          // Initialize name inputs
          const initialNames = {};
          data.images.forEach((face, index) => {
            initialNames[index] = '';
          });
          setNameInputs(initialNames);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching faces:', error);
        setIsLoading(false);
      }
    };

    fetchFaces();
  }, []);

  const handleNameChange = (index, value) => {
    setNameInputs(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const saveNames = async () => {
    try {
      const updatedFaces = faces.map((face, index) => ({
        ...face,
        name: nameInputs[index] || ''
      }));

      const response = await fetch('http://localhost:8000/update_faces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faces: updatedFaces
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save names');
      }

      alert('Names saved successfully!');
      navigate('/Main');
    } catch (error) {
      console.error('Error saving names:', error);
      alert('Failed to save names');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading faces...</div>;
  }

  if (faces.length === 0) {
    return <div className="no-faces">No faces found</div>;
  }

  return (
    <div className="face-identification">
      <div className="face-id-wrapper">
        {/* Decorative elements */}
        <div className="decorative-bubble bubble-top-right"></div>
        <div className="decorative-bubble bubble-bottom-left"></div>
        
        {/* Main container */}
        <div className="face-id-container">
          {/* Header */}
          <div className="face-id-header">
            <h2 className="face-id-title">
              <User className="face-id-icon" />
              Identify Faces
            </h2>
            <p className="face-id-subtitle">Label the detected faces in your photos</p>
          </div>
          
          {/* Content */}
          <div className="face-id-content">
            {faces.length === 0 ? (
              <div className="no-faces">
                <User size={48} strokeWidth={1} />
                <p>No faces detected in your photos</p>
              </div>
            ) : (
              <>
                <div className="faces-grid">
                  {faces.map((face, index) => (
                    <div key={index} className="face-card">
                      <div className="face-image-container">
                        <img 
                          src={face.url} 
                          alt={`Face ${index + 1}`}
                          className="face-image" 
                        />
                      </div>
                      <div className="name-input-container">
                        <input
                          type="text"
                          value={nameInputs[index] || ''}
                          onChange={(e) => handleNameChange(index, e.target.value)}
                          placeholder="Enter name"
                          className="name-input"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <button onClick={saveNames} className="save-button">
                  <Save size={18} />
                  Save All Names
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceIdentification;