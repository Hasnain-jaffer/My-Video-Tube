import dns from 'dns'; // Set DNS servers to Google's public DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']); // add this line to set the DNS servers to Google's public DNS servers
import dotenv from 'dotenv';
import connectDB from './db/dbconnect.js';
import app from './app.js';

dotenv.config({
    path: './.env'
});

connectDB()
.then(() => {
    app.on('error', (err) => {
        console.error('Error starting the server:', err);
        process.exit(1);
})
   app.listen(process.env.PORT || 8001, () => {
    console.log(`Server is running on port ${process.env.PORT || 8001}`);
})
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
})
