import { Request, Response, NextFunction } from 'express';
import { gymDocumentService } from './gym-document.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class GymDocumentController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const gymId = req.params.id;
      const uploadedBy = req.user!.userId;
      const file = req.file;

      if (!file) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' } });
        return;
      }

      const documentType = req.body.documentType || 'other';
      const result = await gymDocumentService.upload(gymId, tenantId, documentType, file, uploadedBy);
      res.status(HttpStatusCode.CREATED).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const gymId = req.params.id;
      const result = await gymDocumentService.findByGym(gymId, tenantId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const gymId = req.params.id;
      const docId = req.params.docId;
      const { status } = req.body;
      const result = await gymDocumentService.updateStatus(docId, gymId, tenantId, status);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const gymId = req.params.id;
      const docId = req.params.docId;
      await gymDocumentService.delete(docId, gymId, tenantId);
      res.status(HttpStatusCode.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  }
}

export const gymDocumentController = new GymDocumentController();
