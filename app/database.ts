import { MongoClient, ServerApiVersion } from "mongodb";
const uri = `mongodb+srv://0xleovido:${process.env.DB_PASSWORD}@cluster0.frk8brl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const dbClient = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true
	}
});

export async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await dbClient.connect();
		// Send a ping to confirm a successful connection
		await dbClient.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		await dbClient.close();
	}
}
