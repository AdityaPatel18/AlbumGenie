import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Main.css'

const Home = () => {
    const [images, setImages] = useState([]);
    useEffect(() => {
        const fetchImages = async () => {
        const response = await fetch('http://localhost:8000/images');
        const data = await response.json();

        const imageUrls = data.images.map((image) => ({
            url: `data:image/jpeg;base64,${image.image_data}`
        })); 
          setImages(imageUrls);
    }
    fetchImages();
}, []);
    

  return (
    <div className="Main">
        <div className="top-bar">
            <Link to="/">
            <button class="top-left-button">Button</button>
            </Link>
            <div className="top-center">
                <select className="filter-select">
                    <option value="filter1">Filter 1</option>
                    <option value="filter2">Filter 2</option>
                    <option value="filter3">Filter 3</option>
                </select>
                <button className="filter-button">Filter</button>
                <button className="create-folder-button">Create Folder</button>
            </div>
        </div>
        <div className="main-content">
            <div className="folder-pane" id="folder-pane">
                <p>No folders created yet</p>
            </div>

            <div className="grid-pane" id="grid-pane">
                {images.map((image,index) => (
                    <div key={index} className = "file_image">
                        <img
                        src={image.url}
                        alt={`uploaded-image-${index}`}
                        />
                        </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Home;