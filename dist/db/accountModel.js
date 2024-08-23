import mongoose, { Schema } from "mongoose";
const accountSchema = new Schema({
    access_token: {
        type: String,
        require: true,
    },
    refresh_token: {
        type: String,
        require: true,
    },
    token_type: {
        type: String,
        require: true,
    },
    scope: {
        type: String,
        require: true,
    },
    expiry_date: {
        type: Number,
        require: true,
    },
    id_token: {
        type: String,
        require: true,
    },
    type: {
        type: String,
        enum: ["auth", "youtube", "analytic", "console"],
        required: true,
    },
}, { timestamps: true });
const accountModel = mongoose.model("Account", accountSchema);
export default accountModel;
//# sourceMappingURL=accountModel.js.map