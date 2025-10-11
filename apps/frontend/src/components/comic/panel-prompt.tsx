'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@repo/ui/dialog';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Input } from '@repo/ui/input';
import { Sparkles, Camera, RefreshCw, Upload, X, Image as ImageIcon } from 'lucide-react';

interface PanelPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, imageFiles?: File[], imageBase64s?: string[], imageMimeTypes?: string[]) => void;
  panelNumber: number;
  initialPrompt: string;
  isRegenerating?: boolean;
  characters?: Array<{ id: string; name: string; description: string }>;
}

export default function PanelPromptModal({
  isOpen,
  onClose,
  onSubmit,
  panelNumber,
  initialPrompt,
  isRegenerating,
  characters = []
}: PanelPromptModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Predefined prompt suggestions
  const promptSuggestions = [
    "A superhero flying through a futuristic city skyline",
    "Two characters having an intense conversation in a coffee shop",
    "A dramatic battle scene with lightning and rain",
    "A character looking surprised with a shocked expression",
    "A peaceful nature scene with mountains and a lake"
  ];


  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt || '');
      setImageFiles([]);
      setImagePreviews([]);
      setIsSubmitting(false);
    }
  }, [isOpen, initialPrompt]);

  // Handle clipboard paste events
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Only handle paste when modal is open
      if (!isOpen) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      // Look for image in clipboard
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/') && imageFiles.length < 4) {
          e.preventDefault(); // Prevent default paste behavior
          
          const file = item.getAsFile();
          if (file) {
            setImageFiles(prevFiles => [...prevFiles, file]);
            
            const reader = new FileReader();
            reader.onload = (e) => {
              setImagePreviews(prevPreviews => [...prevPreviews, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    // Add paste event listener when modal is open
    if (isOpen) {
      window.addEventListener('paste', handlePaste);
    }

    // Cleanup
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, imageFiles.length]);


  const handleSubmit = async () => {
    if (!prompt.trim() && imageFiles.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      let imageBase64s: string[] = [];
      let imageMimeTypes: string[] = [];
      
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const base64 = await convertFileToBase64(file);
          imageBase64s.push(base64);
          imageMimeTypes.push(file.type);
        }
      }
      
      await onSubmit(prompt, imageFiles.length > 0 ? imageFiles : undefined, imageBase64s.length > 0 ? imageBase64s : undefined, imageMimeTypes.length > 0 ? imageMimeTypes : undefined);
    } catch (error) {
      console.error('Error submitting prompt:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * promptSuggestions.length);
    setPrompt(promptSuggestions[randomIndex]);
  };


  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFilesFromInput = files.filter(file => file.type.startsWith('image/'));
    const remainingSlots = 4 - imageFiles.length;
    const filesToAdd = imageFilesFromInput.slice(0, remainingSlots);
    
    if (filesToAdd.length > 0) {
      setImageFiles(prevFiles => [...prevFiles, ...filesToAdd]);
      
      // Process previews for all new files
      filesToAdd.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prevPreviews => [...prevPreviews, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Reset the input so the same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFilesFromDrop = files.filter(file => file.type.startsWith('image/'));
    const remainingSlots = 4 - imageFiles.length;
    const filesToAdd = imageFilesFromDrop.slice(0, remainingSlots);
    
    if (filesToAdd.length > 0) {
      setImageFiles(prevFiles => [...prevFiles, ...filesToAdd]);
      
      // Process previews for all new files
      filesToAdd.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prevPreviews => [...prevPreviews, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };



  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Panel {panelNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Text Prompt Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <Label htmlFor="prompt" className="text-base font-medium">
                Describe what you want in this panel
              </Label>
            </div>
            <Textarea
              id="prompt"
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
            
            {/* Prompt Suggestions */}
            <div>
              <Label className="text-sm text-gray-500">Prompt suggestions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {promptSuggestions.slice(0, 3).map((suggestion, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs"
                  >
                    {suggestion.length > 30 ? suggestion.substring(0, 30) + '...' : suggestion}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRandomPrompt}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Random
                </Button>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-green-500" />
              <Label className="text-base font-medium">
                Upload a reference image
              </Label>
            </div>
            
            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {imagePreviews.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group flex justify-center">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-12 rounded object-cover"
                        />
                        <button
                          className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 shadow-lg border-2 border-red-500 bg-white hover:bg-red-50 hover:scale-110 transition-all flex items-center justify-center"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-2 w-2 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="truncate">
                        {file.name}
                      </div>
                    ))}
                  </div>
                  {imageFiles.length < 4 && (
                    <p className="text-xs text-gray-500">
                      {4 - imageFiles.length} more images can be added
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      Drop images here,{' '}
                      <button
                        type="button"
                        onClick={openFileDialog}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        browse
                      </button>
                      , or paste from clipboard
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB each • Up to 4 images • Cmd+V or Ctrl+V to paste
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              Upload up to 4 image files, drag & drop, or paste from clipboard to use as references for this panel. These can be sketches, photos, or any visual references.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={(!prompt.trim() && imageFiles.length === 0) || isSubmitting}
          >
            {isSubmitting ? 'Generating...' : 'Generate Panel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}