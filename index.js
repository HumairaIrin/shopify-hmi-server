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

        app.get('/user/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.accountType === 'buyer' })
        })

        app.get('/user/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.accountType === 'seller' })
        })

        app.get('/myProducts', async (req, res) => {
            const userEmail = req.query.email;
            const query = { sellersEmail: userEmail }
            const myProducts = await productsCollection.find(query).toArray();
            res.send(myProducts)
        })

        app.get('/products/:categoryName', async (req, res) => {
            const name = req.params.categoryName;
            const query = { categoryName: name };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        app.get('/users/buyers', async (req, res) => {
            const type = req.query.type;
            const query = { accountType: type };
            const buyers = await usersCollection.find(query).toArray();
            res.send(buyers);
        })

        app.get('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.accountType === 'admin' });
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
                return res.send({ message })
            }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
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