import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import upload from './Picture.js';
import connection from '../Connection/Connection.js';
import {authorize , authorizeStudent} from './Authorization.js';
const router = express();

router.use((req,res,next)=>{
      next();
})

router.post('/postUser', upload.single('image') ,async(req,res)=>{
    console.log({ 'data' : req.body});

    const {
        id, FirstName, MiddleName, LastName,
        Address, Semester, Email, Phone,
        PassingYear, Position, Course,
        Company, Linkdin, Sector, Password,
        ConfirmPassword, Role
    } = req.body;

    console.log(req.body);
    console.log(req.file);

    const new_image = req.file ? `/store/${req.file.filename}` : '';
    console.log({new_image});

    try {
        if (Password !== ConfirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const query = 'INSERT INTO UserProfile (id, FirstName, MiddleName, LastName, Address, Semester, Email, Phone, PassingYear, Position, Course, Company, Linkdin, Sector, Password, Image, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
        const [result] = await connection.promise().execute(query, [id, FirstName, MiddleName, LastName, Address, Semester, Email, Phone, PassingYear, Position, Course, Company, Linkdin, Sector, hashedPassword, new_image, Role]);
        console.log({result});

        
        if (result.affectedRows === 1 ) {
            return res.status(200).json({ message: "Successfully inserted User in database" });
        } else {
            return res.status(401).json({ message: "Some error occurred while inserting." });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error });
    }
});


router.post('/login', async (req,res)=>{
    console.log(req.body);
    try {
        let queryLogin;
        if(req.body.role === 'Admin'){
            queryLogin = 'SELECT * FROM adminTable WHERE email = ?';
        }else if(req.body.role === 'Alumni'){
            queryLogin = "SELECT * FROM UserProfile WHERE email = ? and Role = 'Alumni' ";
        }else if(req.body.role === 'Student'){
            queryLogin = "SELECT * FROM UserProfile WHERE email = ? and Role = 'Student' "; 
        }else if(req.body.role === 'Teacher'){
            queryLogin = "SELECT * FROM UserProfile WHERE email = ? and Role = 'Teacher' "; 
        }
        const [resultLogin] = await connection.promise().execute(queryLogin, [req.body.Email]);

        if (resultLogin.length === 0) {
            return res.status(401).json({ message: "Authentication failed. Invalid email or password or role" });
        }

        const user = resultLogin[0];
        console.log(user);
        const passwordMatch = await bcrypt.compare(req.body.password, user.Password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Authentication failed. Invalid email or password" });
        }

       let token ;
       if(req.body.role === 'Admin'){
             token = jwt.sign({ id : user.id , email: req.body.Email, role: req.body.role , Name : user.FirstName  + " " + user.MiddleName + " " + user.LastName  ,Phone : user.Phone  }, process.env.TOKEN );
       }else{
           token = jwt.sign({ id : user.id , email: user.Email, role: user.Role , Name : user.FirstName  + " " + user.MiddleName + " " + user.LastName , Address: user.Address , Semester : user.Semester ,Phone : user.Phone ,Image : user.Image }, process.env.TOKEN );
       }
        console.log({token});
        res.status(200).json({ token , message : "Successfully Logged in." , user});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});

router.get('/getUsers' , authorize ,async(req,res)=>{
    try{
        const query = 'SELECT * FROM UserProfile';
        const [result] = await connection.promise().execute(query);
        res.status(200).json({ 'data' : result , message : "Successfully fetched all Users"});

      }catch(err){
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
      }
});

router.get('/getUser/:id', authorize , async(req,res)=>{

    const {id} = req.params;
    console.log({id});
    try{
       const query = `SELECT * FROM UserProfile WHERE id = ${id};`;
       const [result] = await connection.promise().execute(query);
       res.status(200).json({ 'data' : result , message : `Successfully fetched user with id : ${id}`});    
    }catch(err){
           console.error(err);
            res.status(500).json({ Error: 'Internal server error' });
      }
});


router.delete('/deleteUser/:id', authorize , async(req,res)=>{

    const {id} = req.params;
    try{
       const query = `DELETE FROM UserProfile WHERE id = ${id};`;
       const [result] = await connection.promise().execute(query);
       res.status(200).json({ 'data' : result , message : `Successfully Delete user with id : ${id}`});    
    }catch(err){
           console.error(err);
            res.status(500).json({ Error: 'Internal server error' });
      }
});


router.put('/updateUser/:id', authorize, async (req, res) => {
    const { id } = req.params;
    const updated = req.body;
    console.log({id});
    console.log({updated});
    const newUpdated = {};

    for (const key in updated) {
        if (updated[key] !== null && updated[key] !== '') {
            newUpdated[key] = updated[key];
        }
    }

    try {
        let query = 'UPDATE UserProfile SET ';
        const values = [];

        for (const key in newUpdated) {
            query += `${key} = ?, `;
            values.push(newUpdated[key]);
        }
        query = query.slice(0, -2);
        query += ' WHERE id = ?';
        values.push(id);

        const [result] = await connection.promise().execute(query, values);
        console.log(result);
        res.status(200).json({ data: result, message: `Successfully updated user with id: ${id}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
    }
});


router.get('/getAlumni' ,async(req,res)=>{
    try{
        const query = 'SELECT * FROM UserProfile where Role = ?';
        const [result] = await connection.promise().execute(query, ['Alumni']);
        res.status(200).json({ 'data' : result , message : "Successfully fetched all Users"});
        
      }catch(err){
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
      }
});

router.get('/getStudents' ,async(req,res)=>{
    try{
        const query = 'SELECT * FROM UserProfile where Role = ?';
        const [result] = await connection.promise().execute(query, ['Student']);
        res.status(200).json({ 'data' : result , message : "Successfully fetched all Users"});
        
      }catch(err){
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
      }
});

router.get('/getStudent/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const query = 'SELECT * FROM UserProfile WHERE Role = ? AND id = ?';
      const [result] = await connection.promise().execute(query, ['Student', id]);
      res.status(200).json({ 'data': result, message: "Successfully fetched the student" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ Error: 'Internal server error' });
    }
  });
  
export default router;