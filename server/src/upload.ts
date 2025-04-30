import { config } from "dotenv";
import { createUploadthing, type FileRouter, UTApi } from "uploadthing/server";

config()

export const utapi = new UTApi({
  apiKey: process.env.UPLOADTHING_SECRET as string
});

const f = createUploadthing();

export const uploadRouter = {
  videoAndImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 4, },
  }).onUploadComplete((data) => {
    console.log("upload completed", data);
  }),
  categories: f({
    image: { maxFileSize: "4MB", maxFileCount: 6, },
  }).onUploadComplete((data) => {
    console.log("upload completed", data);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;