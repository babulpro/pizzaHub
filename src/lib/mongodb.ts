import { MongoClient, Db } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  "mongodb://PizzaHub:XJBqKeKG0yqkv6Vh@ac-yv7g1rx-shard-00-00.ai4dcx0.mongodb.net:27017,ac-yv7g1rx-shard-00-01.ai4dcx0.mongodb.net:27017,ac-yv7g1rx-shard-00-02.ai4dcx0.mongodb.net:27017/PizzaHub?ssl=true&replicaSet=atlas-uh0pmv-shard-0&authSource=admin";
const dbName = process.env.DB_NAME || "PizzaHub";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  console.warn("MONGODB_URI is not set in environment variables");
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is required to connect to the database");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getDb(): Promise<Db> {
  const c = await getMongoClient();
  return c.db(dbName);
}
