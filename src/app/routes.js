import { Router } from "express";
import multer from "multer";
import multerConfig from "../config/multer";
import UserController from "./controllers/UserController";
import SessionController from "./controllers/SessionController";
import FileController from "./controllers/FileController";
import MeetupController from "./controllers/MeetupController";
import SubscriptionController from "./controllers/SubscriptionController";

import AuthMiddleware from "./middlewares/auth";

const routes = new Router();

const upload = multer(multerConfig);

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);

routes.use(AuthMiddleware);

routes.post("/files", upload.single("file"), FileController.store);

routes.put("/users", UserController.update);

routes.get("/meetups", MeetupController.index);
routes.post("/meetups", MeetupController.store);
routes.put("/meetups/:id", MeetupController.update);
routes.delete("/meetups/:id", MeetupController.delete);

routes.get("/subscriptions", SubscriptionController.index);
routes.post("/subscriptions/:id", SubscriptionController.store);
routes.delete("/subscriptions/:id", SubscriptionController.delete);

export default routes;
