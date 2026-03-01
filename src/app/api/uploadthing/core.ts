import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();
const utapi = new UTApi({
  token:
    process.env.UPLOADTHING_TOKEN ||
    process.env.UPLOADTHING_SECRET ||
    process.env.UPLOADTHING_KEY,
});

const requireSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
};

export const uploadRouter = {
  avatar: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await requireSession();
      return { userId: session.user.id, role: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { id: metadata.userId },
        data: { image: file.url },
      });

      return { uploadedBy: metadata.userId };
    }),
  messageAttachment: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    "application/pdf": { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await requireSession();
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const uploadFile = file as { name?: string; type?: string };
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        key: file.key,
        name: uploadFile.name,
        type: uploadFile.type,
      };
    }),
  credentialDocument: f({
    "application/pdf": { maxFileSize: "8MB", maxFileCount: 1 },
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await requireSession();
      if (session.user.role !== "PSYCHOLOGIST") {
        throw new Error("Forbidden");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await utapi.updateACL(file.key, "private");
      await prisma.psychologist.update({
        where: { userId: metadata.userId },
        data: {
          credentialDocumentUrl: file.url,
          credentialDocumentKey: file.key,
        },
      });

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
