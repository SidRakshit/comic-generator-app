'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@repo/ui/dialog';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Input } from '@repo/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Sparkles, Camera, RefreshCw, Plus } from 'lucide-react';

interface PanelPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, dialogue?: string) => void;
  panelNumber: number;
  initialPrompt: string;
  initialDialogue?: string;
  isRegenerating?: boolean;
  characters?: Array<{ id: string; name: string; description: string }>;
}

export default function PanelPromptModal({
  isOpen,
  onClose,
  onSubmit,
  panelNumber,
  initialPrompt,
  initialDialogue,
  isRegenerating,
  characters = []
}: PanelPromptModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [dialogue, setDialogue] = useState(initialDialogue || '');
  const [promptType, setPromptType] = useState<'text' | 'image'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogueEntries, setDialogueEntries] = useState<Array<{ characterId: string; text: string }>>([]);
  
  // Predefined prompt suggestions
  const promptSuggestions = [
    "A superhero flying through a futuristic city skyline",
    "Two characters having an intense conversation in a coffee shop",
    "A dramatic battle scene with lightning and rain",
    "A character looking surprised with a shocked expression",
    "A peaceful nature scene with mountains and a lake"
  ];

  // Parse existing dialogue into character entries
  const parseDialogue = (dialogueText: string) => {
    if (!dialogueText || characters.length === 0) return [];
    
    const lines = dialogueText.split('\n').filter(line => line.trim());
    const entries: Array<{ characterId: string; text: string }> = [];
    
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const characterName = line.substring(0, colonIndex).trim();
        const text = line.substring(colonIndex + 1).trim();
        const character = characters.find(c => c.name === characterName);
        if (character) {
          entries.push({ characterId: character.id, text });
        }
      }
    });
    
    return entries;
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt || '');
      setDialogue(initialDialogue || '');
      setIsSubmitting(false);
      
      // Parse existing dialogue into character entries
      const parsedEntries = parseDialogue(initialDialogue || '');
      setDialogueEntries(parsedEntries.length > 0 ? parsedEntries : [{ characterId: characters[0]?.id || '', text: '' }]);
    }
  }, [isOpen, initialPrompt, initialDialogue, characters]);

  // Convert dialogue entries back to text format
  const formatDialogue = () => {
    return dialogueEntries
      .filter(entry => entry.text.trim())
      .map(entry => {
        const character = characters.find(c => c.id === entry.characterId);
        return character ? `${character.name}: ${entry.text}` : entry.text;
      })
      .join('\n');
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const formattedDialogue = formatDialogue();
      await onSubmit(prompt, formattedDialogue || undefined);
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

  const handleDialogueEntryChange = (index: number, field: 'characterId' | 'text', value: string) => {
    const newEntries = [...dialogueEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setDialogueEntries(newEntries);
  };

  const addDialogueEntry = () => {
    setDialogueEntries([...dialogueEntries, { characterId: characters[0]?.id || '', text: '' }]);
  };

  const removeDialogueEntry = (index: number) => {
    if (dialogueEntries.length > 1) {
      setDialogueEntries(dialogueEntries.filter((_, i) => i !== index));
    }
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
              <span>
                <Sparkles className="h-4 w-4 mr-2" />
                Text Prompt
              </span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1" onClick={() => setPromptType('image')}>
              <span>
                <Camera className="h-4 w-4 mr-2" />
                Upload Image
              </span>
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
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Dialogue (Optional)</Label>
              {characters.length > 0 ? (
                <div className="space-y-3">
                  {dialogueEntries.map((entry, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <select
                          value={entry.characterId}
                          onChange={(e) => handleDialogueEntryChange(index, 'characterId', e.target.value)}
                          className="w-full px-3 py-2 border border-white rounded-md text-sm bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {characters.map((char) => (
                            <option key={char.id} value={char.id} className="bg-black text-white">
                              {char.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-2">
                        <Input
                          placeholder="What are they saying?"
                          value={entry.text}
                          onChange={(e) => handleDialogueEntryChange(index, 'text', e.target.value)}
                          className="text-sm bg-black text-white border-white focus:border-blue-500"
                        />
                      </div>
                      {dialogueEntries.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDialogueEntry(index)}
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDialogueEntry}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Dialogue Line
                  </Button>
                </div>
              ) : (
                <Textarea
                  id="dialogue"
                  placeholder="What are the characters saying? (e.g., 'Hello there!' or 'I can't believe this is happening!')"
                  value={dialogue}
                  onChange={(e) => setDialogue(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              )}
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