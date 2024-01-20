const express = require("express");
const app = express();
const port = process.env.PORT || 5500;
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
require("dotenv").config();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());

const { MongoClient } = require("mongodb");
const res = require("express/lib/response");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.caruz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const memberCollection = client.db("association").collection("user");
  const amountCollection = client.db("association").collection("amount");
  const adminCollection = client.db("association").collection("admin");
  const expenseCollection = client.db("association").collection("expense");
  const benefitCollection = client.db("association").collection("benefit");
  // this is for madrasah collections
  const dmCollection = client.db("madrasah").collection("donation");
  const dmExpenseCollection = client.db("madrasah").collection("dmExpense");
  const dmCashierCollection = client.db("madrasah").collection("cashier");
  const dmContentCollection = client.db("madrasah").collection("content");

  app.post("/addMember", async (req, res) => {
    const { name, email, phone, address, date, donation } = req.body;
    await memberCollection
      .insertOne({ name, email, phone, address, date, donation })
      .then((result) => {
        res.status(200);
        res.send(result.acknowledged === true);
      })
      .catch((err) => console.log(err));
  });

  app.get("/getAllUsers", (req, res) => {
    memberCollection.find({}).toArray((err, documents) => {
      if (err) {
        res.status(400).send(" message: Server error Occurs");
      }
      res.send(documents);
    });
  });

  app.post("/addAmount", (req, res) => {
    const { name, email, amount, month, total, voucher, date } = req.body;
    amountCollection
      .insertOne({
        name: name,
        email: email,
        voucher: voucher,
        amount: amount,
        total: total,
        month: month,
        date: date,
      })
      .then((result) => {
        res.send(result.acknowledged === true);
      });
  });

  app.get("/allAmount", (req, res) => {
    amountCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.get("/allAmount/:id", async (req, res) => {
    const query = { _id: ObjectId(req.params.id) };
    const cursor = amountCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  });
  app.patch("/allAmount/:id", (req, res) => {
    const id = req.params.id;
    const { name, email, voucher, amount, total, month, date, updatedAt } =
      req.body;
    amountCollection
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            name: name,
            email: email,
            voucher: voucher,
            amount: amount,
            total: total,
            month: month,
            date: date,
            updatedAt: updatedAt,
          },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });

  app.post("/addAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.insertOne({ email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin?.length > 0);
    });
  });

  app.get("/getUserData/:email", (req, res) => {
    const email = req.params.email;
    amountCollection.find({ email: email }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/userAmount/:email", (req, res) => {
    const email = req.params.email;
    amountCollection.find({ email: email }).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.delete("/amountDelete/:id", (req, res) => {
    const id = req.params.id;
    amountCollection.deleteOne({ _id: ObjectId(id) }).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });

  app.delete("/userDelete/:id", (req, res) => {
    const id = req.params.id;
    memberCollection.deleteOne({ _id: ObjectId(id) }).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });

  app.get("/getMember/:id", (req, res) => {
    const id = req.params.id;
    memberCollection.find({ _id: ObjectId(id) }).toArray((err, member) => {
      res.send(member);
    });
  });

  app.patch("/updateUser/:id", (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    const { name, email, phone, address, date, donation } = req.body;
    memberCollection
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            name: name,
            email: email,
            phone: phone,
            address: address,
            date: date,
            donation: donation,
          },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });

  console.log("db connected");

  app.post("/addExpendsAmount", (req, res) => {
    const { name, voucher, amount, date } = req.body;
    expenseCollection
      .insertOne({ name: name, voucher: voucher, amount: amount, date: date })
      .then((result) => {
        console.log("expense : ", result);
        res.send(result.acknowledged === true);
      });
  });

  app.get("/expenseMoney", (req, res) => {
    expenseCollection.find({}).toArray((err, expenseArray) => {
      res.send(expenseArray);
    });
  });

  app.post("/addBenefitAmount", (req, res) => {
    const { name, voucher, amount, date } = req.body;
    benefitCollection
      .insertOne({ name, voucher, amount, date })
      .then((result) => {
        console.log("benefit : ", result);
        res.send(result.acknowledged === true);
      });
  });

  app.get("/benefitMoney", (req, res) => {
    benefitCollection.find({}).toArray((err, benefitArray) => {
      res.send(benefitArray);
    });
  });

  app.delete("/deleteBenefitMoney/:id", (req, res) => {
    benefitCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        if (result.deletedCount > 0) {
          res.status(200).json({
            success: true,
            message: "You have deleted successfully",
          });
        }
      });
  });

  // dinina madrasah information
  app.post("/collection", async (req, res) => {
    const result = await dmCollection.insertOne({
      ...req.body,
      year: Number(req.body.year),
      amount: Number(req.body.amount),
    });
    if (result.acknowledged === true) {
      res.status(201).send({
        success: true,
        statusCode: 201,
      });
    }
  });

  // GET all donar and search by their name,  phone, address, month, year, etc;
  app.get("/search", (req, res) => {
    const fullYear = new Date().getFullYear();
    const keyword = req.query.keyword || "";
    const year = Number(req.query.year) || fullYear;
    const searchExp = new RegExp(".*" + keyword + ".*", "i");
    let filter = {
      year: { $eq: year },
      $or: [
        { name: { $regex: searchExp } },
        { phone: { $regex: searchExp } },
        { address: { $regex: searchExp } },
        { month: { $regex: searchExp } },
      ],
    };
    dmCollection.find(filter).toArray((err, documents) => {
      if (err) {
        res.status(400).send(" message: Server error Occurs");
      }

      res.send(documents);
    });
  });

  // GET Single donar by ID;
  app.get("/selected/:id", async (req, res) => {
    const result = await dmCollection.findOne({ _id: ObjectId(req.params.id) });
    res.status(200).json({ result });
  });

  // Update single donar by their ID;
  app.put("/update/:id", (req, res) => {
    dmCollection
      .updateOne({ _id: ObjectId(req.params.id) }, { $set: req.body })
      .then((result) => {
        if (result.modifiedCount > 0) {
          res.status(200).json({
            success: true,
            message: "Updated successfully",
          });
        }
      });
  });

  // Delete nay donar by ID;
  app.delete("/delete/:id", (req, res) => {
    dmCollection.deleteOne({ _id: ObjectId(req.params.id) }).then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({
          success: true,
          message: "You have deleted successfully",
        });
      }
    });
  });

  //GET all Donar;
  app.get("/all-donars", (req, res) => {
    dmCollection.find({}).toArray((err, documents) => {
      if (err) {
        res.status(400).send(" message: Server error Occurs");
      }
      res.send(documents);
    });
  });

  // Adding expense money;
  app.post("/dmExpended", (req, res) => {
    dmExpenseCollection
      .insertOne({
        ...req.body,
        amount: Number(req.body.amount),
        voucher: Number(req.body.voucher),
      })
      .then((result) => {
        res.send(result.acknowledged === true);
      });
  });

  // GET all expense
  app.get("/dmExpenseMoney", (req, res) => {
    dmExpenseCollection.find({}).toArray((err, expenseArray) => {
      res.send(expenseArray);
    });
  });

  // GET Single expense by ID;
  app.get("/single-expense/:id", async (req, res) => {
    const result = await dmExpenseCollection.findOne({
      _id: ObjectId(req.params.id),
    });
    res.status(200).json({ result });
  });

  // Update single donar by their ID;
  app.put("/update-expense/:id", (req, res) => {
    dmExpenseCollection
      .updateOne({ _id: ObjectId(req.params.id) }, { $set: req.body })
      .then((result) => {
        if (result.modifiedCount > 0) {
          res.status(200).json({
            success: true,
            message: "Updated successfully",
          });
        }
      });
  });

  // delete expense amount
  app.delete("/dmExpense-delete/:id", (req, res) => {
    dmExpenseCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        if (result.deletedCount > 0) {
          res.status(200).json({
            success: true,
            message: "You have deleted successfully",
          });
        }
      });
  });

  // adding cashier
  app.post("/addCashier", (req, res) => {
    const email = req.body.email;
    dmCashierCollection.insertOne({ email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // check isCashier
  app.get("/isCashier/:email", (req, res) => {
    const email = req.params.email;
    dmCashierCollection.find({ email: email }).toArray((err, cashier) => {
      res.send(cashier?.length > 0);
    });
  });

  // adding content
  app.post("/add-content", (req, res) => {
    dmContentCollection.insertOne(req.body).then((result) => {
      res.send(result.acknowledged === true);
    });
  });

  // GET all contents
  app.get("/all-contents", (req, res) => {
    dmContentCollection.find({}).toArray((err, expenseArray) => {
      res.send(expenseArray);
    });
  });

  // GET Single content by ID;
  app.get("/single-content/:id", async (req, res) => {
    const result = await dmContentCollection.findOne({
      _id: ObjectId(req.params.id),
    });
    res.status(200).json({ result });
  });

  // updating content
  app.put("/update-content/:id", (req, res) => {
    dmContentCollection
      .updateOne({ _id: ObjectId(req.params.id) }, { $set: req.body })
      .then((result) => {
        if (result.modifiedCount > 0) {
          res.status(200).json({
            success: true,
            message: "Updated successfully",
          });
        }
      });
  });

  // delete content
  app.delete("/delete-content/:id", (req, res) => {
    dmContentCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        if (result.deletedCount > 0) {
          res.status(200).json({
            success: true,
            message: "You have deleted successfully",
          });
        }
      });
  });
});

app.get("/", (req, res) => {
  res.json({ massage: "Ya Allah , forgive me" });
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
