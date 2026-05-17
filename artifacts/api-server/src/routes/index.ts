import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import albumArtRouter from "./album-art";
import appStateRouter from "./app-state";
import authRouter from "./auth";
import songPreviewRouter from "./song-preview";
import youtubeRouter from "./youtube";
import guestRequestsRouter from "./guest-requests";
import privacyRouter from "./privacy";
import pushRouter from "./push";
import spotifyRouter from "./spotify";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(albumArtRouter);
router.use(authRouter);
router.use(youtubeRouter);
router.use(appStateRouter);
router.use(songPreviewRouter);
router.use(guestRequestsRouter);
router.use(privacyRouter);
router.use(pushRouter);
router.use(spotifyRouter);

export default router;
