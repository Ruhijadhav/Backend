import express from 'express';
import brevo from '@getbrevo/brevo';
import env from 'dotenv';
env.config();

const router = express();
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

function validateEmail(email) {
    return emailRegex.test(email);
  };


router.post('/emailVarification', async (req, res) => {
    const { Email} = req.body;
    console.log({Email});
     if(validateEmail(Email)){
        try {

            const OTP =Math.round(100*Math.random());
            console.log({OTP})
            Varification(Email , OTP);
            res.json({message : "successfully send" , generatedOTP: OTP});
            console.log(OTP);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
     }else{
            res.status(500).json({error: "Email is not valid"});

     }
});


router.post('/otpMatch', (req,res)=> {
    const { userOTP, generatedOTP } = req.body;
    console.log({userOTP , generatedOTP});
    if (parseInt(userOTP,10) === generatedOTP) {
        console.log({ message: 'OTP verification successful' });
        res.json({ success : true ,  message: 'OTP verification successful' });
      } else {
        console.log({ message: 'OTP verification failed' });
        res.status(400).json({ success : false ,message: 'OTP verification failed' });
      }
});

export default router;
