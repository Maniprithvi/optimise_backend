import youtubeController from "../controllers/youtubeController.js";
import searchConsoleController from "../controllers/searchConsoleController.js";
import analticsController from "../controllers/analticsController.js";
export default (router) => {
    // youtube
    router.post("/youtube", youtubeController.enableYoutube);
    router.get("/youtubeOauth", youtubeController.handleOauth);
    router.get("/youtube-analytics", youtubeController.getVideoAnalytics);
    router.get("/channel-info", youtubeController.getvideosInfo);
    router.get("/youtube-status", youtubeController.getstatus);
    // console
    router.post("/console", searchConsoleController.enableConsole);
    router.get("/consoleOauth", searchConsoleController.handleOauth);
    router.get("/performence", searchConsoleController.getPerformence);
    router.get("/sitemap", searchConsoleController.getSiteMapData);
    router.get("/console-status", searchConsoleController.getstatus);
    // analytics
    router.post("/analytics", analticsController.enableAnalytics);
    router.get("/analyticsOauth", analticsController.handleOauth);
    router.get("/analytics-status", analticsController.getstatus);
};
//# sourceMappingURL=googleRoute.js.map