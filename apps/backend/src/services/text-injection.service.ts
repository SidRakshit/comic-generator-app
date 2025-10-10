import sharp from 'sharp';
import { DialogueBubble } from '@repo/common-types';
import path from 'path';
import fs from 'fs';

export class TextInjectionService {
  async injectDialogueIntoPanel(
    imageBuffer: Buffer,
    bubbles: DialogueBubble[]
  ): Promise<Buffer> {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const { width: imageWidth, height: imageHeight } = metadata;

    if (!imageWidth || !imageHeight) {
      throw new Error('Could not determine image dimensions');
    }

    const compositeOperations = [];

    for (const bubble of bubbles) {
      // Use actual PNG bubble images instead of SVG
      const bubbleImagePath = this.getBubbleImagePath(bubble.type);
      const bubbleImage = await this.loadBubbleImage(bubbleImagePath);
      
      // Resize the bubble image to match the bubble dimensions
      const bubbleWidth = Math.round((bubble.width / 100) * imageWidth);
      const bubbleHeight = Math.round((bubble.height / 100) * imageHeight);
      
      const resizedBubble = await sharp(bubbleImage)
        .resize(bubbleWidth, bubbleHeight, { fit: 'contain' })
        .png()
        .toBuffer();

      // Create text overlay
      const textSvg = this.createTextOverlay(bubble, bubbleWidth, bubbleHeight);
      const textBuffer = Buffer.from(textSvg);
      
      // Composite text onto bubble
      const bubbleWithText = await sharp(resizedBubble)
        .composite([{
          input: textBuffer,
          blend: 'over'
        }])
        .png()
        .toBuffer();
      
      compositeOperations.push({
        input: bubbleWithText,
        top: Math.round((bubble.y / 100) * imageHeight),
        left: Math.round((bubble.x / 100) * imageWidth),
        blend: 'over' as const
      });
    }

    return image
      .composite(compositeOperations)
      .png()
      .toBuffer();
  }

  private createBubbleSvg(bubble: DialogueBubble, imageWidth: number, imageHeight: number): string {
    const bubbleWidth = Math.round((bubble.width / 100) * imageWidth);
    const bubbleHeight = Math.round((bubble.height / 100) * imageHeight);
    const fontSize = Math.max(12, Math.min(24, bubbleHeight / 8));
    
    const bubbleType = bubble.type;
    let bubbleShape = '';
    
    if (bubbleType === 'speech') {
      bubbleShape = this.createSpeechBubbleShape(bubbleWidth, bubbleHeight);
    } else if (bubbleType === 'thought') {
      bubbleShape = this.createThoughtBubbleShape(bubbleWidth, bubbleHeight);
    } else {
      bubbleShape = this.createCaptionShape(bubbleWidth, bubbleHeight);
    }

    // Wrap text for long dialogue
    const wrappedText = this.wrapText(bubble.text, bubbleWidth, fontSize);

    return `
      <svg width="${bubbleWidth}" height="${bubbleHeight}" xmlns="http://www.w3.org/2000/svg">
        ${bubbleShape}
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="${fontSize}" 
              font-weight="bold" fill="black">${wrappedText}</text>
      </svg>
    `;
  }

  private createSpeechBubbleShape(width: number, height: number): string {
    const tailSize = Math.min(width * 0.1, height * 0.1, 20);
    return `
      <rect x="0" y="0" width="${width}" height="${height - tailSize}" 
            fill="white" stroke="black" stroke-width="2" rx="10" ry="10"/>
      <polygon points="${width * 0.2},${height - tailSize} ${width * 0.3},${height} ${width * 0.4},${height - tailSize}" 
               fill="white" stroke="black" stroke-width="2"/>
    `;
  }

  private createThoughtBubbleShape(width: number, height: number): string {
    return `
      <ellipse cx="${width/2}" cy="${height/2}" rx="${width/2 - 2}" ry="${height/2 - 2}" 
               fill="white" stroke="black" stroke-width="2"/>
    `;
  }

  private createCaptionShape(width: number, height: number): string {
    return `
      <rect x="0" y="0" width="${width}" height="${height}" 
            fill="#f9e076" stroke="black" stroke-width="2" rx="5" ry="5"/>
    `;
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = testLine.length * fontSize * 0.6; // Rough character width estimation
      
      if (testWidth <= maxWidth * 0.9) { // 90% of bubble width for padding
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word); // Single word too long
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join('\n');
  }

