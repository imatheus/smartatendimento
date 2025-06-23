import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";

import CreateService from "../services/TagServices/CreateService";
import ListService from "../services/TagServices/ListService";
import UpdateService from "../services/TagServices/UpdateService";
import ShowService from "../services/TagServices/ShowService";
import DeleteService from "../services/TagServices/DeleteService";
import SimpleListService from "../services/TagServices/SimpleListService";
import SyncTagService from "../services/TagServices/SyncTagsService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<void> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { tags, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId
  });

  res.json({ tags, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<void> => {
  const { name, color } = req.body;
  const { companyId } = req.user;

  const tag = await CreateService({
    name,
    color,
    companyId
  });

  const io = getIO();
  io.emit("tag", {
    action: "create",
    tag
  });

  res.status(200).json(tag);
};

export const show = async (req: Request, res: Response): Promise<void> => {
  const { tagId } = req.params;

  const tag = await ShowService(tagId);

  res.status(200).json(tag);
};

export const update = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { tagId } = req.params;
  const tagData = req.body;

  const tag = await UpdateService({ tagData, id: tagId });

  const io = getIO();
  io.emit("tag", {
    action: "update",
    tag
  });

  res.status(200).json(tag);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { tagId } = req.params;

  await DeleteService(tagId);

  const io = getIO();
  io.emit("tag", {
    action: "delete",
    tagId
  });

  res.status(200).json({ message: "Tag deleted" });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const tags = await SimpleListService({ searchParam, companyId });

  res.json(tags);
};

export const syncTags = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = req.body;
  const { companyId } = req.user;

  const tags = await SyncTagService({ ...data, companyId });

  res.json(tags);
};
