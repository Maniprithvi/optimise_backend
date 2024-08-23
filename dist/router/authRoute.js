import authController from "../controllers/authController.js";
export default (router) => {
    router.post("/auth", authController.signInRequest);
    router.get("/oauth", authController.handleOauth);
    router.post("/register", authController.register);
    router.post("/login", authController.login);
};
//# sourceMappingURL=authRoute.js.map