  async createPreviewImage(
    imageBuffer: Buffer,
    bubbles: DialogueBubble[]
  ): Promise<Buffer> {
    // Create a preview with semi-transparent bubbles
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const { width: imageWidth, height: imageHeight } = metadata;

    if (!imageWidth || !imageHeight) {
      throw new Error('Could not determine image dimensions');
    }

    const compositeOperations = [];

    for (const bubble of bubbles) {
      const bubbleSvg = this.createPreviewBubbleSvg(bubble, imageWidth, imageHeight);
      const bubbleBuffer = Buffer.from(bubbleSvg);
      
      compositeOperations.push({
        input: bubbleBuffer,
        top: Math.round((bubble.y / 100) * imageHeight),
        left: Math.round((bubble.x / 100) * imageWidth),
        blend: 'over' as const
      });
    }

    return image
      .composite(compositeOperations)
      .png()
      .toBuffer();
  }

  private createPreviewBubbleSvg(bubble: DialogueBubble, imageWidth: number, imageHeight: number): string {
    const bubbleWidth = Math.round((bubble.width / 100) * imageWidth);
    const bubbleHeight = Math.round((bubble.height / 100) * imageHeight);
    
    return `
      <svg width="${bubbleWidth}" height="${bubbleHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${bubbleWidth}" height="${bubbleHeight}" 
              fill="rgba(0, 0, 255, 0.3)" stroke="blue" stroke-width="2" 
              rx="5" ry="5"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="12" 
              font-weight="bold" fill="blue">${bubble.text || 'Empty'}</text>
      </svg>
    `;
  }

  private getBubbleImagePath(bubbleType: string): string {
    const bubbleImages = {
      'speech': 'speech-bubble.png',
      'thought': 'thought-bubble.png',
      'caption': 'speech-bubble.png' // fallback to speech bubble
    };
    
    const fileName = bubbleImages[bubbleType as keyof typeof bubbleImages] || 'speech-bubble.png';
    return path.join(process.cwd(), 'apps', 'frontend', 'public', fileName);
  }

  private async loadBubbleImage(imagePath: string): Promise<Buffer> {
    try {
      return await fs.promises.readFile(imagePath);
    } catch (error) {
      console.error(`Error loading bubble image from ${imagePath}:`, error);
      throw new Error(`Could not load bubble image: ${imagePath}`);
    }
  }

  private createTextOverlay(bubble: DialogueBubble, bubbleWidth: number, bubbleHeight: number): string {
    const fontSize = Math.max(12, Math.min(24, bubbleHeight / 8));
    
    // Custom positioning for each bubble type (matching frontend positioning)
    const textArea = this.getTextAreaForBubbleType(bubble.type, bubbleWidth, bubbleHeight);
    
    // Wrap text for long dialogue
    const wrappedText = this.wrapText(bubble.text, textArea.width, fontSize);

    return `
      <svg width="${bubbleWidth}" height="${bubbleHeight}" xmlns="http://www.w3.org/2000/svg">
        <text x="${textArea.x}" y="${textArea.y}" 
              text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="${fontSize}" 
              font-weight="bold" fill="black">${wrappedText}</text>
      </svg>
    `;
  }

  private getTextAreaForBubbleType(bubbleType: string, bubbleWidth: number, bubbleHeight: number) {
    switch (bubbleType) {
      case 'speech':
        return {
          x: bubbleWidth * 0.5, // 50% (center)
          y: bubbleHeight * 0.5, // 50% (center)
          width: bubbleWidth * 0.7, // 70% width
          height: bubbleHeight * 0.5 // 50% height
        };
      case 'thought':
        return {
          x: bubbleWidth * 0.5, // 50% (center)
          y: bubbleHeight * 0.5, // 50% (center)
          width: bubbleWidth * 0.6, // 60% width
          height: bubbleHeight * 0.4 // 40% height
        };
      case 'caption':
        return {
          x: bubbleWidth * 0.5, // 50% (center)
          y: bubbleHeight * 0.5, // 50% (center)
          width: bubbleWidth * 0.8, // 80% width
          height: bubbleHeight * 0.6 // 60% height
        };
      default:
        return {
          x: bubbleWidth * 0.5,
          y: bubbleHeight * 0.5,
          width: bubbleWidth * 0.7,
          height: bubbleHeight * 0.5
        };
    }
  }
}
