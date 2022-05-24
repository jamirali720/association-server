const express = require('express');
const app = express();
const port  = process.env.PORT || 5500;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
require('dotenv').config();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.json());
app.use(fileUpload());

const { MongoClient } = require('mongodb');
const res = require('express/lib/response');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.caruz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const memberCollection = client.db("association").collection("user");
  const amountCollection = client.db("association").collection("amount");
  const adminCollection = client.db("association").collection("admin");
   app.post('/addMember', (req, res)=> {
       const {name,email, phone, address, date} = req.body;
       memberCollection.insertOne({name, email, phone, address, date})
       .then(result => {       
            res.status(200)
            res.send(result.acknowledged === true)
            
       })
       .catch(err => console.log(err))
   })
   
   app.get('/getAllUsers', (req, res)=> {
       memberCollection.find({}).toArray((err, documents ) => {
           if(err ) {
               res.status(400).send(' message: Server error Occurs')
           }
        res.send(documents)
       })
       
   })

   app.post('/addAmount', (req, res) => {
        const {name, email, amount, month, total, voucher, date} = req.body;
        amountCollection.insertOne({name: name, email:email, voucher:voucher, amount: amount, total:total, month: month, date:date})
        .then(result => {           
            res.send(result.acknowledged === true)
        })
   })

   app.get('/allAmount', (req, res) => {
       amountCollection.find({}).toArray((err, documents) => {
           res.send(documents);
       })
   })

   app.post('/addAdmin', (req, res)=> {
       const email =  req.body.email;      
        adminCollection.insertOne({ email})
        .then(result => {
            res.send(result.insertedCount > 0);
        })
   })

   app.post('/isAdmin', (req, res) => {
       const email = req.body.email;
       adminCollection.find({ email: email})
       .toArray((err, admin) => {
           res.send(admin?.length > 0)
       })
   })

    app.get('/getUserData/:email', (req, res) => {
        const email = req.params.email;
        amountCollection.find({email: email}).toArray((err, documents) => {
            res.send(documents)
        })
     
    })

    app.get('/userAmount/:email', (req, res) => {
        const email = req.params.email;
        amountCollection.find({ email: email}).toArray((err, documents) => {
            res.send(documents)
        })    
    })

    app.delete('/userDelete/:id', (req, res) => {
        const id = req.params.id;        
        memberCollection.deleteOne({_id: ObjectId(id)}).then(result => {
            res.send(result.deletedCount > 0)           
        })
    })

    app.get('/getMember/:id', (req, res) => {
        const id = req.params.id;    
        memberCollection.find({_id: ObjectId(id)}).toArray((err, member) => {
            res.send(member)
        })
    })

    
    app.patch('/updateUser/:id', (req, res,)=> {
        const id = req.params.id;
        const {name, email, phone, address, date}= req.body;
        memberCollection.updateOne({_id: ObjectId(id)}, {$set: { name:name, email:email, phone:phone, address:address, date:date}})
        .then(result => {
            res.send(result.modifiedCount > 0);           
        })       
    })

    app.put('/changeUser/:id', (req, res)=> {
        const id = req.params.id;        
        const {name, email, phone, address, date}= req.body;
        memberCollection.updateOne({_id: ObjectId(id)}, {$set: {name:name, email:email, phone:phone, address:address, date:date}})
    })
   console.log('db connected')
});



app.get('/', (req, res) => {
    res.send('Ya Allah , forgive me')
})

app.listen(port, () => {
    console.log(`server is running at port ${port}`)
})



