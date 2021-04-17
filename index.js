const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require("mongodb").ObjectID;
require('dotenv').config()




const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;
const uri =` mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ntakd.mongodb.net/${process.env.DB_USER}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("securityServices").collection("services");
    const adminCollection = client.db("securityServices").collection("admins");
    const hiredServiceCollection = client.db("securityServices").collection("hiredServices");
    const reviewCollection = client.db("securityServices").collection("reviews");
    const statusCollection = client.db("securityServices").collection("serviceStatus");

    app.post('/addAdmin', (req, res) => {
        const admin = req.body;
        adminCollection.insertOne(admin)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
            .catch(err=>console.log(err))
    });

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        const price = req.body.price
        const newImg = file.data;
        const encImg = newImg.toString('base64');
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ name, description, image ,price})
            .then(result => {
                res.send(result.insertedCount > 0);
            }).catch(err=>console.log(err))
    })
    app.post('/addHiredService', (req, res) => {
        const hiredService = req.body;
        hiredServiceCollection.insertOne(hiredService)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
            .catch(err=>console.log(err))
    });

    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
            .catch(err=>console.log(err))
    });
    app.post('/addServiceStatus', (req, res) => {
        const status = req.body;
        statusCollection.insertOne(status)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
            .catch(err=>console.log(err))
    });
    app.get('/getServiceStatus', (req, res) => {
        statusCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.get('/getServices', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.get('/getReviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.get('/getService/:id', (req, res) => {
      
        serviceCollection.find({_id:ObjectID(req.params.id)})
            .toArray((err, result) => {
                res.send(result[0]);
                
            })
    })

    app.post('/hiredServices', (req, res) => {
        const email = req.body.email;
        console.log(email)
     if(email){
        adminCollection.find({email: email })
        .toArray((err, doctors) => {

            if (doctors.length === 0) {
               hiredServiceCollection.find({email:email})
                .toArray((err, documents) => {
                    res.send(documents);
                })
            }else{
                hiredServiceCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
            }
        })
     }
    })



    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        console.log(email)
        adminCollection.find({email: email })
            .toArray((err, doctors) => {
                console.log(doctors)
                res.send(doctors.length > 0);
            })
    })
    app.delete("/delete/:id", (req, res) => {
        serviceCollection
          .deleteOne({ _id: ObjectID(req.params.id) })
          .then((result) => {
            res.send(result.deletedCount > 0);
          });
      });
 
});


app.listen(process.env.PORT || port)