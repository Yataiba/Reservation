import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = { useNewUrlParser: true, useUnifiedTopology: true };

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db("ramadan_reservations");
  return { db, client };
}
