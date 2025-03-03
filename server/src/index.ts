import express, { Application, Request, Response } from "express";
import { createUploadthingExpressHandler } from "uploadthing/express";
import { uploadRouter } from "./upload";
import connectDB from './config/db'
import http from 'http';
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from 'cors';
import helmet from "helmet";
import mongoSanitize from 'express-mongo-sanitize'
import path from 'path'
import { corsOptions, helmetOptions } from "./config/site";
import env from './config/config';
import { IUser } from "./models/users";
import { handleError } from './middlewares/error';
import { AppError } from "./config/handlers";
import authRouter from "./controllers/auth";
import userRouter from "./controllers/user";
import shopRouter from "./controllers/products";
import orderRouter from "./controllers/order";
import stripeRouter from "./controllers/stripe";

connectDB()

const app: Application = express();

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log(`Error : ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
})

app.use(compression());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(cors(corsOptions));
app.use(helmet(helmetOptions));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const server = http.createServer(app)

app.use("/api/v1/stripe", stripeRouter);
app.use(express.json())
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/shop", shopRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/orders', orderRouter)
app.use("/api/uploadthing", createUploadthingExpressHandler({ router: uploadRouter }));

app.use(handleError)

__dirname = path.resolve()
if (process.env.NODE_ENV === 'PRODUCTION') {
  app.use(express.static(path.join(__dirname, './client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/dist/index.html'));
  })
} else {
  app.get("/", (req: Request, res: Response) => {
    res.send("Healthy");
  })
  app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  })
}

server.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
  console.log(`Connected to MongoDB at ${env.MONGO_URI}`);
});

declare global {
  namespace Express {
    interface Request {
      user: IUser
    }
  }
}