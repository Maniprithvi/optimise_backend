import jwt from "jsonwebtoken";
export const authentication = async (req, res, next) => {
    const token = req.header("x-auth-token");
    if (token) {
        const key = process.env.JWT_PRIVATE_KEY;
        try {
            const decoded = jwt.verify(token, key);
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(400).send({ message: "Invalid token" });
        }
    }
    else {
        res.status(400).send({ message: "Token is required!" });
    }
};
export const decode = (req) => {
    // const token = req.header("x-auth-token");
    const token = req?.cookies.auth_token;
    console.log(token, "cookies");
    if (token) {
        const key = process.env.JWT_PRIVATE_KEY;
        try {
            const decoded = jwt.verify(token, key);
            const user = decoded;
            return user;
        }
        catch (error) {
            throw new Error("invalid token");
        }
    }
    else {
        throw new Error("invalid token");
    }
};
//# sourceMappingURL=middleware.js.map