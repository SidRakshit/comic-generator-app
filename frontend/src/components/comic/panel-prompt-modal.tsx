'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Camera, RefreshCw } from 'lucide-react';

interface PanelPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  panelNumber: number;
  initialPrompt: string;
  isRegenerating?: boolean
}

export default function PanelPromptModal({
  isOpen,
  onClose,
  onSubmit,
  panelNumber,
  initialPrompt,
  isRegenerating
}: PanelPromptModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [promptType, setPromptType] = useState<'text' | 'image'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      setIsSubmitting(false);
    }
  }, [isOpen, initialPrompt]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(prompt);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Panel {panelNumber}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="text" className="w-full mt-4">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="text" className="flex-1" onClick={() => setPromptType('text')}>
              <Sparkles className="h-4 w-4 mr-2" />
              Text Prompt
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1" onClick={() => setPromptType('image')}>
              <Camera className="h-4 w-4 mr-2" />
              Upload Image
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Describe what you want in this panel</Label>
              <Textarea
                id="prompt"
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
            
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
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload a reference image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                // This would be connected to state in a full implementation
              />
            </div>
            <p className="text-sm text-gray-500">
              Upload an image to use as a reference for this panel.
              This can be a sketch, photo, or any visual reference.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!prompt.trim() || isSubmitting}
          >
            {isSubmitting ? 'Generating...' : 'Generate Panel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}