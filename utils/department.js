import express from 'express';
import cors from 'cors';
import project from './Projects/Project.js';
import user from './User/User.js';
import screen from './Screen/Screen.js';
import filter from './Fliters/Filters.js';
import otp from './Emails/Varification.js';
import bestFive from './BestFive/BestFive.js';
import recruiters from './Recruiter/Recruiter.js';
import stories from './Stories/Stories.js';
import { router } from './Emails/Emails.js'; 
import connection from './Connection/Connection.js';
import env from 'dotenv';
env.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/images/store', express.static('/Users/jyoti-alok/Desktop/Department/Backend/store'));



connection.connect((err) => {
    if (err) {throw err;}
    console.log("connected with database");
});

app.use('/project', project);
app.use('/user', user);
app.use('/screen', screen);
app.use('/filter', filter);
app.use('/story', stories);
app.use('/varification', otp);
app.use('/mail', router);
app.use('/bestFive' , bestFive);
app.use('/placement' ,recruiters);

app.listen(5000, () => {
    console.log(`http://localhost:5000`)
})



