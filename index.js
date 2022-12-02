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

        // checking users accountType is buyer or not
        app.get('/user/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.accountType === 'buyer' })
        })

        // checking users accountType is seller or not
        app.get('/user/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.accountType === 'seller' })
        })

        // getting sellers own products
        app.get('/myProducts', async (req, res) => {
            const userEmail = req.query.email;
            const query = { sellersEmail: userEmail }
            const myProducts = await productsCollection.find(query).toArray();
            res.send(myProducts)
        })

        // reading the category products by searching with categoryName
        app.get('/products/:categoryName', async (req, res) => {
            const name = req.params.categoryName;
            const query = { categoryName: name };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        // taking all the buyers info to set on admin's dashboard
        app.get('/users/buyers', async (req, res) => {
            const type = req.query.type;
            const query = { accountType: type };
            const buyers = await usersCollection.find(query).toArray();
            res.send(buyers);
        })

        // taking all the sellers info to set on admin's dashboard
        app.get('/users/sellers', async (req, res) => {
            const type = req.query.type;
            const query = { accountType: type };
            const sellers = await usersCollection.find(query).toArray();
            res.send(sellers);
        })
        // checking if the user accountType is admin or not 
        app.get('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.accountType === 'admin' });
        })

        // checking seller is verified or not
        app.get('/user/seller/status/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isVerified: user?.accountStatus === 'verified' });
        })

        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        // taking booking from buyer and inserting in the bookingColection
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

        // adding product to db(added by seller)
        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })

        //updating seller verification status 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const user = req.body;
            const option = { upsert: true };
            const updatedUser = {
                $set: {
                    accountStatus: user.accountStatus
                }
            }
            const result = await usersCollection.updateOne(filter, updatedUser, option);
            res.send(result);
        })

        // deleting user from db (deleted by admin)
        app.delete('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = await usersCollection.deleteOne(query);
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