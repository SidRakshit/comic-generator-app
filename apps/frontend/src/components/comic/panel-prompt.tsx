'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@repo/ui/dialog';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Sparkles, Camera, RefreshCw, Upload, X, Image as ImageIcon } from 'lucide-react';

interface PanelPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, imageFile?: File, imageBase64?: string, imageMimeType?: string) => void;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
      setImageFile(null);
      setImagePreview(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialPrompt]);


  const handleSubmit = async () => {
    if (!prompt.trim() && !imageFile) return;
    
    setIsSubmitting(true);
    
    try {
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;
      
      if (imageFile) {
        imageBase64 = await convertFileToBase64(imageFile);
        imageMimeType = imageFile.type;
      }
      
      await onSubmit(prompt, imageFile || undefined, imageBase64, imageMimeType);
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

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
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
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
              
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative inline-block group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-32 max-w-full rounded-lg object-cover"
                    />
                    <button
                      className="absolute -top-3 -right-3 h-8 w-8 rounded-full p-0 shadow-lg border-2 border-red-500 bg-white hover:bg-red-50 hover:scale-110 transition-all flex items-center justify-center"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {imageFile?.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      Drop an image here, or{' '}
                      <button
                        type="button"
                        onClick={openFileDialog}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              Upload an image to use as a reference for this panel. This can be a sketch, photo, or any visual reference.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={(!prompt.trim() && !imageFile) || isSubmitting}
          >
            {isSubmitting ? 'Generating...' : 'Generate Panel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}