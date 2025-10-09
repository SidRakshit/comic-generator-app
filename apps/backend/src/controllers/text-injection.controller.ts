import { Request, Response } from 'express';
import { TextInjectionService } from '../services/text-injection.service';
import { ComicService } from '../services/comics.service';
import { DialogueBubble } from '@repo/common-types';

export class TextInjectionController {
  private textInjectionService = new TextInjectionService();
  private comicService = new ComicService();

  async annotatePanel(req: Request, res: Response) {
    try {
      const { comicId, panelId } = req.params;
      const { bubbles }: { bubbles: DialogueBubble[] } = req.body;

      if (!bubbles || !Array.isArray(bubbles)) {
        return res.status(400).json({ error: 'Bubbles array is required' });
      }

      // Validate bubble data
      for (const bubble of bubbles) {
        if (!bubble.id || !bubble.type || typeof bubble.x !== 'number' || 
            typeof bubble.y !== 'number' || typeof bubble.width !== 'number' || 
            typeof bubble.height !== 'number' || !bubble.text) {
          return res.status(400).json({ error: 'Invalid bubble data structure' });
        }
      }

      // Update panel with bubble annotations
      const result = await this.comicService.updatePanelBubbles(comicId, panelId, bubbles);
      
      res.json({ 
        success: true, 
        panel: {
          ...result,
          bubbles: result.layout_position?.bubbles || []
        }
      });
    } catch (error: any) {
      console.error('Error annotating panel:', error);
      res.status(500).json({ error: error.message || 'Failed to annotate panel' });
    }
  }

  async injectText(req: Request, res: Response) {
    try {
      const { comicId, panelId } = req.params;
      
      // Get panel with bubbles
      const panel = await this.comicService.getPanelWithBubbles(comicId, panelId);
      
      if (!panel.image_url) {
        return res.status(400).json({ error: 'Panel has no image' });
      }

      if (!panel.bubbles || panel.bubbles.length === 0) {
        return res.status(400).json({ error: 'Panel has no bubbles to inject' });
      }

      // Download image
      const imageResponse = await fetch(panel.image_url);
      if (!imageResponse.ok) {
        throw new Error('Failed to download panel image');
      }
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      // Inject text
      const processedImage = await this.textInjectionService.injectDialogueIntoPanel(
        imageBuffer,
        panel.bubbles
      );

      // Upload processed image to S3
      const processedImageUrl = await this.comicService.uploadProcessedImage(
        processedImage,
        comicId,
        panelId
      );

      res.json({ 
        success: true, 
        processedImageUrl,
        panel: { 
          ...panel, 
          processedImageUrl 
        }
      });
    } catch (error: any) {
      console.error('Error injecting text:', error);
      res.status(500).json({ error: error.message || 'Failed to inject text' });
    }
  }

  async previewText(req: Request, res: Response) {
    try {
      const { comicId, panelId } = req.params;
      
      // Get panel with bubbles
      const panel = await this.comicService.getPanelWithBubbles(comicId, panelId);
      
      if (!panel.image_url) {
        return res.status(400).json({ error: 'Panel has no image' });
      }

      if (!panel.bubbles || panel.bubbles.length === 0) {
        return res.status(400).json({ error: 'Panel has no bubbles to preview' });
      }

      // Download image
      const imageResponse = await fetch(panel.image_url);
      if (!imageResponse.ok) {
        throw new Error('Failed to download panel image');
      }
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      // Create preview image
      const previewImage = await this.textInjectionService.createPreviewImage(
        imageBuffer,
        panel.bubbles
      );

      // Convert to base64 for response
      const base64Image = previewImage.toString('base64');
      const dataUrl = `data:image/png;base64,${base64Image}`;

      res.json({ 
        success: true, 
        previewImageUrl: dataUrl
      });
    } catch (error: any) {
      console.error('Error creating preview:', error);
      res.status(500).json({ error: error.message || 'Failed to create preview' });
    }
  }

  async getPanelBubbles(req: Request, res: Response) {
    try {
      const { comicId, panelId } = req.params;
      
      // Get panel with bubbles
      const panel = await this.comicService.getPanelWithBubbles(comicId, panelId);
      
      res.json({ 
        success: true, 
        bubbles: panel.bubbles || []
      });
    } catch (error: any) {
      console.error('Error getting panel bubbles:', error);
      res.status(500).json({ error: error.message || 'Failed to get panel bubbles' });
    }
  }
}
