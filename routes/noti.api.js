import express from "express";
import notificationController from "../controller/notification.controller.js";
import { verifyJWT } from "../utils/utils.js";

const notiApi = express.Router();

notiApi.get(
  "/new-notification",
  verifyJWT,
  notificationController.newNotificationAvai
);
notiApi.get(
  "/notifications",
  verifyJWT,
  notificationController.getNotifications
);
notiApi.get(
  "/all-notifications-count",
  notificationController.allNotificationsCount
);

export { notiApi };
