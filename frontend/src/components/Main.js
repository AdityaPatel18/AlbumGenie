import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Main.css";
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  FolderPlus, 
  CheckSquare, 
  Square,
  Folder,
  Home as HomeIcon
} from 'lucide-react';

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
      try {
        const response = await fetch("http://localhost:8000/images");
        const data = await response.json();

        const imageUrls = data.images.map((image) => ({
          id: image.id,
          url: `data:image/jpeg;base64,${image.image_data}`,
          people: image.people || [],
        }));
        setImages(imageUrls);
        setFilteredImages(imageUrls);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    const fetchFilters = async () => {
      try {
        const response = await fetch("http://localhost:8000/filter_options");
        const data = await response.json();
        setFilters(data);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
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
        body: JSON.stringify(selectedFilters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const imageUrls = data.images.map((image) => ({
        id: image.id,
        url: `data:image/jpeg;base64,${image.image_data}`,
        people: image.people || image.individuals || [],
      }));

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
    filteredImages.forEach((image) => {
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
    
    if (selectedIds.length === 0) {
      alert("Please select at least one image");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8000/create_folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedIds),
      });
    
      if (!response.ok) {
        throw new Error("Failed to download folder");
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
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder");
    }
  };

  const handleLongPress = (imageId) => {
    setLongPressImage(imageId);
  };

  const handlePressStart = (imageId) => {
    const timer = setTimeout(() => {
      handleLongPress(imageId);
    }, 250);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handlePressCancel = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const closeEnlargedImage = () => {
    const timer = setTimeout(() => {
      setLongPressImage(null);
    }, 75); // 500ms long press duration
    setPressTimer(timer);
  };
  
  return (
    <div className="gallery-container">
      <div className="gallery-wrapper">
        {/* Decorative elements */}
        <div className="decorative-bubble bubble-top-left"></div>
        <div className="decorative-bubble bubble-bottom-right"></div>
        
        {/* Main container */}
        <div className="gallery-main">
          {/* Top navigation bar */}
          <div className="gallery-header">
            <Link to="/" className="home-link">
              <button className="home-button">
                <HomeIcon size={18} />
                Home
              </button>
            </Link>
            
            <div className="gallery-controls">
              <div className="filter-dropdown">
                <button 
                  className="dropdown-button" 
                  onClick={toggleDropdown}
                >
                  Filter People
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {isOpen && (
                  <div className="dropdown-content">
                    {filters.map((filter, index) => (
                      <label key={index} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(filter)}
                          onChange={() => handleCheckboxChange(filter)}
                          className="filter-checkbox"
                        />
                        <span className="filter-label">{filter}</span>
                      </label>
                    ))}
                    
                    <div className="filter-actions">
                      <button className="filter-action-button" onClick={applyFilter}>Apply</button>
                      <button className="filter-action-button" onClick={clearFilters}>Clear</button>
                    </div>
                  </div>
                )}
              </div>
              
              <button className="control-button filter-button" onClick={applyFilter}>
                <Filter size={16} />
                <span>Apply</span>
              </button>
              
              <button className="control-button select-all" onClick={selectAll}>
                <CheckSquare size={16} />
                <span>Select All</span>
              </button>
              
              <button className="control-button deselect-all" onClick={deselectAll}>
                <Square size={16} />
                <span>Deselect</span>
              </button>
              
              <button className="primary-button" onClick={createFolder}>
                <FolderPlus size={16} />
                <span>Create Folder</span>
              </button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="gallery-content">
            {/* Folder sidebar */}
            <div className="folder-sidebar">
              <div className="folder-header">
                <Folder size={18} />
                <h3>Folders</h3>
              </div>
              
              <div className="folder-empty">
                <p>No folders created yet</p>
              </div>
            </div>
            
            {/* Image grid */}
            <div className="image-grid">
              {filteredImages.length === 0 ? (
                <div className="no-images">
                  <p>No images match your filter criteria</p>
                </div>
              ) : (
                filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`image-item ${selectedImages[image.id] ? "selected" : ""}`}
                    onClick={() => toggleSelection(image.id)}
                    onMouseDown={() => handlePressStart(image.id)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressCancel}
                    onTouchStart={() => handlePressStart(image.id)}
                    onTouchEnd={handlePressEnd}
                    onTouchCancel={handlePressCancel}
                  >
                    <div className="image-wrapper">
                      <img src={image.url} alt="Gallery image" />
                      {selectedImages[image.id] && (
                        <div className="select-badge">✓</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Image modal for enlarged view */}
      {longPressImage && (
        <div className="modal" onMouseUp={closeEnlargedImage}>
          <div className="modal-overlay"></div>
          <div className="modal-content">
            <img
              src={filteredImages.find(img => img.id === longPressImage)?.url}
              alt="Enlarged view"
              className="modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;