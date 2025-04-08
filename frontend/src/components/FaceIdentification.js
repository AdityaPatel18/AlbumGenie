import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FaceIdentification.css'

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
      <h2>Identify Faces</h2>
      <div className="faces-grid">
        {faces.map((face, index) => (
          <div key={index} className="face-card">
            <div className="face-image-container">
            <img src={face.url} alt={`uploaded-image-${index}`} />

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
        Save All Names
      </button>
    </div>
  );
};

export default FaceIdentification;