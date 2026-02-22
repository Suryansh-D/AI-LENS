import { useState } from 'react';
import axios from 'axios';

function App() {
  // Camera Settings State
  const [iso, setIso] = useState('400');
  const [aperture, setAperture] = useState('2.8');
  const [shutterSpeed, setShutterSpeed] = useState('250');
  const [lensType, setLensType] = useState('standard');
  const [lighting, setLighting] = useState('natural');
  const [subjectDescription, setSubjectDescription] = useState('');
  
  // UI State
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [error, setError] = useState(null);

  // ISO Options
  const isoOptions = ['100', '200', '400', '800', '1600', '3200', '6400'];
  
  // Aperture Options (f-stops)
  const apertureOptions = ['1.4', '1.8', '2.8', '4', '5.6', '8', '11', '16', '22'];
  
  // Shutter Speed Options (1/x seconds)
  const shutterSpeedOptions = ['8000', '4000', '2000', '1000', '500', '250', '125', '60', '30', '15', '8'];
  
  // Lens Types
  const lensTypes = [
    { value: 'wide-angle', label: 'Wide-Angle', desc: '14-35mm' },
    { value: 'standard', label: 'Standard', desc: '35-70mm' },
    { value: 'telephoto', label: 'Telephoto', desc: '70-300mm' },
    { value: 'macro', label: 'Macro', desc: 'Close-up' }
  ];
  
  // Lighting Presets
  const lightingPresets = [
    { value: 'natural', label: 'Natural Light', icon: '☀️' },
    { value: 'studio', label: 'Studio', icon: '💡' },
    { value: 'golden-hour', label: 'Golden Hour', icon: '🌅' },
    { value: 'dramatic', label: 'Dramatic', icon: '⚡' }
  ];

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:3001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadedFileName(response.data.filename);
      setError(null);
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    }
  };

  // Handle Generate
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedResult(null);

    try {
      const response = await axios.post('http://localhost:3001/api/generate', {
        iso,
        aperture,
        shutterSpeed,
        lensType,
        lighting,
        subjectDescription,
        uploadedImage: uploadedFileName
      });

      setGeneratedResult(response.data);
    } catch (err) {
      const data = err.response?.data;
      const message = data?.error || 'Failed to generate image';
      const details = data?.details ? ` ${data.details}` : '';
      setError(message + details);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-text">AI LENS</span>
        </div>
        <p className="tagline">Professional Photography Generation System</p>
      </header>

      {/* Main Container */}
      <div className="container">
        {/* Left Panel - Controls */}
        <div className="controls-panel">
          <h2 className="section-title">CAMERA CONTROLS</h2>

          {/* Subject Upload */}
          <div className="control-group">
            <label className="control-label">SUBJECT IMAGE</label>
            <div className="upload-area">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="upload-input"
              />
              <label htmlFor="image-upload" className="upload-label">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="upload-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📸</span>
                    <span>Click to upload subject image</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Subject Description */}
          <div className="control-group">
            <label className="control-label">SUBJECT DESCRIPTION</label>
            <textarea
              value={subjectDescription}
              onChange={(e) => setSubjectDescription(e.target.value)}
              placeholder="Describe what you want to photograph..."
              className="text-input"
              rows="3"
            />
          </div>

          {/* Exposure Triangle */}
          <div className="control-group">
            <label className="control-label">EXPOSURE TRIANGLE</label>
            
            {/* ISO */}
            <div className="slider-control">
              <div className="slider-header">
                <span>ISO</span>
                <span className="slider-value">{iso}</span>
              </div>
              <div className="pill-options">
                {isoOptions.map((value) => (
                  <button
                    key={value}
                    className={`pill ${iso === value ? 'active' : ''}`}
                    onClick={() => setIso(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Aperture */}
            <div className="slider-control">
              <div className="slider-header">
                <span>APERTURE</span>
                <span className="slider-value">f/{aperture}</span>
              </div>
              <div className="pill-options">
                {apertureOptions.map((value) => (
                  <button
                    key={value}
                    className={`pill ${aperture === value ? 'active' : ''}`}
                    onClick={() => setAperture(value)}
                  >
                    f/{value}
                  </button>
                ))}
              </div>
            </div>

            {/* Shutter Speed */}
            <div className="slider-control">
              <div className="slider-header">
                <span>SHUTTER SPEED</span>
                <span className="slider-value">1/{shutterSpeed}s</span>
              </div>
              <div className="pill-options">
                {shutterSpeedOptions.map((value) => (
                  <button
                    key={value}
                    className={`pill ${shutterSpeed === value ? 'active' : ''}`}
                    onClick={() => setShutterSpeed(value)}
                  >
                    1/{value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lens Type */}
          <div className="control-group">
            <label className="control-label">LENS TYPE</label>
            <div className="lens-grid">
              {lensTypes.map((lens) => (
                <button
                  key={lens.value}
                  className={`lens-card ${lensType === lens.value ? 'active' : ''}`}
                  onClick={() => setLensType(lens.value)}
                >
                  <span className="lens-label">{lens.label}</span>
                  <span className="lens-desc">{lens.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lighting */}
          <div className="control-group">
            <label className="control-label">LIGHTING</label>
            <div className="lighting-grid">
              {lightingPresets.map((light) => (
                <button
                  key={light.value}
                  className={`lighting-card ${lighting === light.value ? 'active' : ''}`}
                  onClick={() => setLighting(light.value)}
                >
                  <span className="lighting-icon">{light.icon}</span>
                  <span className="lighting-label">{light.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'GENERATING...' : 'GENERATE PHOTO'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Right Panel - Output */}
        <div className="output-panel">
          <h2 className="section-title">GENERATED OUTPUT</h2>
          
          <div className="output-area">
            {isGenerating ? (
              <div className="loading-state">
                <div className="loader"></div>
                <p>Generating professional photography...</p>
              </div>
            ) : generatedResult ? (
              <div className="result-container">
                <div className="result-card">
                  <h3 className="result-title">✨ Generation Complete</h3>
                  
                  {generatedResult.imageUrl && (
                    <div className="result-section result-image-section">
                      <h4>Generated Photo</h4>
                      <img
                        src={generatedResult.imageUrl}
                        alt="Generated photography"
                        className="generated-image"
                      />
                    </div>
                  )}
                  
                  <div className="result-section">
                    <h4>Photography Specifications</h4>
                    <div className="spec-grid">
                      <div className="spec-item">
                        <span className="spec-label">ISO</span>
                        <span className="spec-value">{iso}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Aperture</span>
                        <span className="spec-value">f/{aperture}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Shutter</span>
                        <span className="spec-value">1/{shutterSpeed}s</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Lens</span>
                        <span className="spec-value">{lensType}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Lighting</span>
                        <span className="spec-value">{lighting}</span>
                      </div>
                    </div>
                  </div>

                  <div className="result-section">
                    <h4>AI Analysis</h4>
                    <div className="analysis-text">
                      {generatedResult.analysis || generatedResult.message}
                    </div>
                  </div>

                  <div className="result-section">
                    <h4>Optimized Prompt</h4>
                    <div className="prompt-text">
                      {generatedResult.prompt}
                    </div>
                  </div>

                  {generatedResult.note && (
                    <div className="info-note">
                      ℹ️ {generatedResult.note}
                    </div>
                  )}
                  {generatedResult.imageUrl && (
                    <p className="image-source-note">Image generated with Google Imagen 4 via Replicate.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📷</div>
                <p className="empty-text">Configure camera settings and click generate to create professional photography</p>
                <div className="empty-hints">
                  <div className="hint">✓ Upload a subject image or describe it</div>
                  <div className="hint">✓ Adjust camera settings for desired effect</div>
                  <div className="hint">✓ Choose lens type and lighting</div>
                  <div className="hint">✓ Generate your professional photo</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
