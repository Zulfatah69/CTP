import { Request, Response, NextFunction } from 'express';
import * as masterService from '../services/master.service';

export const getBuildings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buildings = await masterService.getAllBuildings();
    res.json(buildings);
  } catch (error) { next(error); }
};

export const createBuilding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const building = await masterService.createBuilding(req.body);
    res.status(201).json(building);
  } catch (error) { next(error); }
};

export const updateBuilding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const building = await masterService.updateBuilding(req.params.id, req.body);
    res.json(building);
  } catch (error) { next(error); }
};

export const deleteBuilding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await masterService.deleteBuilding(req.params.id);
    res.json({ message: 'Building logically deleted' });
  } catch (error) { next(error); }
};

export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { buildingId, dateStart, dateEnd } = req.query;
    const rooms = await masterService.getAllRooms(buildingId as string, dateStart as string, dateEnd as string);
    res.json(rooms);
  } catch (error) { next(error); }
};

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await masterService.createRoom(req.body);
    res.status(201).json(room);
  } catch (error) { next(error); }
};

export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await masterService.updateRoom(req.params.id, req.body);
    res.json(room);
  } catch (error) { next(error); }
};

export const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await masterService.deleteRoom(req.params.id);
    res.json({ message: 'Room logically deleted' });
  } catch (error) { next(error); }
};

export const createTariff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tariff = await masterService.createTariff(req.body);
    res.status(201).json(tariff);
  } catch (error) { next(error); }
};

export const deleteTariff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await masterService.deleteTariff(req.params.id);
    res.json({ message: 'Tariff logically deleted' });
  } catch (error) { next(error); }
};

export const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await masterService.getAllEmployees();
    res.json(employees);
  } catch (error) { next(error); }
};
