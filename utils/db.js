import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

const connectdb = async () => {
  try {
    const Connection = await mongoose.connect(uri, {
      writeConcern: { w: "majority" },
    });
    console.log("Mongodb connected: ", Connection.connection.host);
  } catch (error) {
    console.log("Mongodb connection error: ", error);
    process.exit(1);
  }
};

export default connectdb;
