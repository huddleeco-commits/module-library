import { Upload, X, Camera, Sparkles } from 'lucide-react';
import { useState, useRef } from 'react';
import CameraScanner from '../camera/CameraScanner';
import { convertHEICtoJPG } from '../../utils/imageConverter';

export default function ImageUpload({ label, image, onImageChange, required = false, enableAdvancedCamera = false }) {

  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Check for HEIC and show guidance
        const convertedFile = await convertHEICtoJPG(file);
        processFile(convertedFile);
      } catch (error) {
        console.error('Image format error:', error);
        // Show as alert with proper formatting
        alert(error.message);
        // Clear the input so user can try again
        if (e.target) e.target.value = '';
      }
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const compressImage = async (base64String, quality = 0.85) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 2000;

          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          let compressed = canvas.toDataURL('image/jpeg', quality);
          
          const targetSize = 9 * 1024 * 1024;
          if (compressed.length > targetSize) {
            compressed = canvas.toDataURL('image/jpeg', 0.5);
          }
          if (compressed.length > targetSize) {
            compressed = canvas.toDataURL('image/jpeg', 0.3);
          }
          
          resolve(compressed);
        };
        img.src = base64String;
      });
    };

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        let result = reader.result;
        console.log('Original file size:', file.size / 1024 / 1024, 'MB');
        
        if (file.size > 8 * 1024 * 1024) {
          console.log('Large file detected, applying compression...');
          result = await compressImage(result, 0.85);
        } else if (file.size > 5 * 1024 * 1024) {
          console.log('Medium-large file detected, applying compression...');
          result = await compressImage(result, 0.88);
        } else if (file.size > 2 * 1024 * 1024) {
          console.log('Medium file detected, applying light compression...');
          result = await compressImage(result, 0.92);
        }
        
        console.log('Compressed size:', result.length / 1024 / 1024, 'MB');
        
        if (result.length > 10 * 1024 * 1024) {
          console.log('Still too large, applying maximum compression...');
          result = await compressImage(result, 0.3);
        }
        
        onImageChange(result);
      } catch (error) {
        console.error('Compression failed:', error);
        alert('Failed to process image. Please try a smaller file.');
      }
    };
    reader.onerror = () => {
      alert('❌ Failed to read image file.\n\nPlease try a different image or take a new photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      try {
        // Convert HEIC to JPG if needed
        const convertedFile = await convertHEICtoJPG(file);
        processFile(convertedFile);
      } catch (error) {
        console.error('Image conversion error:', error);
        alert(error.message || 'Failed to process image. Please try a different format.');
      }
    }
  };

  // Handle camera scanner completion
  const handleCameraComplete = (capturedImage) => {
    if (capturedImage) {
      onImageChange(capturedImage);
    }
    setShowCamera(false);
  };

  // Open advanced camera if enabled
  const openAdvancedCamera = () => {
    if (enableAdvancedCamera) {
      setShowCamera(true);
    } else {
      // Fallback to native camera input
      cameraInputRef.current?.click();
    }
  };

  return (
    <div>
      <label className='block text-sm font-bold text-slate-300 mb-2'>
        {label} {required && <span className='text-red-400'>*</span>}
      </label>
      <div className='relative'>
        {image ? (
          <div className='relative bg-slate-900/70 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-lg hover:border-emerald-500/70 transition-all group' style={{ minHeight: '400px', maxHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={image} alt={label} className='max-w-full max-h-full object-contain p-2' style={{ maxHeight: '580px' }} />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'></div>
            <button
              onClick={() => onImageChange(null)}
              className='absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-500 rounded-lg transition-all hover:scale-110 backdrop-blur-sm shadow-lg z-10'
              type='button'
            >
              <X size={16} className='text-white' />
            </button>
            <div className='absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
              <div className='px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm rounded-lg'>
                <p className='text-xs font-bold text-white flex items-center gap-1'>
                  <Sparkles size={12} />
                  Image uploaded
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`relative aspect-[3/4] md:aspect-auto md:min-h-[400px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-500/20 scale-[1.02]' 
                : 'border-slate-600 hover:border-indigo-500/50 hover:bg-slate-800/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity'></div>
            
            <div className='relative z-10 flex flex-col items-center'>
              <div className='relative mb-4'>
                <div className='absolute inset-0 bg-indigo-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity'></div>
                <div className='relative p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 group-hover:border-indigo-500/50 transition-all'>
                  {isDragging ? (
                    <Upload size={40} className='text-indigo-400 animate-bounce' />
                  ) : (
                    <Upload size={40} className='text-slate-500 group-hover:text-indigo-400 transition-colors' />
                  )}
                </div>
              </div>
              
              <span className='text-sm text-slate-400 group-hover:text-slate-300 mb-1 text-center px-4 font-medium transition-colors'>
                {isDragging ? (
                  <span className='text-indigo-400 font-bold flex items-center gap-1'>
                    <Sparkles size={14} />
                    Drop image here
                  </span>
                ) : (
                  'Drag & drop or click to upload'
                )}
              </span>
              
              <span className='text-xs text-slate-500 mb-4'>JPG, PNG, WEBP, or HEIC</span>
              
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl transition-all text-sm flex items-center gap-2 font-bold shadow-lg hover:shadow-indigo-500/50 hover:scale-105'
                >
                  <Upload size={16} />
                  Browse
                </button>
                
                <button
                  type='button'
                  onClick={openAdvancedCamera}
                  className='px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all text-sm flex items-center gap-2 font-bold border-2 border-purple-500/50 hover:scale-105 shadow-lg hover:shadow-purple-500/50'
                >
                  <Camera size={16} />
                  {enableAdvancedCamera ? 'Pro Camera' : 'Camera'}
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
            />
            
            <input
              ref={cameraInputRef}
              type='file'
              accept='image/jpeg,image/jpg,image/png,image/heic,image/heif'
              capture='environment'
              onChange={handleFileChange}
              className='hidden'
            />

            <div className='absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-slate-600 group-hover:border-indigo-500/50 transition-colors rounded-tl-lg'></div>
            <div className='absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-slate-600 group-hover:border-indigo-500/50 transition-colors rounded-tr-lg'></div>
            <div className='absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-slate-600 group-hover:border-indigo-500/50 transition-colors rounded-bl-lg'></div>
            <div className='absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-slate-600 group-hover:border-indigo-500/50 transition-colors rounded-br-lg'></div>
          </div>
        )}
      </div>

      {/* Advanced Camera Modal */}
      {showCamera && enableAdvancedCamera && (
        <CameraScanner
          onComplete={handleCameraComplete}
          cardSide={label.toLowerCase().includes('front') ? 'front' : 'back'}
        />
      )}
    </div>
  );
}