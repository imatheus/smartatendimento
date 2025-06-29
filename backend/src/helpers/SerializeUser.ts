import Queue from "../models/Queue";
import Company from "../models/Company";
import User from "../models/User";
import Setting from "../models/Setting";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  companyId: number;
  company: Company | null | {
    id: number;
    name: string;
    status: boolean;
    isInTrial: boolean;
    isExpired: boolean;
    dueDate?: string;
    trialExpiration?: Date;
    plan?: any;
  };
  super: boolean;
  queues: Queue[];
  profileImage?: string;
}

export const SerializeUser = async (user: User): Promise<SerializedUser> => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    companyId: user.companyId,
    company: user.company,
    super: user.super,
    queues: user.queues,
    profileImage: user.profileImage
  };
};