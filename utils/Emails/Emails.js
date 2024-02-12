import express from 'express';
import brevo from '@getbrevo/brevo';
import {authorize} from '../User/Authorization.js';
import env from 'dotenv';
env.config();


const router = express();

function sendToAlumni(Email , Name , message){
    let defaultClient = brevo.ApiClient.instance;

    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_KEY;

    let apiInstance = new brevo.TransactionalEmailsApi();
    let sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Related to Department Project Submisson";
    sendSmtpEmail.htmlContent = `<html><body>
           ${message}
    </body></html>`;
    sendSmtpEmail.sender = { "name": "Shivam Shakya", "email": "shivdu2000@gmail.com" };
    sendSmtpEmail.to = [{ "email": Email, "name": "Reciever" }];
    sendSmtpEmail.replyTo = { "email": "shivdu2000@gmail.com", "name": "Shivam Shakya" };
    sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
    sendSmtpEmail.params = { "parameter": "My param value", "subject": "Related to Project Submission : Department of Mathematics" };


    apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
         console.log( {"Success" :  JSON.stringify(data)});
         return  true;
    }, function (error) {
         console.log( {"Failed" :  error});
         return  false;
    });
}


function sendToAdmin(name , company , email , message){
    let defaultClient = brevo.ApiClient.instance;

    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_KEY;

    let apiInstance = new brevo.TransactionalEmailsApi();
    let sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Related to Recruitment Process";
    sendSmtpEmail.htmlContent = `<html><body>
            ${name}
            ${message}
    </body></html>`;
    sendSmtpEmail.sender = { "name": `${company}`, "email": `${email}` };
    sendSmtpEmail.to = [{ "email": "shivdu2000@gmail.com", "name": "Reciever" }];
    sendSmtpEmail.replyTo = { "email": "shivdu2000@gmail.com", "name": "Shivam Shakya" };
    sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
    sendSmtpEmail.params = { "parameter": "My param value", "subject": "Related to Recruitment Process" };


    apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
         console.log( {"Success" :  JSON.stringify(data)});
         return  true;
    }, function (error) {
         console.log( {"Failed" :  error});
         return  false;
    });
}

function Varification(Email, OTP){
    let defaultClient = brevo.ApiClient.instance;

    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_KEY;

    let apiInstance = new brevo.TransactionalEmailsApi();
    let sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "My {{params.subject}}";
    sendSmtpEmail.htmlContent = `<html><body><h1> your otp number is : ${OTP}</h1></body></html>`;
    sendSmtpEmail.sender = { "name": "Shivam Shakya", "email": "shivdu2000@gmail.com" };
    sendSmtpEmail.to = [
      { "email": Email, "name": "Reciever" }
    ];
    sendSmtpEmail.replyTo = { "email": "shivdu2000@gmail.com", "name": "Shivam Shakya" };
    sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
    sendSmtpEmail.params = { "parameter": "My param value", "subject": "common subject" };


    apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
         console.log( {"Success" :  JSON.stringify(data)});
         return  true;
    }, function (error) {
         console.log( {"Failed" :  error});
         return  false;
    });
}


router.get('/sendEmail', authorize, async (req, res) => {
    const {user , message} = req.body ;
    console.log({message});
    try {     
        let query;

        if(user === 'All'){
            query = "SELECT * FROM UserProfile" ;
        }else{
            query = "SELECT * FROM UserProfile WHERE role = ?"
        }

        const [result] = await connection.promise().execute(query ,[user]); 
        console.log({result});

        result.map(result => {
             const Name = result.FirstName +' '+result.MiddleName +' '+result.LastName;
            // sendToAlumni(result.Email , Name , message);
            console.log({Name});
        })
        res.json({message : "successfully send"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/sendEmailToAdmin' , async (req, res) => {
    const {name , company, email , message} = req.body ;
    try {     
       let value =  sendToAdmin(name,company , email, message );
        if(value){
            res.json({message : "successfully send"});
        }else{
            res.json({message : "Not successful"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});



export {sendToAlumni , Varification , router};


