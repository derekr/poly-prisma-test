import { PrismaClient, type FilePdf, type FileImage } from "@prisma/client";

const db = new PrismaClient().$extends({
  result: {
    file: {
      meta: {
        needs: { id: true, type: true },
        compute(file) {
          return () => {
            if (file.type === "pdf") {
              return db.filePdf.findUnique({ where: { id: file.id } });
            }

            if (file.type === "image") {
              return db.fileImage.findUnique({ where: { id: file.id } });
            }

            return null;
          };
        },
      },
    },
  },
});

async function main() {
  const files = await db.file.findMany();
  console.log(
    await Promise.all(
      files.map(async (file) => ({
        ...file,
        meta: await file.meta(),
      }))
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
