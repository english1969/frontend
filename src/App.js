import React, { useState, useEffect, useRef } from 'react';
//import $3Dmol from '3dmol'; // Import 3Dmol.js directly
import './App.css';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:5000';
const $3Dmol = require('3dmol');

function MoleculeViewer({ molData }) {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (viewerRef.current) {
      try {
        // Initialize the 3Dmol viewer with direct import
        let config = { backgroundColor: 'orange' };
        const viewer = new $3Dmol.createViewer(viewerRef.current, config);
        viewer.addModel(molData, 'mol');
        viewer.setStyle({}, { stick: {} });
        viewer.zoomTo();
        viewer.render();
      } catch (error) {
        console.error('Error initializing 3Dmol viewer:', error);
      }
    }
  }, [molData]); // Re-initialize the viewer if molData changes

  return (
    <div ref={viewerRef} style={{ width: '400px', height: '400px', position: 'relative' }}></div>
    
  );
}
  

  function App() {
    const [smilesString, setSmilesString] = useState('');
    const [image2DUrl, setImage2DUrl] = useState(''); // URL for the 2D image
    const [molData, setMolData] = useState('');
    //const viewerRef = useRef(null); // Ref for the 3Dmol viewer container

    const handleSubmit = async (event) => {
      event.preventDefault();

      alert("fetching data");

      const fetch2DImage = fetch(apiEndpoint+'/process_smiles_2d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smiles: smilesString }),
      })
      .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
      })
      .catch((error) => console.error('An error occurred:', error));

      const fetch3DData = fetch(apiEndpoint+'/process_smiles_3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smiles: smilesString }),
      }).then((response) => response.text()); // Assuming 3D data is returned as text

      Promise.all([fetch2DImage, fetch3DData])
        .then(async ([imageBlob, molData]) => {
          setImage2DUrl(URL.createObjectURL(imageBlob));

          // Initialize 3D viewer with the fetched 3D data
          setMolData(molData); // Assuming molData is in a format compatible with MoleculeViewer

        })
        .catch((error) => console.error('Error fetching data:', error));
    };

    return (
      <div className="App">
        <header className="App-header">
          <form onSubmit={handleSubmit}>
            <label htmlFor="smilesInput">Enter SMILES String:</label><br />
            <input
              type="text"
              id="smilesInput"
              value={smilesString}
              onChange={(e) => setSmilesString(e.target.value)}
            /><br />
            <button type="submit">Submit</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          {image2DUrl && <img src={image2DUrl} alt="2D Chemical Structure" style={{ maxWidth: '400px', height: 'auto' }} />}
          {molData && <MoleculeViewer molData={molData} />}
          </div>

          

        </header>
      </div>
    );
  }

// export default MoleculeViewer;
export default App;


