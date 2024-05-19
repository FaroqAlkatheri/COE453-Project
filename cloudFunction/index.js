const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const uri = 'mongodb+srv://abdulrahmansu10:x1oIn3AtyHyaCfVz@cluster0.oi9efuz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const cors = require('cors');
const corsOptions = {
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

// Enable CORS for all routes
app.use(cors(corsOptions));


app.get('/devices/:deviceId/incidents', async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    await client.connect();
    const database = client.db('security_incidents');
    const collection = database.collection('incidents');
    const incidents = await collection.find({ deviceId: deviceId }).toArray(); // Filter by deviceId
    const incidentLinks = incidents.map(incident => ({
      filename: incident.filename,
      url: `/incidents/${incident.filename}`,
      report: incident.report // Include the report content
    }));
    res.status(200).json(incidentLinks);
  } catch (error) {
    console.error('Error retrieving incidents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

exports.getIncidentsByDevice = app;

