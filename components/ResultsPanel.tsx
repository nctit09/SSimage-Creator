
import React from 'react';
import type { GeneratedImage } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface ResultsPanelProps {
  images: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  onImageClick: (index: number) => void;
  onDownloadAll: () => void;
}

const ImageSlot: React.FC<{ image?: GeneratedImage; isLoading: boolean; onClick: () => void }> = ({ image, isLoading, onClick }) => {
  const baseClasses = "aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-700 transition-all duration-300";

  if (image) {
    return (
      <button onClick={onClick} className={`${baseClasses} group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`}>
        <img 
          src={image.src} 
          alt={image.alt} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
      </button>
    );
  }

  const content = () => {
    if (isLoading) {
      return <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center"><div className="text-gray-600">Generating...</div></div>;
    }
    return <div className="w-full h-full bg-gray-800/50 border-2 border-dashed border-gray-700 flex items-center justify-center"><div className="text-gray-600 text-center p-4">Your generated image will appear here</div></div>;
  };
  
  return (
    <div className={baseClasses}>
      {content()}
    </div>
  );
};

const ResultsPanel: React.FC<ResultsPanelProps> = ({ images, isLoading, error, onImageClick, onDownloadAll }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-200">Results</h2>
        {images.length > 0 && (
          <button
            onClick={onDownloadAll}
            className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            Download All
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 flex-grow">
        {Array.from({ length: 4 }).map((_, index) => (
          <ImageSlot 
            key={images[index]?.id || index} 
            isLoading={isLoading && images.length === 0} 
            image={images[index]}
            onClick={() => onImageClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsPanel;
