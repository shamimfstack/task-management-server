const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// creating app using express
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        // 'https://task-management-shamimfstack.web.app/',
        // 'https://task-management-shamimfstack.firebaseapp.com/'
  
    ],
    credentials: true
  }))
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.24pgglg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("taskManagement").collection("users");
    const taskCollection = client.db("taskManagement").collection("tasks");

    // user related api
    app.get("/users", async(req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.post("/users", async(req, res) => {
        const user = req.body;

        const query = { email: user.email}
        const existingUser = await userCollection.findOne(query)
        if(existingUser) {
            return res.send({message: "User already exist", insertedId: null})
        }
        const result = await userCollection.insertOne(user)
        res.send(result);

    })


    // tasks related api
    // app.get("/tasks", async(req, res) => {
    //   const email = req.query.email;
    //   // let query = "";
    //   const query = { email: email}
    //   const result = await taskCollection.find(query).toArray();
    //   res.send(result);
    // })
    app.get("/tasks", async(req, res) => {
      // const email = req.query.email;
      // let query = "";
      // const query = { email: email}
      const result = await taskCollection.find().toArray();
      res.send(result);
    })

    app.get("/tasks/:id", async(req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = {_id: new ObjectId(id)}
      const result = await taskCollection.findOne(query);
      res.send(result);
    })

    app.post("/tasks", async(req, res) => {
      const newTasks = req.body;
      const result = await taskCollection.insertOne(newTasks);
      res.send(result);
    })

    app.put("/tasks/:id", async(req, res) => {
      const id = req.params.id;
      // console.log(updatedTask);
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updatedTask = req.body;
      const task = {
        $set: {
          title: updatedTask.title,
          description: updatedTask.description,
          dueDate: updatedTask.dueDate
        }
      };
      const result = await taskCollection.updateOne(filter, task, options)
      res.send(result);
    })

    app.delete("/tasks/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await taskCollection.deleteOne(query)
      res.send(result);
    })





    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Hello, OK")
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
