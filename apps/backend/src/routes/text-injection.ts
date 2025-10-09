import { Router } from 'express';
import { TextInjectionController } from '../controllers/text-injection.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const textInjectionController = new TextInjectionController();

// Annotate panel with bubble positions
router.post('/comics/:comicId/panels/:panelId/annotate', 
  authenticateToken, 
  textInjectionController.annotatePanel.bind(textInjectionController)
);

// Inject text into panel
router.post('/comics/:comicId/panels/:panelId/inject-text', 
  authenticateToken, 
  textInjectionController.injectText.bind(textInjectionController)
);

// Preview text injection
router.get('/comics/:comicId/panels/:panelId/preview', 
  authenticateToken, 
  textInjectionController.previewText.bind(textInjectionController)
);

// Get panel bubbles
router.get('/comics/:comicId/panels/:panelId/bubbles', 
  authenticateToken, 
  textInjectionController.getPanelBubbles.bind(textInjectionController)
);

export default router;
