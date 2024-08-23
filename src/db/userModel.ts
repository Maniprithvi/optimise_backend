import mongoose, { Schema, Types } from "mongoose";
import { IUser } from "../types/model.js";

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  picture: {
    type: String,
  },
  account: {
    type: [Types.ObjectId],
    ref: "Account",
  },
});

const userModel = mongoose.model<IUser>("User", userSchema);

export default userModel;
