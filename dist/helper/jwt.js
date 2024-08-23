import jwt from "jsonwebtoken";
const generateToken = (id, name, email) => {
    const key = process.env.JWT_PRIVATE_KEY;
    const token = jwt.sign({ id, name, email }, key);
    return token;
};
export default generateToken;
//# sourceMappingURL=jwt.js.map