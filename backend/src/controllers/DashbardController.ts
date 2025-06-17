import { Request, Response } from "express";

import DashboardDataService, {
  DashboardData,
  Params
} from "../services/ReportService/DashbardDataService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const params: Params = req.query;
    const { companyId } = req.user;

    const dashboardData: DashboardData = await DashboardDataService(
      companyId,
      params
    );
    
    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard controller error:', error);
    
    // Return default data in case of error
    return res.status(200).json({
      counters: {
        supportHappening: 0,
        supportPending: 0,
        supportFinished: 0,
        avgSupportTime: 0,
        avgWaitTime: 0,
        leads: 0
      },
      attendants: []
    });
  }
};