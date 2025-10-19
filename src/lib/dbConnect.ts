import mongoose from "mongoose";

// Connection object type
type ConnectionObject = {
  isConnected?: number;
};

// Initialize connection object
const connection: ConnectionObject = {};

// Database connection function that returns a Promise
async function dbConnect(): Promise<void> {
  // Check if already connected
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    // Attempt database connection
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

    connection.isConnected = db.connections[0].readyState;
    console.log(db.connections);

    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed: ", error);
    process.exit(1);
  }
}

export default dbConnect;
