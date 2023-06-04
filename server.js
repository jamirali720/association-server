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
  const expenseCollection = client.db("association").collection("expense");
  const fpCollection = client.db("fp").collection("method");

   app.post('/addMember', async(req, res)=> {       
       const {name,email, phone, address, date, donation} = req.body;
       await memberCollection.insertOne({name, email, phone, address, date, donation})
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
   app.get('/allAmount/:id', async(req, res) => {              
        const query =  {_id: ObjectId( req.params.id)} 
        const cursor =  amountCollection.find(query);
        const result  = await cursor.toArray();
        res.send(result)
    
   })
   app.patch('/allAmount/:id', (req, res) => {      
       const id = req.params.id;    
       const {name, email, voucher, amount, total, month, date, updatedAt} = req.body;    
       amountCollection.updateOne({_id: ObjectId(id)}, {$set: {name: name, email: email, voucher: voucher,amount: amount, total:total, month: month, date: date, updatedAt: updatedAt}}).then(result => {        
           res.send(result.modifiedCount > 0)           
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
    app.delete('/amountDelete/:id', (req, res) => {
        const id = req.params.id;
        amountCollection.deleteOne({_id: ObjectId(id)}).then(result => {
            res.send(result.deletedCount > 0)           
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
        console.log(req.body)
        const {name, email, phone, address, date, donation}= req.body;
        memberCollection.updateOne({_id: ObjectId(id)}, {$set: { name:name, email:email, phone:phone, address:address, date:date, donation:donation}})
        .then(result => {
            res.send(result.modifiedCount > 0);           
        })       
    })
    

    
   console.log('db connected')

   app.post('/addExpendsAmount', (req, res) => {
        const {name, voucher, amount,  date} = req.body;
        expenseCollection.insertOne({name:name, voucher:voucher, amount:amount, date: date})
        .then(result => {
            console.log("expense : ", result)
            res.send(result.acknowledged === true);
        })
   })

   app.get('/expenseMoney', (req, res) => {
        expenseCollection.find({}).toArray((err, expenseArray) => {
           res.send(expenseArray)
       })
   })

   // family planning information
   app.post("/office", async(req, res) => {
        const result = await fpCollection.insertOne(req.body);
        if(result.acknowledged === true) {
            res.status(201).send({
                success: true,
                statusCode: 201,

            })
        }
    })

    app.get('/office', (req, res) => {
        fpCollection.find({}).toArray((err, documents ) => {
            if(err ) {
                res.status(400).send(' message: Server error Occurs')
            }

            res.send(documents);
        })
   })

    app.get('/selected/:id', async(req, res) => {
       const result = await fpCollection.findOne({_id: ObjectId(req.params.id)})
       res.status(200).json({result})
   })


    app.patch('/update/:id', (req, res) => {
        fpCollection.updateOne({_id: ObjectId(req.params.id)},  {$set: req.body})
        .then(result => {
            if(result.modifiedCount > 0) {
                res.status(200).json({
                    success: true,
                    message: 'Updated successfully'
                })
            }
        })
   })

    app.delete('/delete/:id', (req, res) => {        
        fpCollection.deleteOne({_id: ObjectId(req.params.id)})
        .then(result => {              
            if(result.deletedCount > 0) {
                res.status(200).json({
                    success: true,
                    message: 'You have deleted successfully'
                })
               
            }
        })
   })

   
    app.get('/filter', (req, res) => {       
        const name = (req.query.name === "" || req.query.name === "All") ? {} :{name:{$regex: `${req.query.name}`, $options: "i"}}; 
        const union =  (req.query.union == "") ? {} : {union:{$regex: `${req.query.union}`, $options: "i"}}; 
        const unit = (req.query.unit === "" || req.query.unit === "All") ? {} : {unit:{$regex: `${req.query.unit}`, $options: "i"}}; 
        const year = (req.query.year === "" || req.query.year === "All" )  ? {} : {year:{$eq: `${req.query.year}`}}; 
        const month = (req.query.month === "" || req.query.month === "All") ? {} : {month:{$regex: `${req.query.month}`, $options: "i"}} ; 
       
      
        fpCollection.find({
            $and: [name, union, unit, year, month]
        }).toArray((err, documents ) => {
            if(err ) {
                res.status(400).send(' message: Server error Occurs')
            }
            res.send(documents);
        })      
       
   })



})

app.get('/', (req, res) => {
    res.json({massage: 'Ya Allah , forgive me'})
})

app.listen(port, () => {
    console.log(`server is running at port ${port}`)
})



