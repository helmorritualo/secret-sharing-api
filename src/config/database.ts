import mongoose from "mongoose";
import { MONGO_URL, NODE_ENV } from "./env";

const connectionToDatabase = async (): Promise<void> => {
  try {
    if (!MONGO_URL) {
      throw new Error("Database is not defined in env variable");
    }

    await mongoose.connect(MONGO_URL);

    if (NODE_ENV === "development") {
      console.log("Connected to database successfully!");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Database connection failed: ${error.message}`);

      if (NODE_ENV === "development") {
        console.error(error.stack);
      }
    } else {
      console.error("Unknown database connection error");
    }
    process.exit(1);
  }
};

export default connectionToDatabase;
