import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import User from "../../models/User";
import Plan from "../../models/Plan";
import Company from "../../models/Company";

interface Request {
  email: string;
  password: string;
  name: string;
  queueIds?: number[];
  companyId?: number;
  profile?: string;
  profileImage?: string;
}

interface Response {
  email: string;
  name: string;
  id: number;
  profile: string;
  profileImage?: string;
}

const CreateUserService = async ({
  email,
  password,
  name,
  queueIds = [],
  companyId,
  profile = "admin",
  profileImage
}: Request): Promise<Response> => {
  if (companyId !== undefined) {
    const company = await Company.findOne({
      where: {
        id: companyId
      },
      include: [{ model: Plan, as: "plan" }]
    });

    if (company !== null) {
      const usersCount = await User.count({
        where: {
          companyId
        }
      });

      if (usersCount >= company.plan.users) {
        throw new AppError(
          `Número máximo de usuários já alcançado: ${usersCount}`
        );
      }
    }
  }

  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    email: Yup.string()
      .email()
      .required()
      .test(
        "Check-email",
        "An user with this email already exists.",
        async value => {
          if (!value) return false;
          const emailExists = await User.findOne({
            where: { email: value }
          });
          return !emailExists;
        }
      ),
    password: Yup.string().required().min(5),
    profileImage: Yup.string()
  });

  try {
    await schema.validate({ email, password, name, profileImage });
  } catch (err) {
    throw new AppError(err.message);
  }

  const user = await User.create(
    {
      email,
      password,
      name,
      companyId,
      profile,
      profileImage
    },
    { include: ["queues", "company"] }
  );

  await user.$set("queues", queueIds);

  await user.reload();

  const serializedUser = SerializeUser(user);

  return serializedUser;
};

export default CreateUserService;