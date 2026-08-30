import { Router } from 'express';
import multer from 'multer';
import * as documentController from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Upload dokumen untuk suatu booking
router.post('/booking/:bookingId', authenticate, upload.single('file'), documentController.uploadDocument);

// Dapatkan presigned URL untuk unduh/akses dokumen
router.get('/:id/download', authenticate, documentController.downloadDocument);

// Fallback untuk Local Storage Download (Saat MinIO mati)
// Tidak pakai middleware 'authenticate' karena dipanggil via window.open() (tanpa header Bearer)
router.get('/mock-download/:id', documentController.mockDownload);

export default router;
