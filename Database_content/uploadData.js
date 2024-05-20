const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb+srv://abdulrahmansu10:x1oIn3AtyHyaCfVz@cluster0.oi9efuz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const databaseName = 'security_incidents';
const collectionName = 'incidents';

const directoryPath = path.join(__dirname);

async function uploadData() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      if (path.extname(file) === '.json') {
        const filePath = path.join(directoryPath, file);
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const parsedContent = JSON.parse(htmlContent);
        const deviceId = "device0" //`device${path.basename(file, '.json').split('_').pop()}`;

        const document = {
          deviceId: deviceId,
          filename: file,
          report: parsedContent,
        };

        await collection.insertOne(document);
        console.log(`Uploaded ${file} to MongoDB Atlas`);
      }
    }
  } catch (error) {
    console.error('Error uploading data:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }
}

uploadData();