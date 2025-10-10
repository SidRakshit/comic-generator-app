"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { DialogueBubble } from '@repo/common-types';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { MessageSquare, X, Trash2, Cloud, Type } from 'lucide-react';

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

    console.log('🖱️ Canvas mouse down at:', { x, y });

    // Check if clicking on existing bubble
    const clickedBubble = bubbles.find(bubble => 
      x >= bubble.x && x <= bubble.x + bubble.width &&
      y >= bubble.y && y <= bubble.y + bubble.height
    );

    if (clickedBubble) {
      console.log('🎯 Clicked on bubble:', clickedBubble.id);
      setSelectedBubble(clickedBubble.id);
      setIsDrawing(true);
      setDragStart({ x, y });
    } else {
      console.log('📝 Clicked on empty canvas area');
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

    const bubble = bubbles.find(b => b.id === selectedBubble);
    if (!bubble) return;

    const newX = Math.max(0, Math.min(90, bubble.x + deltaX));
    const newY = Math.max(0, Math.min(90, bubble.y + deltaY));

    console.log('🔄 Canvas drag move:', {
      selectedBubble,
      currentPos: { x: bubble.x, y: bubble.y },
      mousePos: { x, y },
      dragStart: dragStart,
      delta: { deltaX, deltaY },
      newPos: { newX, newY }
    });

    // Reposition the bubble (only when dragging from canvas)
    updateBubble(selectedBubble, {
      x: newX,
      y: newY
    });

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    console.log('🛑 Canvas drag end');
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
      // Don't delete bubble if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
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
      <div className="bg-black rounded-lg max-w-6xl max-h-[90vh] w-full overflow-hidden flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Annotate Panel</h2>
          <Button onClick={onCancel} variant="ghost" size="sm" className="text-white hover:bg-gray-800">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 p-4">
            <div className="relative border border-gray-600 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="cursor-crosshair w-full h-auto"
                width={1024}
                height={1024}
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
                  className={`absolute ${
                    selectedBubble === bubble.id 
                      ? 'border-2 border-blue-500' 
                      : 'border-2 border-transparent'
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
                    console.log('🖱️ Bubble mouse down:', bubble.id);
                    setSelectedBubble(bubble.id);
                    setIsDrawing(true);
                    
                    // Calculate mouse position relative to canvas, not bubble
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    
                    const canvasRect = canvas.getBoundingClientRect();
                    const startX = ((e.clientX - canvasRect.left) / canvasRect.width) * 100;
                    const startY = ((e.clientY - canvasRect.top) / canvasRect.height) * 100;
                    
                    setDragStart({ x: startX, y: startY });
                    console.log('📍 Drag start position (canvas relative):', { x: startX, y: startY });
                    console.log('📍 Current bubble position:', { x: bubble.x, y: bubble.y });
                  }}
                  onMouseMove={(e) => {
                    if (!isDrawing || !dragStart || selectedBubble !== bubble.id) return;
                    e.stopPropagation();
                    
                    // Calculate mouse position relative to canvas, not bubble
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    
                    const canvasRect = canvas.getBoundingClientRect();
                    const x = ((e.clientX - canvasRect.left) / canvasRect.width) * 100;
                    const y = ((e.clientY - canvasRect.top) / canvasRect.height) * 100;
                    
                    const deltaX = x - dragStart.x;
                    const deltaY = y - dragStart.y;
                    
                    const newX = Math.max(0, Math.min(90, bubble.x + deltaX));
                    const newY = Math.max(0, Math.min(90, bubble.y + deltaY));
                    
                    console.log('🔄 Bubble dragging:', {
                      bubbleId: bubble.id,
                      currentPos: { x: bubble.x, y: bubble.y },
                      mousePos: { x, y },
                      dragStart: dragStart,
                      delta: { deltaX, deltaY },
                      newPos: { newX, newY }
                    });
                    
                    updateBubble(bubble.id, {
                      x: newX,
                      y: newY
                    });
                    
                    setDragStart({ x, y });
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    console.log('🛑 Bubble drag end:', bubble.id);
                    setIsDrawing(false);
                    setDragStart(null);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    console.log('🚪 Bubble mouse leave during drag:', bubble.id);
                    setIsDrawing(false);
                    setDragStart(null);
                  }}
                >
                  {/* Bubble background */}
                  <div className={`w-full h-full rounded-lg flex items-center justify-center ${
                    bubble.type === 'speech' ? 'bg-white border-2 border-black' :
                    bubble.type === 'thought' ? 'bg-white border-2 border-black rounded-full' :
                    'bg-gray-200 border-2 border-gray-400' // caption
                  }`}>
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                  
                  {/* Text positioned exactly where it should be for each bubble type */}
                  <div 
                    className="absolute text-xs font-medium text-black"
                    style={{
                      // Custom positioning for each bubble type
                      left: bubble.type === 'speech' ? '15%' : 
                            bubble.type === 'thought' ? '20%' : '10%',
                      top: bubble.type === 'speech' ? '25%' : 
                           bubble.type === 'thought' ? '30%' : '20%',
                      width: bubble.type === 'speech' ? '70%' : 
                             bubble.type === 'thought' ? '60%' : '80%',
                      height: bubble.type === 'speech' ? '50%' : 
                              bubble.type === 'thought' ? '40%' : '60%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}
                  >
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
                            const deltaX = ((e.clientX - startX) / 1024) * 100;
                            const deltaY = ((e.clientY - startY) / 1024) * 100;
                            
                            // Resize both width and height, and adjust position
                            const newX = Math.max(0, Math.min(90, bubble.x + deltaX));
                            const newY = Math.max(0, Math.min(90, bubble.y + deltaY));
                            const newWidth = Math.max(5, Math.min(50, bubble.width - deltaX));
                            const newHeight = Math.max(5, Math.min(50, bubble.height - deltaY));
                            
                            updateBubble(bubble.id, {
                              x: newX,
                              y: newY,
                              width: newWidth,
                              height: newHeight
                            });
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
                            const deltaX = ((e.clientX - startX) / 1024) * 100;
                            const deltaY = ((e.clientY - startY) / 1024) * 100;
                            
                            // Resize both width and height, keep position fixed
                            const newWidth = Math.max(5, Math.min(50, bubble.width + deltaX));
                            const newHeight = Math.max(5, Math.min(50, bubble.height + deltaY));
                            
                            updateBubble(bubble.id, {
                              width: newWidth,
                              height: newHeight
                            });
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
          <div className="w-80 border-l border-gray-700 p-4 space-y-4 overflow-y-auto">
            <div>
              <Label className="text-white">Bubble Type</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setBubbleType('speech')}
                  className={`p-2 border rounded-lg flex flex-col items-center space-y-1 ${
                    bubbleType === 'speech' 
                      ? 'border-blue-500 bg-blue-900' 
                      : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                  }`}
                >
                  <MessageSquare className="w-8 h-8 text-white" />
                  <span className="text-xs text-white">Speech</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setBubbleType('thought')}
                  className={`p-2 border rounded-lg flex flex-col items-center space-y-1 ${
                    bubbleType === 'thought' 
                      ? 'border-blue-500 bg-blue-900' 
                      : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                  }`}
                >
                  <Cloud className="w-8 h-8 text-white" />
                  <span className="text-xs text-white">Thought</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setBubbleType('caption')}
                  className={`p-2 border rounded-lg flex flex-col items-center space-y-1 ${
                    bubbleType === 'caption' 
                      ? 'border-blue-500 bg-blue-900' 
                      : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                  }`}
                >
                  <div className="w-8 h-8 border-2 border-gray-400 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">T</span>
                  </div>
                  <span className="text-xs text-white">Caption</span>
                </button>
              </div>
            </div>

            <div>
              <Label className="text-white">Instructions</Label>
              <p className="text-sm text-gray-300 mt-1">
                Click on the image to place bubbles. Drag to move, use handles to resize.
              </p>
            </div>

            {selectedBubble && (
              <div className="space-y-3 p-3 border border-gray-600 rounded-lg bg-gray-800">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-white">Selected Bubble</Label>
                  <Button
                    onClick={() => deleteBubble(selectedBubble)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div>
                  <Label className="text-sm text-white">Text</Label>
                  <Input
                    value={bubbles.find(b => b.id === selectedBubble)?.text || ''}
                    onChange={(e) => updateBubble(selectedBubble, { text: e.target.value })}
                    placeholder="Enter dialogue..."
                    className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <Label className="text-xs text-gray-300">X: {bubbles.find(b => b.id === selectedBubble)?.x.toFixed(1)}%</Label>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-300">Y: {bubbles.find(b => b.id === selectedBubble)?.y.toFixed(1)}%</Label>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-300">W: {bubbles.find(b => b.id === selectedBubble)?.width.toFixed(1)}%</Label>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-300">H: {bubbles.find(b => b.id === selectedBubble)?.height.toFixed(1)}%</Label>
                  </div>
                </div>
              </div>
            )}


            <div className="flex gap-2 pt-4">
              <Button onClick={onSave} className="flex-1 bg-black text-white hover:bg-gray-800 border border-gray-600">
                Save Annotations
              </Button>
              <Button onClick={onCancel} variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-800">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
