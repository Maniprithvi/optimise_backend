import express from "express";
import authRoute from "./authRoute.js";
import googleRouter from "./googleRoute.js";
import metaRoute from "./metaRoute.js";
const router = express.Router();
export default () => {
    return router.get("/", (req, res, next) => {
        res.send("Development");
    });
};
authRoute(router);
googleRouter(router);
metaRoute(router);
//# sourceMappingURL=index.js.map