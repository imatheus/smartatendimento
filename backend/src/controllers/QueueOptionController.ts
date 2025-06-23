import { Request, Response } from "express";

import CreateService from "../services/QueueOptionService/CreateService";
import ListService from "../services/QueueOptionService/ListService";
import UpdateService from "../services/QueueOptionService/UpdateService";
import ShowService from "../services/QueueOptionService/ShowService";
import DeleteService from "../services/QueueOptionService/DeleteService";

type FilterList = {
  queueId: string | number;
  queueOptionId: string | number;
  parentId: string | number | boolean;
};

export const index = async (req: Request, res: Response): Promise<void> => {
  const { queueId, queueOptionId, parentId } = req.query as FilterList;

  const queueOptions = await ListService({ queueId, queueOptionId, parentId });

  res.json(queueOptions);
};

export const store = async (req: Request, res: Response): Promise<void> => {
  const queueOptionData = req.body;

  const queueOption = await CreateService(queueOptionData);

  res.status(200).json(queueOption);
};

export const show = async (req: Request, res: Response): Promise<void> => {
  const { queueOptionId } = req.params;

  const queueOption = await ShowService(queueOptionId);

  res.status(200).json(queueOption);
};

export const update = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { queueOptionId } = req.params
  const queueOptionData = req.body;

  const queueOption = await UpdateService(queueOptionId, queueOptionData);

  res.status(200).json(queueOption);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { queueOptionId } = req.params

  await DeleteService(queueOptionId);

  res.status(200).json({ message: "Option Delected" });
};
