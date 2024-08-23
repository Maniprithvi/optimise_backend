import facebookController from "../controllers/facebookController.js";
import instagramController from "../controllers/instagramController.js";
export default (router) => {
    router.post("/facebook", facebookController.enableFacebook);
    router.get("/facebookOauth", facebookController.handleOauth);
    router.post("/instagram", instagramController.enableFacebook);
    router.get("/instagramOauth", instagramController.handleOauth);
};
//# sourceMappingURL=metaRoute.js.map