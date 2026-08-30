import { Router } from 'express';
import * as masterController from '../controllers/master.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireRole } from '../middleware/auth';
import { createBuildingSchema, createRoomSchema, createTariffSchema } from '../utils/master.validators';
import { Role } from '@prisma/client';

const router = Router();

// ==========================================
// Buildings (Gedung)
// ==========================================
// Public/All authenticated users can GET buildings (for booking forms)
router.get('/buildings', authenticate, masterController.getBuildings);

// Only ADMIN and above can modify master data
router.post('/buildings', authenticate, requireRole([Role.ADMIN, Role.KEPALA_UPTD]), validate(createBuildingSchema), masterController.createBuilding);
router.put('/buildings/:id', authenticate, requireRole([Role.ADMIN, Role.KEPALA_UPTD]), validate(createBuildingSchema), masterController.updateBuilding);
router.delete('/buildings/:id', authenticate, requireRole([Role.ADMIN, Role.KEPALA_UPTD]), masterController.deleteBuilding);

// ==========================================
// Rooms (Ruangan)
// ==========================================
router.get('/rooms', authenticate, masterController.getRooms);
router.post('/rooms', authenticate, requireRole([Role.ADMIN, Role.KEPALA_UPTD]), validate(createRoomSchema), masterController.createRoom);
router.put('/rooms/:id', authenticate, requireRole([Role.ADMIN, Role.KEPALA_UPTD]), validate(createRoomSchema), masterController.updateRoom);
router.delete('/rooms/:id', authenticate, requireRole([Role.ADMIN, Role.KEPALA_UPTD]), masterController.deleteRoom);

// ==========================================
// Tariffs (Tarif Ruangan)
// ==========================================
router.post('/tariffs', authenticate, requireRole([Role.ADMIN, Role.KEPALA_UPTD]), validate(createTariffSchema), masterController.createTariff);
router.delete('/tariffs/:id', authenticate, requireRole([Role.ADMIN, Role.KEPALA_UPTD]), masterController.deleteTariff);

// ==========================================
// Employees (Staff & PIC)
// ==========================================
router.get('/employees', authenticate, masterController.getEmployees);

export default router;
