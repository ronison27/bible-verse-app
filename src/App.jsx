import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Search, ChevronRight, ChevronLeft, Download, Share2, ClipboardPaste, Palette, Type, MoveVertical } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

const FONTS = [
  { id: 'Inter', name: 'Modern' },
  { id: 'Merriweather', name: 'Classic' },
  { id: 'Caveat', name: 'Handwrite' }
];

const COLORS = [
  { id: '#ffffff', name: 'White' },
  { id: '#000000', name: 'Black' },
  { id: '#fbbf24', name: 'Gold' },
  { id: '#93c5fd', name: 'Blue' },
  { id: '#fca5a5', name: 'Red' },
];

export default function App() {
  const [step, setStep] = useState(1);
  
  // App State
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  
  // Settings State
  const [font, setFont] = useState('Merriweather');
  const [color, setColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(28);
  const [dimLevel, setDimLevel] = useState(40); // 0-100%
  const [verticalPos, setVerticalPos] = useState(50); // 0-100%

  // Refs
  const fileInputRef = useRef(null);
  const exportRef = useRef(null);

  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        handleNext(); // Auto advance when image picked
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomImage = async () => {
    // We use a reliable proxy like unsplash source that supports CORS
    // Unsplash source was deprecated, so using a well-known image generator
    // Adding timestamp directly to avoid browser CORS caching issues
    const randomUrl = `https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1080&sig=${Date.now()}`;
    
    // Fallback if needed: const randomUrl = `https://loremflickr.com/1080/1080/nature?random=${Date.now()}`;
    // But since the user wants beautiful nature images, another reliable proxy is picsum.
    setImage(`https://picsum.photos/1080/1080?random=${Date.now()}`);
    handleNext(); // Auto advance
  };
  
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      alert('Unable to paste automatically. Please tap the box and paste normally.');
    }
  };

  const handleExport = async (action = 'download') => {
    if (!exportRef.current) return;
    
    try {
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        quality: 0.95,
        pixelRatio: 2 // High res
      });

      if (action === 'share') {
        // Try Web Share API (Android Native Share)
        if (navigator.share) {
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'bible-verse.png', { type: 'image/png' });
            
            await navigator.share({
              title: 'Bible Verse',
              files: [file]
            });
            return;
          } catch (err) {
            console.log('Error sharing:', err);
          }
        } else {
          alert('Native sharing is not supported on this device. The image will be downloaded instead.');
        }
      }
      
      // Fallback: Download
      const link = document.createElement('a');
      link.download = `Verse-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

    } catch (err) {
      console.error('Failed to export image', err);
      alert('Failed to generate image. Please try again.');
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Daily Verse Creator</h1>
        <div className="step-indicator">
          {[1, 2, 3].map(s => (
            <div key={s} className={`step-dot ${s === step ? 'active' : ''}`} />
          ))}
        </div>
      </header>

      <main className="content-area">
        {step === 1 && (
          <div className="step-content">
            <h2 className="section-title">
              <span className="step-num">1.</span> Choose a Background
            </h2>
            <p style={{marginBottom: '2rem', color: '#64748b'}}>Select a photo from your phone or find a beautiful nature scene.</p>

            <div className="options-grid">
              <div className="option-card" onClick={() => fileInputRef.current?.click()}>
                <div className="option-icon">
                  <Camera size={24} />
                </div>
                <span style={{fontWeight: 600, textAlign: 'center'}}>My Photos</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden-input" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="option-card" onClick={handleRandomImage}>
                <div className="option-icon">
                  <ImageIcon size={24} />
                </div>
                <span style={{fontWeight: 600, textAlign: 'center'}}>Nature Scene</span>
              </div>
            </div>
            
            {image && (
               <div style={{textAlign: 'center', marginTop: '1rem'}}>
                 <p style={{color: '#64748b', marginBottom: '0.5rem'}}>Current Image:</p>
                 <img src={image} crossOrigin="anonymous" alt="Selected" style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.5rem'}} />
               </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2 className="section-title">
              <span className="step-num">2.</span> Add Your Verse
            </h2>

             <button onClick={handlePaste} className="btn btn-secondary" style={{marginBottom: '1rem'}}>
               <ClipboardPaste size={20} /> Paste from Clipboard
             </button>

             <textarea
               className="editor-textarea"
               placeholder="Type or paste the Bible verse here..."
               value={text}
               onChange={(e) => setText(e.target.value)}
             />

             {text.length > 0 && (
                <div className="editor-tools">
                   {/* Font */}
                   <div>
                     <div className="tool-group-title"><Type size={16} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px'}}/> Font Style</div>
                     <div className="font-selector">
                        {FONTS.map(f => (
                           <button 
                             key={f.id}
                             className={`font-btn ${font === f.id ? 'selected' : ''}`}
                             style={{fontFamily: f.id}}
                             onClick={() => setFont(f.id)}
                           >
                             {f.name}
                           </button>
                        ))}
                     </div>
                   </div>

                   {/* Color */}
                   <div>
                     <div className="tool-group-title"><Palette size={16} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px'}}/> Text Color</div>
                     <div className="color-picker">
                        {COLORS.map(c => (
                           <button 
                             key={c.id}
                             className={`color-btn ${color === c.id ? 'selected' : ''}`}
                             style={{backgroundColor: c.id}}
                             onClick={() => setColor(c.id)}
                            />
                        ))}
                     </div>
                   </div>

                   {/* Background Dim */}
                   <div>
                     <div className="tool-group-title">Darken Background (for readability)</div>
                     <div className="slider-container">
                       <span style={{fontSize: '0.875rem', color: '#64748b'}}>Light</span>
                       <input 
                         type="range" 
                         className="slider" 
                         min="0" max="80" 
                         value={dimLevel} 
                         onChange={(e) => setDimLevel(e.target.value)} 
                       />
                       <span style={{fontSize: '0.875rem', color: '#64748b'}}>Dark</span>
                     </div>
                   </div>
                </div>
             )}
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2 className="section-title">
              <span className="step-num">3.</span> Preview & Share
            </h2>
            
            {/* The final image composition area */}
            <div className="canvas-wrapper">
               <div className="canvas-container" ref={exportRef}>
                  {image && <img src={image} className="canvas-bg" crossOrigin="anonymous" alt="Background" />}
                  <div className="canvas-overlay" style={{backgroundColor: `rgba(0,0,0,${dimLevel / 100})`}}></div>
                  
                  <div 
                    className="canvas-text-layer"
                    style={{
                       justifyContent: verticalPos < 33 ? 'flex-start' : (verticalPos > 66 ? 'flex-end' : 'center')
                    }}
                  >
                     <div 
                       className="canvas-text-content"
                       style={{
                          fontFamily: font,
                          fontSize: `${fontSize}px`,
                          color: color,
                          textShadow: '0px 2px 4px rgba(0,0,0,0.5)',
                          marginTop: verticalPos < 33 ? '10%' : '0',
                          marginBottom: verticalPos > 66 ? '10%' : '0',
                       }}
                     >
                        {text || "Your verse will appear here."}
                     </div>
                  </div>
               </div>
            </div>

            <div className="editor-tools" style={{marginTop: '0', padding: '1rem'}}>
               <div className="tool-group-title"><MoveVertical size={16} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px'}}/> Text Position</div>
               <div className="slider-container">
                 <span style={{fontSize: '0.875rem', color: '#64748b'}}>Top</span>
                 <input 
                    type="range" 
                    className="slider" 
                    min="0" max="100" 
                    value={verticalPos} 
                    onChange={(e) => setVerticalPos(e.target.value)} 
                 />
                 <span style={{fontSize: '0.875rem', color: '#64748b'}}>Bottom</span>
               </div>
               
               <div className="tool-group-title" style={{marginTop: '1rem'}}><Type size={16} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px'}}/> Text Size</div>
               <div className="slider-container">
                 <span style={{fontSize: '0.875rem', color: '#64748b'}}>A</span>
                 <input 
                    type="range" 
                    className="slider" 
                    min="16" max="60" 
                    value={fontSize} 
                    onChange={(e) => setFontSize(e.target.value)} 
                 />
                 <span style={{fontSize: '1.25rem', color: '#64748b'}}>A</span>
               </div>
            </div>

          </div>
        )}
      </main>

      <footer className="footer">
        {step > 1 && (
          <button className="btn btn-secondary" onClick={handlePrev}>
            <ChevronLeft size={20} /> Back
          </button>
        )}
        
        {step < 3 && (
          <button 
             className="btn btn-primary" 
             onClick={handleNext}
             disabled={step === 1 && !image}
          >
            Next <ChevronRight size={20} />
          </button>
        )}

        {step === 3 && (
           <div style={{display: 'flex', gap: '0.5rem', width: '100%'}}>
              <button className="btn btn-secondary" onClick={() => handleExport('download')} style={{flex: 1}}>
                 <Download size={20} /> Save
              </button>
              <button className="btn btn-primary" onClick={() => handleExport('share')} style={{flex: 2, background: '#25D366'}}>
                 <Share2 size={20} /> Share
              </button>
           </div>
        )}
      </footer>
    </div>
  );
}
