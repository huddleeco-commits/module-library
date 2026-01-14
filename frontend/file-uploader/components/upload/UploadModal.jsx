import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ImageUploadModal({ isOpen, onClose, card, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('cert_number', card.cert_number);

      const response = await axios.post(
        `${API_URL}/cards/${card.id}/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert('✓ Image uploaded and verified successfully!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to upload image. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">📷 Upload Card Image</h2>
              <p className="text-white/90 text-sm mt-1">{card.player}</p>
            </div>
            <button onClick={handleClose} className="text-white/80 hover:text-white text-2xl">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Card Info */}
          <div className="bg-slate-100 rounded-lg p-4 mb-4">
            <div className="text-sm text-slate-600 mb-1">Card Details</div>
            <div className="font-bold text-slate-900">{card.player}</div>
            <div className="text-sm text-slate-700">
              {card.year} {card.set_name} #{card.card_number}
            </div>
            <div className="text-sm text-green-600 font-semibold mt-1">
              {card.grading_company} {card.grade}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Cert: {card.cert_number}
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Max size: 5MB • Formats: JPG, PNG, WEBP
            </p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mb-4">
              <div className="text-sm font-semibold text-slate-700 mb-2">Preview</div>
              <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-contain bg-slate-50"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">❌ {error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 text-lg">ℹ️</div>
              <div className="text-xs text-blue-800">
                <div className="font-semibold mb-1">Verification Process:</div>
                <div>1. Image will be analyzed using AI</div>
                <div>2. Cert number will be verified against card</div>
                <div>3. Image stored securely in Cloudinary</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-white font-semibold"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload & Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}