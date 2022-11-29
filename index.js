const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tgametl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const categoriesCollection = client.db('resaleMarket').collection('categories');
    const productsCollection = client.db('resaleMarket').collection('allProducts');
    const bookingsCollection = client.db('resaleMarket').collection('bookings');
    const usersCollection = client.db('resaleMarket').collection('users');

    try {
        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories);
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { categoryId: id };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const query = {
                userName: booking.userName,
                productName: booking.productName
            };
            const alreadyBooked = await bookingsCollection.find(query).toArray();
            if (alreadyBooked.length) {
                const message = 'You have already booked this product';
                console.log('already booked')
                return res.send({ message })
            }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })
    }
    finally { }
}
run().catch(error => { console.log(error) });


app.get('/', (req, res) => {
    res.send('resale market server is running');
})

app.listen(port, () => {
    console.log(`resale server running on port ${port}`);
})