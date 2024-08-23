import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const generateToken = (
  id: mongoose.Types.ObjectId,
  name: string,
  email: any
) => {
  const key = process.env.JWT_PRIVATE_KEY as string;
  const token = jwt.sign({ id, name, email }, key);
  return token;
};

export default generateToken;
