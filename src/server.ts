import express, { Application } from "express";
import { jwtAuth } from "./middlewares/Auth.middleware";

// Routes
import UsersRoute from "./routes/Users.route";
import AuthRoute from "./routes/Auth.route";
import AccountRoute from "./routes/Account.route";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", jwtAuth, UsersRoute);
app.use("/auth", AuthRoute);
app.use("/accounts", jwtAuth, AccountRoute);

export default app;
