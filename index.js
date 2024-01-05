const express = require('express');
const app = express();
const cors = require('cors');
const  jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_Pass}@cluster0.dygd3dy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



const userCollection = client.db('bistroDb').collection('users');
const menuCollection = client.db('bistroDb').collection('menu');
const reviewCollection = client.db('bistroDb').collection('reviews');
const cartCollection = client.db('bistroDb').collection('carts');



// users related api
app.get('/users', async (req, res) => {
    const result = await userCollection.find().toArray();
    res.send(result);
})

app.post('/users', async (req, res) => {
    const user = req.body;
    // insert email if user doesn't exists:
    // you can do this many ways (1. email unique 2. upsert 3. simple checking)
    const query = { email: user.email };
    const existingUser = await userCollection.findOne(query);
    if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null });
    }
    const result = await userCollection.insertOne(user);
    res.send(result);
})

app.patch('/users/admin/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
        $set: {
            role: 'admin'
        }
    }
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send(result);
})

app.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await userCollection.deleteOne(query);
    res.send(result);
})

// menu api
app.get('/menu', async (req, res) => {
    const result = await menuCollection.find().toArray();
    res.send(result);
})

// reviews api
app.get('/reviews', async (req, res) => {
    const result = await reviewCollection.find().toArray();
    res.send(result);
})

// carts collection
app.get('/carts', async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const result = await cartCollection.find(query).toArray();
    res.send(result);
})

app.post('/carts', async (req, res) => {
    const cartItem = req.body;
    const result = await cartCollection.insertOne(cartItem);
    res.send(result);
})

app.delete('/carts/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await cartCollection.deleteOne(query);
    res.send(result);
})


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Boss fled to the United States')
})

app.listen(port, () => {
    console.log(`Bistro Boss is running on port ${port}`);
})