import { Request, Response, NextFunction } from 'express';
import * as reportService from '../services/report.service';

export const getBookingReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, buildingId, status } = req.query;
    const report = await reportService.getBookingReport({
      startDate: startDate as string,
      endDate: endDate as string,
      buildingId: buildingId as string,
      status: status as string
    });
    res.json(report);
  } catch (error) { next(error); }
};
