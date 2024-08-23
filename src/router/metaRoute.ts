import facebookController from "../controllers/facebookController.js";
import instagramController from "../controllers/instagramController.js";
import express from "express";

export default (router: express.Router) => {
  router.post("/facebook", facebookController.enableFacebook);
  router.get("/facebookOauth", facebookController.handleOauth);

  router.post("/instagram", instagramController.enableFacebook);
  router.get("/instagramOauth", instagramController.handleOauth);
};
