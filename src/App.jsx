import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)
    setImage(null)

    const HF_TOKEN = import.meta.env.VITE_HF_TOKEN

    if (!HF_TOKEN) {
      setError("Hugging Face API token is missing.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(
        "https://router.huggingface.co/nscale/v1/images/generations",
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            response_format: "b64_json",
            prompt: prompt,
            model: "stabilityai/stable-diffusion-xl-base-1.0",
          }),
        }
      )

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error?.message || errData.error || `System Error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.data && data.data[0] && data.data[0].b64_json) {
        const base64Image = `data:image/png;base64,${data.data[0].b64_json}`
        setImage(base64Image)
      } else {
        throw new Error("Invalid orbital response.")
      }
    } catch (err) {
      console.error("Transmission Error:", err)
      setError(err.message || "Link failed. Check connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!image) return
    const link = document.createElement('a')
    link.href = image
    link.download = `cosmic-gen-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <div className="stars-container">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      <div className="nebula"></div>

      <div className="container">
        <header>
          <div className="badge">
            <span className="dot"></span>
            NEURAL ENGINE: SDXL 1.0
          </div>
          <h1>AI Image Generator</h1>
          <p className="subtitle">Synthesizing the cosmos, one pixel at a time.</p>
        </header>

        <form className="input-group" onSubmit={handleGenerate}>
          <div className="input-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--space-primary)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Enter your transmission prompt..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button 
            className="generate-btn" 
            type="submit"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? (
              <div className="btn-loader"></div>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Generate
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="error-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{error}</span>
          </div>
        )}

        <div className={`image-display ${image || isLoading ? 'active' : ''}`}>
          {isLoading ? (
            <div className="loader-container">
              <div className="pulse-loader"></div>
              <p className="loading-text" style={{ color: 'var(--space-primary)', marginTop: '24px', fontWeight: 'bold', letterSpacing: '2px' }}>CALIBRATING SENSORS...</p>
            </div>
          ) : image ? (
            <div className="image-wrapper">
              <img src={image} alt={prompt} />
              <button className="download-overlay" onClick={handleDownload} title="Store locally">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>
          ) : (
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <p style={{ opacity: 0.6 }}>READY FOR TRANSMISSION</p>
            </div>
          )}
        </div>

        <footer>
          <p>STATION: ANTIGRAVITY &bull; PROT: SDXL 1.0 &bull; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </>
  )
}

export default App
