import "../env.js";
import { dataFilePath, getDefaultData, writeData } from "../data/dataStore.js";

await writeData(getDefaultData());

const target = process.env.ECCLESIAOS_DATA_PROVIDER === "prisma" ? "PostgreSQL via Prisma" : dataFilePath;
console.log(`Development data reset at ${target}`);
