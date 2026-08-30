import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';
import { prisma } from '../utils/prisma';

export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role !== 'PEMOHON';
    const bookings = await prisma.booking.findMany({
      where: isAdmin ? {} : { userId: req.user?.id },
      include: { room: { include: { building: true } }, documents: true, payment: true, picAssignments: { include: { employee: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) { next(error); }
};

export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role !== 'PEMOHON';
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { room: { include: { building: true } }, documents: true, payment: true, picAssignments: true, history: true }
    });
    if (!booking) return next(new (require('../utils/ApiError').ApiError)(404, 'Booking tidak ditemukan'));
    if (!isAdmin && booking.userId !== req.user!.id) return next(new (require('../utils/ApiError').ApiError)(403, 'Forbidden'));
    res.json(booking);
  } catch (error) { next(error); }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await bookingService.createBooking(req.user!.id, req.body);
    res.status(201).json(booking);
  } catch (error) { next(error); }
};

export const submitBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.submitBooking(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) { next(error); }
};

export const moveToReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.moveToReview(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) { next(error); }
};

export const requestRevision = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { note } = req.body;
    const result = await bookingService.requestRevision(req.params.id, req.user!.id, note);
    res.json(result);
  } catch (error) { next(error); }
};

export const approveBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.approveBooking(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) { next(error); }
};

export const rejectBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const result = await bookingService.rejectBooking(req.params.id, req.user!.id, reason);
    res.json(result);
  } catch (error) { next(error); }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const result = await bookingService.cancelBooking(req.params.id, req.user!.id, reason);
    res.json(result);
  } catch (error) { next(error); }
};

export const checkoutBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.checkoutBooking(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) { next(error); }
};

export const rescheduleBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.rescheduleBooking(req.params.id, req.user!.id, req.body);
    res.json(result);
  } catch (error) { next(error); }
};

export const assignPic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.assignPic(req.params.id, req.user!.id, req.body);
    res.json(result);
  } catch (error) { next(error); }
};

export const removePic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.removePic(req.params.id, req.params.assignmentId, req.user!.id);
    res.json(result);
  } catch (error) { next(error); }
};
