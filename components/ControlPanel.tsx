import React, { useCallback, useState, useEffect } from 'react';
import type { FormData, AspectRatio } from '../types';
import { Quality } from '../types';
import UploadIcon from './icons/UploadIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
        />
        <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-full bg-blue-400' : ''}`}></div>
      </div>
      <div className="ml-3 text-gray-300 font-medium">{label}</div>
    </label>
  );
};

interface ControlPanelProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ formData, setFormData, onGenerate, isLoading }) => {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const newPreviews = formData.imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);

    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [formData.imageFiles]);

  const handleFiles = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      const combinedFiles = [...formData.imageFiles, ...newFiles].slice(0, 5);
      setFormData(prev => ({ ...prev, imageFiles: combinedFiles }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleToggleChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, removeBackground: checked }));
  }, [setFormData]);
  
  const handleQualityChange = (quality: Quality) => {
    setFormData(prev => ({ ...prev, quality }));
  };
  
  const handleAspectRatioChange = (ratio: AspectRatio) => {
    setFormData(prev => ({ ...prev, aspectRatio: ratio }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };


  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Upload Images (up to 5)</label>
        
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {imagePreviews.map((previewSrc, index) => (
              <div key={index} className="relative group aspect-square">
                <img src={previewSrc} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md border border-gray-700" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 -m-1 p-0.5 bg-gray-800 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {formData.imageFiles.length < 5 && (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md transition-colors ${isDragging ? 'border-blue-500 bg-gray-700/50' : ''}`}
          >
            <div className="space-y-1 text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-500" aria-hidden="true" />
              <div className="flex text-sm text-gray-500">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-blue-500">
                  <span>{formData.imageFiles.length > 0 ? 'Add more images' : 'Upload files'}</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-600">PNG, JPG, GIF up to 10MB</p>
              <p className="text-xs text-gray-500">{5 - formData.imageFiles.length} slots remaining</p>
            </div>
          </div>
        )}
      </div>

      <ToggleSwitch label="Remove Background" checked={formData.removeBackground} onChange={handleToggleChange} />

      <div>
        <label htmlFor="character" className="block text-sm font-medium text-gray-300">Character Description</label>
        <textarea
          id="character"
          name="character"
          rows={3}
          value={formData.character}
          onChange={handleInputChange}
          className="mt-1 block w-full bg-gray-900/50 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-500"
          placeholder="e.g., a futuristic knight with glowing blue armor"
        />
      </div>

      <div>
        <label htmlFor="scene" className="block text-sm font-medium text-gray-300">Scene, Environment</label>
        <textarea
          id="scene"
          name="scene"
          rows={3}
          value={formData.scene}
          onChange={handleInputChange}
          className="mt-1 block w-full bg-gray-900/50 border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-500"
          placeholder="e.g., standing on a neon-lit cyberpunk street at night"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300">Aspect Ratio</label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['1:1', '3:4', '9:16', '16:9'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => handleAspectRatioChange(ratio)}
                aria-pressed={formData.aspectRatio === ratio}
                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-200 ease-in-out ${
                  formData.aspectRatio === ratio
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {ratio}
              </button>
            ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Output Quality</label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.values(Quality).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleQualityChange(q)}
                aria-pressed={formData.quality === q}
                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-200 ease-in-out ${
                  formData.quality === q
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {q}
              </button>
            ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Higher quality settings instruct the AI to generate images with more detail.</p>
      </div>
      
      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading}
        className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
      >
        {isLoading && <SpinnerIcon className="w-5 h-5 mr-3" aria-hidden="true" />}
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
};

export default ControlPanel;