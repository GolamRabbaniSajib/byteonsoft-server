require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const port = process.env.PORT || 5000;
const app = express();
// middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174", "https://byteonsoft-c3d7a.web.app"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yy331.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // collections

    const projectCollection = client.db("byteonsoft").collection("pojects");
    const serviceCollection = client.db("byteonsoft").collection("services");
    const reviewCollection = client.db("byteonsoft").collection("reviews");
    const memberCollection = client.db("byteonsoft").collection("members");
    const blogCollection = client.db("byteonsoft").collection("blogs");

    // Generate jwt token
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // for projects

    // post
    app.post("/projects", verifyToken, async (req, res) => {
      const project = req.body;
      const result = await projectCollection.insertOne(project);
      res.send(result);
    });

    // get all projects
    app.get("/all-projects", async (req, res) => {
      const result = await projectCollection.find().toArray();
      res.send(result);
    });

    // get 8 projects
    app.get("/recent-projects", async (req, res) => {
      const result = await projectCollection.find().sort({ createdAt: -1 }).limit(8).toArray();
      res.send(result);
    });

    // get a project data by id from db
    
        app.get("/project/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await projectCollection.findOne(query);
          res.send(result);
        });
    
        // update a parcel using put
    
        app.put("/update-parcel/:id", verifyToken, async (req, res) => {
          const id = req.params.id;
          const parcelData = req.body;
          const updated = {
            $set: parcelData,
          };
          const option = { upsert: true };
          const filter = { _id: new ObjectId(id) };
          const result = await parcelCollection.updateOne(filter, updated, option);
          res.send(result);
        });


    // for members

    // post
    app.post("/members", verifyToken, async (req, res) => {
      const member = req.body;
      const result = await memberCollection.insertOne(member);
      res.send(result);
    });

    // get all members
    app.get("/all-members", async (req, res) => {
      const result = await memberCollection.find().toArray();
      res.send(result);
    });


    // for blogs

    // post
    app.post("/blogs", verifyToken, async (req, res) => {
      const blog = req.body;
      const result = await blogCollection.insertOne(blog);
      res.send(result);
    });

    // get all blogs
    app.get("/all-blogs", async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    });


    // get a blog data by id from db
    
    app.get("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.findOne(query);
      res.send(result);
    });


    // for reviews

    // post
    app.post("/reviews", verifyToken, async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // get all reviews
    app.get("/all-reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });



    // for services

    // post
    app.post("/services", verifyToken, async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    // get all services
    app.get("/all-services", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from plantNet Server..");
});

app.listen(port, () => {
  console.log(`plantNet is running on port ${port}`);
});
