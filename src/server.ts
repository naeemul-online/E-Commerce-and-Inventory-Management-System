import { Server } from "http";
import app from "./app";
import config from "./config";
import prisma from "./shared/prisma";

async function bootstrap() {
  // This variable will hold our server instance
  let server: Server;

  try {
    // Seed super admin
    // await seedSuperAdmin();
    console.log("⏳ Connecting to the database...");
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    // Start the server
    server = app.listen(config.port, () => {
      console.log(`🚀 Server is running on http://localhost:${config.port}`);
    });

    // Function to gracefully shut down the server
    const exitHandler = () => {
      if (server) {
        server.close(async () => {
          await prisma.$disconnect();
          console.log("Server closed gracefully.");
          process.exit(1); // Exit with a failure code
        });
      } else {
        process.exit(1);
      }
    };

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (error) => {
      console.log(
        "Unhandled Rejection is detected, we are closing our server...",
      );
      if (server) {
        server.close(() => {
          console.log(error);
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Error during server startup:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
