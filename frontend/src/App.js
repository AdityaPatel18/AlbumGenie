import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import FileUpload from './components/FileUpload';
import FaceIdentification from './components/FaceIdentification';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FileUpload />} />
        <Route path="/main" element={<Main />} />
        <Route path="/faceIdentification" element={<FaceIdentification />} />
      </Routes>
    </Router>
  );
}

export default App;