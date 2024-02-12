import express, { Router } from 'express';
import connection from '../Connection/Connection.js';
import {authorize} from '../User/Authorization.js';

const router = express();
router.use((req,res,next)=>{
    next();
});

router.post('/postRecruiters' , async(req,res)=>{
    const { name , company, email , message } = req.body ;
    const datetime = new Date();
    try{    
        const query = 'INSERT INTO recruiter (name, company, email, message, DateTime) VALUES (?, ?, ?, ?, ?)';
        const [result] = await connection.promise().execute(query, [name ,company, email , message , datetime]);
        console.log(result);

        if (result.affectedRows === 1) {
            return res.status(200).json({ message: "Successfully inserted in the database" });
       } else {
           return res.status(401).json({ message: "Some error occurred while inserting." });
      }

    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error });
    }
});

router.get('/getRecruiters',authorize, async(req,res)=>{
    console.log("hi");
    try {
        const query = 'select * from recruiter';
        const [result] = await connection.promise().execute(query, [1]); 
        console.log({result});
        res.status(200).json({ status: 'success', data: result, message: 'Successfully fetched recruiter' });
    } catch (err) {
        console.error(err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
})

export default router ;