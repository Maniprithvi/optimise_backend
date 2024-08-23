import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface User {
  id: string;
  name: string;
  email: string;
}

interface RequestCustom extends Request {
  user?: User;
}

export const authentication = async (
  req: RequestCustom,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("x-auth-token");

  if (token) {
    const key = process.env.JWT_PRIVATE_KEY as string;
    try {
      const decoded = jwt.verify(token as string, key);
      req.user = decoded as User;
      next();
    } catch (error) {
      res.status(400).send({ message: "Invalid token" });
    }
  } else {
    res.status(400).send({ message: "Token is required!" });
  }
};

export const decode = (req: any) => {
  // const token = req.header("x-auth-token");
  const token = req?.cookies.auth_token;
  console.log(token, "cookies");
  if (token) {
    const key = process.env.JWT_PRIVATE_KEY as string;
    try {
      const decoded = jwt.verify(token as string, key);
      const user = decoded as User;
      return user;
    } catch (error) {
      throw new Error("invalid token");
    }
  } else {
    throw new Error("invalid token");
  }
};
