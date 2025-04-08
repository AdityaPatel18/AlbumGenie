import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Main.css";
import "./DropDown";

const Home = () => {
  const [images, setImages] = useState([]);
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState({});
  const [longPressImage, setLongPressImage] = useState(null);
  const [pressTimer, setPressTimer] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch("http://localhost:8000/images");
      const data = await response.json();

      const imageUrls = data.images.map((image) => ({
        id: image.id,
        url: `data:image/jpeg;base64,${image.image_data}`,
        people: image.people || [], // Assuming each image has a 'people' array property
      }));
      setImages(imageUrls);
      setFilteredImages(imageUrls);
    };

    const fetchFilters = async () => {
      const response = await fetch("http://localhost:8000/filter_options");
      const data = await response.json();
      setFilters(data);
    };

    fetchImages();
    fetchFilters();
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((item) => item !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const applyFilter = async () => {
    try {
      const response = await fetch("http://localhost:8000/apply_filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedFilters), // Just send the array
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const imageUrls = data.images.map((image) => ({
        url: `data:image/jpeg;base64,${image.image_data}`,
        people: image.individuals || [],
      }));

      setImages(imageUrls);
      setFilteredImages(imageUrls);
    } catch (error) {
      console.error("Error applying filter:", error);
    }
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setFilteredImages(images);
  };

  const toggleSelection = (imageId) => {
    setSelectedImages((prev) => ({
      ...prev,
      [imageId]: !prev[imageId],
    }));
  };

  const selectAll = () => {
    const newSelected = {};
    images.forEach((image) => {
      newSelected[image.id] = true;
    });
    setSelectedImages(newSelected);
  };

  const deselectAll = () => {
    setSelectedImages({});
  };

  const createFolder = async () => {
    const selectedIds = Object.keys(selectedImages).filter(
      (id) => selectedImages[id]
    );
  
    const response = await fetch("http://localhost:8000/create_folder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedIds),
    });
  
    if (!response.ok) {
      console.error("Failed to download folder");
      return;
    }
  
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "images.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleLongPress = (imageId) => {
    setLongPressImage(imageId);
    // Show enlarged image when long press occurs
  };

  const handlePressStart = (imageId) => {
    const timer = setTimeout(() => {
      handleLongPress(imageId);
    }, 250); // 500ms long press duration
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    clearTimeout(pressTimer);
    setPressTimer(null);
  };

  const handlePressCancel = () => {
    clearTimeout(pressTimer);
    setPressTimer(null);
  };

  const closeEnlargedImage = () => {
    const timer = setTimeout(() => {
      setLongPressImage(null);
    }, 75); // 500ms long press duration
    setPressTimer(timer);
  };
  

  return (
    <div className="main-container">
      <div className="top-bar">
        <Link to="/">
          <button className="top-button">Home</button>
        </Link>
  
        <div className="top-controls">
          <div className="dropdown-checkbox">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              Select People {isOpen ? "▲" : "▼"}
            </button>
            {isOpen && (
              <div className="dropdown-menu">
                {filters.map((filter, index) => (
                  <label key={index} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(filter)}
                      onChange={() => handleCheckboxChange(filter)}
                    />
                    {filter}
                  </label>
                ))}
              </div>
            )}
          </div>
  
          <button className="action-button" onClick={applyFilter}>Filter</button>
          <button className="action-button" onClick={selectAll}>Select All</button>
          <button className="action-button" onClick={deselectAll}>Deselect All</button>
          <button className="primary-button" onClick={createFolder}>Create Folder</button>
        </div>
      </div>
  
      <div className="main-content">
        <div className="folder-pane" id="folder-pane">
          <p>No folders created yet</p>
        </div>
  
        <div className="grid-pane" id="grid-pane">
        {filteredImages.map((image) => (
        <div
          key={image.id}
          className={`image-container ${selectedImages[image.id] ? "selected" : ""}`}
          onClick={() => toggleSelection(image.id)}
          onMouseDown={() => handlePressStart(image.id)}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressCancel}
        >
          <img src={image.url} alt="" />
          {selectedImages[image.id] && (
            <div className="selection-indicator">✓</div>
          )}
        </div>
      ))}
      
      {/* Modal for long press (enlarged image) */}
      {longPressImage && (
        <div className="image-modal" onMouseUp={closeEnlargedImage}>
          <div className="modal-backdrop"></div>
          <img 
            src={filteredImages.find(img => img.id === longPressImage)?.url} 
            alt="Enlarged" 
            className="modal-img" 
          />
        </div>
      )}
        </div>
      </div>
    </div>
  );
  
};

export default Home;
