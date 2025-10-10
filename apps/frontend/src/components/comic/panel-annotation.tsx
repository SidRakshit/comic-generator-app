"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { DialogueBubble } from '@repo/common-types';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { MessageSquare, X, Trash2 } from 'lucide-react';

interface PanelAnnotationProps {
  panelId: string;
  imageUrl: string;
  bubbles: DialogueBubble[];
  onBubblesChange: (bubbles: DialogueBubble[]) => void;
  onSave: () => void;
  onCancel: () => void;
  characters?: Array<{ id: string; name: string; description: string }>;
}

export default function PanelAnnotation({
  panelId,
  imageUrl,
  bubbles,
  onBubblesChange,
  onSave,
  onCancel,
  characters = []
}: PanelAnnotationProps) {
  const [selectedBubble, setSelectedBubble] = useState<string | null>(null);
  const [bubbleType, setBubbleType] = useState<'speech' | 'thought' | 'caption'>('speech');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Load image and draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (canvas && img) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }
  }, [imageUrl]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newBubble: DialogueBubble = {
      id: `bubble-${Date.now()}`,
      type: bubbleType,
      x: Math.max(0, Math.min(90, x - 10)), // Center the bubble, keep within bounds
      y: Math.max(0, Math.min(90, y - 5)),
      width: 20,
      height: 10,
      text: '',
      characterName: ''
    };

    onBubblesChange([...bubbles, newBubble]);
    setSelectedBubble(newBubble.id);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Check if clicking on existing bubble
    const clickedBubble = bubbles.find(bubble => 
      x >= bubble.x && x <= bubble.x + bubble.width &&
      y >= bubble.y && y <= bubble.y + bubble.height
    );

    if (clickedBubble) {
      setSelectedBubble(clickedBubble.id);
      setIsDrawing(true);
      setDragStart({ x, y });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !dragStart || !selectedBubble) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    // Reposition the bubble (only when dragging from canvas)
    updateBubble(selectedBubble, {
      x: Math.max(0, Math.min(90, bubbles.find(b => b.id === selectedBubble)!.x + deltaX)),
      y: Math.max(0, Math.min(90, bubbles.find(b => b.id === selectedBubble)!.y + deltaY))
    });

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setDragStart(null);
  };

  const updateBubble = (bubbleId: string, updates: Partial<DialogueBubble>) => {
    onBubblesChange(
      bubbles.map(bubble => 
        bubble.id === bubbleId ? { ...bubble, ...updates } : bubble
      )
    );
  };

  const deleteBubble = useCallback((bubbleId: string) => {
    onBubblesChange(bubbles.filter(bubble => bubble.id !== bubbleId));
    if (selectedBubble === bubbleId) {
      setSelectedBubble(null);
    }
  }, [bubbles, selectedBubble, onBubblesChange]);

  // Keyboard support for deleting bubbles
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedBubble) {
          event.preventDefault();
          deleteBubble(selectedBubble);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBubble, deleteBubble]);

  const resizeBubble = (bubbleId: string, direction: 'width' | 'height', delta: number) => {
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble) return;

    const newValue = Math.max(5, Math.min(50, bubble[direction] + delta));
    updateBubble(bubbleId, { [direction]: newValue });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] w-full overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Annotate Panel</h2>
          <Button onClick={onCancel} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 p-4">
            <div className="relative border border-gray-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="cursor-crosshair w-full h-auto"
                width={600}
                height={400}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <img
                ref={imageRef}
                src={imageUrl}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-0"
                onLoad={() => {
                  const canvas = canvasRef.current;
                  const img = imageRef.current;
                  if (canvas && img) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    }
                  }
                }}
              />
              
              {/* Render bubbles */}
              {bubbles.map(bubble => (
                <div
                  key={bubble.id}
                  className={`absolute border-2 ${
                    selectedBubble === bubble.id 
                      ? 'border-blue-500 bg-blue-100 bg-opacity-50' 
                      : 'border-blue-300 bg-blue-50 bg-opacity-30'
                  } cursor-pointer group`}
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                    width: `${bubble.width}%`,
                    height: `${bubble.height}%`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBubble(bubble.id);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedBubble(bubble.id);
                    setIsDrawing(true);
                    setDragStart({ 
                      x: ((e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width) * 100,
                      y: ((e.clientY - e.currentTarget.getBoundingClientRect().top) / e.currentTarget.getBoundingClientRect().height) * 100
                    });
                  }}
                  onMouseMove={(e) => {
                    if (!isDrawing || !dragStart || selectedBubble !== bubble.id) return;
                    e.stopPropagation();
                    
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    
                    const deltaX = x - dragStart.x;
                    const deltaY = y - dragStart.y;
                    
                    updateBubble(bubble.id, {
                      x: Math.max(0, Math.min(90, bubble.x + deltaX)),
                      y: Math.max(0, Math.min(90, bubble.y + deltaY))
                    });
                    
                    setDragStart({ x, y });
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    setIsDrawing(false);
                    setDragStart(null);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    setIsDrawing(false);
                    setDragStart(null);
                  }}
                >
                  <div className="text-xs p-1 truncate h-full flex items-center justify-center">
                    {bubble.text || 'Empty'}
                  </div>
                  
                  {/* Resize handles and delete button */}
                  {selectedBubble === bubble.id && (
                    <>
                      {/* Delete button */}
                      <div
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full cursor-pointer flex items-center justify-center text-white text-xs font-bold hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBubble(bubble.id);
                        }}
                        title="Delete bubble"
                      >
                        ×
                      </div>
                      
                      {/* Resize handles */}
                      <div
                        className="absolute -left-1 -top-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startWidth = bubble.width;
                          const startHeight = bubble.height;
                          
                          const handleMouseMove = (e: MouseEvent) => {
                            const deltaX = ((e.clientX - startX) / 600) * 100;
                            const deltaY = ((e.clientY - startY) / 400) * 100;
                            
                            // Only resize, no repositioning
                            const widthDelta = -deltaX; // Negative because we're resizing from left
                            const heightDelta = -deltaY; // Negative because we're resizing from top
                            
                            resizeBubble(bubble.id, 'width', widthDelta);
                            resizeBubble(bubble.id, 'height', heightDelta);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      />
                      <div
                        className="absolute -right-1 -bottom-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startX = e.clientX;
                          const startY = e.clientY;
                          
                          const handleMouseMove = (e: MouseEvent) => {
                            const deltaX = ((e.clientX - startX) / 600) * 100;
                            const deltaY = ((e.clientY - startY) / 400) * 100;
                            
                            // Use resizeBubble function for both width and height
                            resizeBubble(bubble.id, 'width', deltaX);
                            resizeBubble(bubble.id, 'height', deltaY);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="w-80 border-l p-4 space-y-4 overflow-y-auto">
            <div>
              <Label>Bubble Type</Label>
              <select
                value={bubbleType}
                onChange={(e) => setBubbleType(e.target.value as any)}
                className="w-full p-2 border rounded mt-1"
              >
                <option value="speech">Speech Bubble</option>
                <option value="thought">Thought Bubble</option>
                <option value="caption">Caption</option>
              </select>
            </div>

            <div>
              <Label>Instructions</Label>
              <p className="text-sm text-gray-600 mt-1">
                Click on the image to place bubbles. Drag to move, use handles to resize.
              </p>
            </div>

            {selectedBubble && (
              <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Selected Bubble</Label>
                  <Button
                    onClick={() => deleteBubble(selectedBubble)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div>
                  <Label className="text-sm">Text</Label>
                  <Input
                    value={bubbles.find(b => b.id === selectedBubble)?.text || ''}
                    onChange={(e) => updateBubble(selectedBubble, { text: e.target.value })}
                    placeholder="Enter dialogue..."
                    className="mt-1"
                  />
                </div>
                
                {characters.length > 0 && (
                  <div>
                    <Label className="text-sm">Character</Label>
                    <select
                      value={bubbles.find(b => b.id === selectedBubble)?.characterId || ''}
                      onChange={(e) => {
                        const character = characters.find(c => c.id === e.target.value);
                        updateBubble(selectedBubble, { 
                          characterId: e.target.value,
                          characterName: character?.name || ''
                        });
                      }}
                      className="w-full p-2 border rounded mt-1"
                    >
                      <option value="">Select character...</option>
                      {characters.map((char) => (
                        <option key={char.id} value={char.id}>
                          {char.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <Label className="text-xs">X: {bubbles.find(b => b.id === selectedBubble)?.x.toFixed(1)}%</Label>
                  </div>
                  <div>
                    <Label className="text-xs">Y: {bubbles.find(b => b.id === selectedBubble)?.y.toFixed(1)}%</Label>
                  </div>
                  <div>
                    <Label className="text-xs">W: {bubbles.find(b => b.id === selectedBubble)?.width.toFixed(1)}%</Label>
                  </div>
                  <div>
                    <Label className="text-xs">H: {bubbles.find(b => b.id === selectedBubble)?.height.toFixed(1)}%</Label>
                  </div>
                </div>
              </div>
            )}


            <div className="flex gap-2 pt-4">
              <Button onClick={onSave} className="flex-1">
                Save Annotations
              </Button>
              <Button onClick={onCancel} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
