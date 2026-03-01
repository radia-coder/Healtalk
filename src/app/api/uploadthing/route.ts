import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "./core";

// createRouteHandler automatically reads UPLOADTHING_SECRET from environment variables
export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});
