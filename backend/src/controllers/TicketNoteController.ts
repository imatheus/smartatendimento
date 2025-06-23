import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import TicketNote from "../models/TicketNote";

import ListTicketNotesService from "../services/TicketNoteService/ListTicketNotesService";
import CreateTicketNoteService from "../services/TicketNoteService/CreateTicketNoteService";
import UpdateTicketNoteService from "../services/TicketNoteService/UpdateTicketNoteService";
import ShowTicketNoteService from "../services/TicketNoteService/ShowTicketNoteService";
import FindAllTicketNotesService from "../services/TicketNoteService/FindAllTicketNotesService";
import DeleteTicketNoteService from "../services/TicketNoteService/DeleteTicketNoteService";
import FindNotesByContactIdAndTicketId from "../services/TicketNoteService/FindNotesByContactIdAndTicketId";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type StoreTicketNoteData = {
  note: string;
  userId: number;
  contactId: number | 0;
  ticketId: number | 0;
  id?: number | string;
};

type UpdateTicketNoteData = {
  note: string;
  id?: number | string;
  userId?: number | 0;
  contactId?: number | 0;
  ticketId?: number | 0;
};

type QueryFilteredNotes = {
  contactId: number | string;
  ticketId: number | string;
};

export const index = async (req: Request, res: Response): Promise<void> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { ticketNotes, count, hasMore } = await ListTicketNotesService({
    searchParam,
    pageNumber
  });

  res.json({ ticketNotes, count, hasMore });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const ticketNotes: TicketNote[] = await FindAllTicketNotesService();

  res.status(200).json(ticketNotes);
};

export const store = async (req: Request, res: Response): Promise<void> => {
  const newTicketNote: StoreTicketNoteData = req.body;
  const { id: userId } = req.user;

  const schema = Yup.object().shape({
    note: Yup.string().required()
  });

  try {
    await schema.validate(newTicketNote);
  } catch (err) {
    throw new AppError(err.message);
  }

  const ticketNote = await CreateTicketNoteService({
    ...newTicketNote,
    userId
  });

  res.status(200).json(ticketNote);
};

export const show = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const ticketNote = await ShowTicketNoteService(id);

  res.status(200).json(ticketNote);
};

export const update = async (
  req: Request,
  res: Response
): Promise<void> => {
  const ticketNote: UpdateTicketNoteData = req.body;

  const schema = Yup.object().shape({
    note: Yup.string()
  });

  try {
    await schema.validate(ticketNote);
  } catch (err) {
    throw new AppError(err.message);
  }

  const recordUpdated = await UpdateTicketNoteService(ticketNote);

  res.status(200).json(recordUpdated);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteTicketNoteService(id);

  res.status(200).json({ message: "Observação removida" });
};

export const findFilteredList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { contactId, ticketId } = req.query as QueryFilteredNotes;
    const notes: TicketNote[] = await FindNotesByContactIdAndTicketId({
      contactId,
      ticketId
    });

    res.status(200).json(notes);
  } catch (e) {
    res.status(500).json({ message: e });
  }
};
