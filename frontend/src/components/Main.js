import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Main.css";
import "./DropDown"

const Home = () => {
  const [images, setImages] = useState([]);
  const [filters, setFilter] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch("http://localhost:8000/images");
      const data = await response.json();

      const imageUrls = data.images.map((image) => ({
        url: `data:image/jpeg;base64,${image.image_data}`,
      }));
      setImages(imageUrls);
    };

    const fetchFilters = async () => {
      const response = await fetch("http://localhost:8000/filter_options");
      const data = await response.json();
      setFilter(data);
    };

    fetchImages();
    fetchFilters();
  }, []);

  return (
    <div className="Main">
      <div className="top-bar">
        <Link to="/">
          <button class="top-left-button">Button</button>
        </Link>
        <div className="top-center">

          <div className="dropdown-checkbox">
          </div>

          <button className="filter-button" onClick={applyFilter}>
            Filter
          </button>
          <button className="create-folder-button">Create Folder</button>
        </div>
      </div>

      <div className="main-content">
        <div className="folder-pane" id="folder-pane">
          <p>No folders created yet</p>
        </div>

        <div className="grid-pane" id="grid-pane">
          {images.map((image, index) => (
            <div key={index} className="file_image">
              <img src={image.url} alt={`uploaded-image-${index}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
