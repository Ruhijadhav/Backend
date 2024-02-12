import express from 'express';
import upload from '../User/Picture.js';
import connection from '../Connection/Connection.js';
import {authorize} from '../User/Authorization.js';

const router = express();
router.use((req,res,next)=>{
     next();
});

router.post('/postStory', upload.single('image')  ,  async (req,res) => {
    const new_image = req.file ? `/store/${req.file.filename}` : '';
    console.log({ new_image });
    const { story , alumniId } = req.body ;
   try {
        const query = 'insert into alumniStories(image ,story , alumniId) values  (? , ? , ?)';
        const [result] = await connection.promise().execute(query, [new_image , story , alumniId]);
        console.log(result);

        if (result.affectedRows === 1) {
             return res.status(200).json({ message: "Successfully inserted project in the database" });
        } else {
            return res.status(401).json({ message: "Some error occurred while inserting." });
       }

  } catch (error) {
       console.error(error);
       return res.status(500).json({ message: "Internal server error", error: error });
   }
});





router.get('/getStory/:alumniId' , async (req,res) => {
    const {alumniId} = req.params ;
    try {
           const query = 'select * from alumniStories where alumniId = ?';
           const [result] = await connection.promise().execute(query, [alumniId]); 
           res.status(200).json({ status: 'success', data: result, message: 'Successfully fetched Screen' });
   } catch (err) {
           console.error(err);
         res.status(500).json({ status: 'error', message: 'Internal server error' });
   }
 }); 

 router.delete('/deleteStory/:id' , async (req,res) => {
     const {id} = req.params ;
     try {
            const query = 'delete from alumniStories where id = ?';
            const [result] = await connection.promise().execute(query, [id]); 
            res.status(200).json({ status: 'success', data: result, message: 'Successfully deleted story' });
    } catch (err) {
            console.error(err);
          res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }); 

  router.put('/updateStory/:id', upload.single('image')  , async (req, res) => {
     const { id } = req.params;
     const { prev_image,  story } = req.body;

     const new_image = req.file ? `/store/${req.file.filename}` : prev_image;
     console.log({ new_image , story });
     try {
         const query = 'UPDATE alumniStories SET image = ?, story = ? WHERE id = ?';
         const [result] = await connection.promise().execute(query, [new_image, story, id]);
         res.status(200).json({ status: 'success', data: result, message: 'Successfully updated story' });
     } catch (err) {
         console.error(err);
         res.status(500).json({ status: 'error', message: 'Internal server error' });
     }
 });
 




export default router;