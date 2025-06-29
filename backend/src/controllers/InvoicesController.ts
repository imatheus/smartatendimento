import * as Yup from "yup";
import { Request, Response } from "express";
// import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import Invoices from "../models/Invoices";

import CreatePlanService from "../services/PlanService/CreatePlanService";
import UpdatePlanService from "../services/PlanService/UpdatePlanService";
import ShowPlanService from "../services/PlanService/ShowPlanService";
import DeletePlanService from "../services/PlanService/DeletePlanService";

import FindAllInvoiceService from "../services/InvoicesService/FindAllInvoiceService";
import ListInvoicesServices from "../services/InvoicesService/ListInvoicesServices";
import ShowInvoceService from "../services/InvoicesService/ShowInvoiceService";
import UpdateInvoiceService from "../services/InvoicesService/UpdateInvoiceService";
import CreateInvoiceService from "../services/InvoicesService/CreateInvoiceService";
import GenerateInvoicesService from "../services/InvoicesService/GenerateInvoicesService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};
 
type StorePlanData = {
  name: string;
  id?: number | string;
  users: number | 0;
  connections: number | 0;
  queues: number | 0;
  value: number;
};

type UpdateInvoiceData = {
  status: string;
  id?: string;
};

type CreateInvoiceData = {
  companyId: number;
  detail?: string;
  value?: number;
  dueDate?: string;
};

export const index = async (req: Request, res: Response): Promise<void> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { invoices, count, hasMore } = await ListInvoicesServices({
    searchParam,
    pageNumber
  });

  res.json({ invoices, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<void> => {
  const { Invoiceid } = req.params;

  const invoice = await ShowInvoceService(Invoiceid);

  res.status(200).json(invoice);
};


export const list = async (req: Request, res: Response): Promise<void> => {
  const { companyId } = req.user;
  const invoice: Invoices[] = await FindAllInvoiceService(companyId);

  res.status(200).json(invoice);
};

export const update = async (
  req: Request,
  res: Response
): Promise<void> => {
  const InvoiceData: UpdateInvoiceData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string()
  });

  try {
    await schema.validate(InvoiceData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const { id, status } = InvoiceData;

  const plan = await UpdateInvoiceService({
    id,
    status,

  });

  // const io = getIO();
  // io.emit("plan", {
  //   action: "update",
  //   plan
  // });

  res.status(200).json(plan);
};
/* export const store = async (req: Request, res: Response): Promise<void> => {
  const newPlan: StorePlanData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string().required()
  });

  try {
    await schema.validate(newPlan);
  } catch (err) {
    throw new AppError(err.message);
  }

  const plan = await CreatePlanService(newPlan);

  // const io = getIO();
  // io.emit("plan", {
  //   action: "create",
  //   plan
  // });

  res.status(200).json(plan);
};

export const show = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const plan = await ShowPlanService(id);

  res.status(200).json(plan);
};

export const update = async (
  req: Request,
  res: Response
): Promise<void> => {
  const planData: UpdateInvoiceData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string()
  });

  try {
    await schema.validate(planData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const { id, name, users, connections, queues, value } = planData;

  const plan = await UpdatePlanService({
    id,
    name,
    users,
    connections,
    queues,
    value
  });

  // const io = getIO();
  // io.emit("plan", {
  //   action: "update",
  //   plan
  // });

  res.status(200).json(plan);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const plan = await DeletePlanService(id);

  res.status(200).json(plan);
}; */
