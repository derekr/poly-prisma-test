import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function makeFile(type: "pdf" | "image") {
  return db.$transaction(async (tx) => {
    const name = faker.system.commonFileName(type === "pdf" ? "pdf" : "png");
    const file = await tx.file.create({
      data: {
        name,
        url: `https://example.com/${name}`,
        size: 1000,
        type,
        fileType: type === "pdf" ? "application/pdf" : "image/png",
      },
    });

    return type === "pdf"
      ? tx.filePdf.create({
        data: {
          id: file.id,
          numPages: faker.datatype.number({ min: 1, max: 100 }),
        },
      })
      : tx.fileImage.create({
        data: {
          id: file.id,
          width: faker.datatype.number({ min: 1, max: 640 }),
          height: faker.datatype.number({ min: 1, max: 480 }),
        },
      });
  });
}

const TYPES = ["pdf", "image"] as const;

async function main() {
  await Promise.all(
    Array(10)
      .fill(null)
      .map(() => makeFile(faker.helpers.arrayElement(TYPES)))
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
