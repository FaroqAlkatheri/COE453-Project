import React, { useState } from 'react';
import './App.css'; // Import your CSS file

function App() {
  const [deviceId, setDeviceId] = useState('');
  const [responseData, setResponseData] = useState(null);

  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(
        `https://llll-4d7ozeew.uc.gateway.dev/devices/${
          'device' + deviceId
        }/${endpoint}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResponseData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderImages = (image) => {
    if (!image) {
      return null;
    }

    return (
      <img
        src={`data:image/png;base64,${image}`}
        alt={`Image`}
        style={{ maxWidth: '100%', marginBottom: '10px' }}
      />
    );
  };

  return (
    <div className="container">
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter device ID"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        />
      </div>
      <div className="button-container">
        <button onClick={() => fetchData('incidents')}>Fetch Incidents</button>
        <button onClick={() => fetchData('incidents/car')}>
          Fetch Car Incidents
        </button>
        <button onClick={() => fetchData('incidents/person')}>
          Fetch Person Incidents
        </button>
      </div>

      {responseData && (
        <div>
          <h2>Response Data:</h2>
          {responseData.map((report, index) => (
            <div key={index}>
              <h3>Report {index + 1}</h3>
              <p>Incident ID: {report.report.incident_id}</p>
              <p>Timestamp: {report.report.timestamp}</p>
              {report.report.location && (
                <p>Location: {report.report.location}</p>
              )}
              {report.report.detected_objects.map((obj, idx) => (
                <p key={idx}>
                  Detected Object: {obj.class_name}, Confidence:{' '}
                  {obj.confidence}
                </p>
              ))}
              {renderImages(report.report.image)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
