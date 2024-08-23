import mongoose, { Schema, Types } from "mongoose";
const userSchema = new Schema({
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
const userModel = mongoose.model("User", userSchema);
export default userModel;
//# sourceMappingURL=userModel.js.map