import React, { useState, useEffect } from 'react';
import type { FormData, GeneratedImage, Quality } from './types';
import { generateImages } from './services/geminiService';
import ControlPanel from './components/ControlPanel';
import ResultsPanel from './components/ResultsPanel';
import ImageViewer from './components/ImageViewer';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    character: '',
    scene: '',
    quality: 'Standard' as Quality,
    removeBackground: true,
    imageFiles: [],
    aspectRatio: '1:1',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    if (isViewerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function to restore scroll on component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isViewerOpen]);

  const handleGenerateClick = async () => {
    if (formData.imageFiles.length === 0) {
      setError("Please upload an image to generate from.");
      return;
    }
    
    if (!formData.character && !formData.scene) {
        setError("Please provide a character or scene description.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const imageSrcs = await generateImages(formData);
      const newImages = imageSrcs.map((src, index) => ({
        id: `gen-${Date.now()}-${index}`,
        src,
        alt: formData.character || `Generated image ${index + 1}`,
      }));
      setGeneratedImages(newImages);
    } catch (e) {
      const error = e as Error;
      console.error(error);
      setError(`Failed to generate images: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenViewer = (index: number) => {
    setCurrentImageIndex(index);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % generatedImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + generatedImages.length) % generatedImages.length);
  };
  
  const downloadImage = (src: string, filename: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSingle = (index: number) => {
    if (generatedImages[index]) {
      downloadImage(generatedImages[index].src, `generated-image-${index + 1}.png`);
    }
  };
  
  const handleDownloadAll = () => {
    generatedImages.forEach((image, index) => {
      downloadImage(image.src, `generated-image-${index + 1}.png`);
    });
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header className="text-center py-6 border-b border-gray-700">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          SSImage Creator
        </h1>
        <p className="text-gray-400 mt-2">Generate character images with Gemini AI</p>
      </header>
      
      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ControlPanel
          formData={formData}
          setFormData={setFormData}
          onGenerate={handleGenerateClick}
          isLoading={isLoading}
        />
        <ResultsPanel
          images={generatedImages}
          isLoading={isLoading}
          error={error}
          onImageClick={handleOpenViewer}
          onDownloadAll={handleDownloadAll}
        />
      </main>

      {isViewerOpen && generatedImages.length > 0 && (
        <ImageViewer 
          images={generatedImages}
          currentIndex={currentImageIndex}
          onClose={handleCloseViewer}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          onDownloadSingle={handleDownloadSingle}
          onDownloadAll={handleDownloadAll}
        />
      )}
    </div>
  );
};

export default App;