import express from "express";
import notificationController from "../controller/notification.controller.js";
import { verifyJWT } from "../utils/utils.js";

const notiApi = express.Router();

notiApi.get(
  "/new-notification",
  verifyJWT,
  notificationController.newNotificationAvai
);
notiApi.post(
  "/notifications",
  verifyJWT,
  notificationController.getNotifications
);
notiApi.post(
  "/all-notifications-count",
  notificationController.allNotificationsCount
);

export { notiApi };
