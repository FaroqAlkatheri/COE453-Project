const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const uri = 'mongodb+srv://abdulrahmansu10:x1oIn3AtyHyaCfVz@cluster0.oi9efuz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const databaseName = 'security_incidents';
const collectionName = 'incidents';


const corsOptions = {
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

// Enable CORS for all routes
app.use(cors(corsOptions));


async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

app.get('/devices/:deviceId/incidents/:incidentType', async (req, res) => {
  try {
    const { deviceId, incidentType } = req.params;
    
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);
    
    const query = {
      deviceId: deviceId,
      'report.detected_objects.class_name': incidentType
    };
    
    const incidents = await collection.find(query).toArray();
    
    res.json(incidents);
  } catch (error) {
    console.error('Error retrieving incidents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function startServer() {
  await connectToDatabase();
  
  const port = 8080;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();