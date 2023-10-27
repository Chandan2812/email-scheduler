const express = require("express");
const {Connection} = require("./config/db")
require("dotenv").config();
const sendEmail = require('./mailer');
const EmailSchedule = require('./models/emailSchedule.model');
const cron = require('node-cron');



const app=express()

const PORT = process.env.PORT || 8000;

app.use(express.json())



app.post('/schedule-email', async (req, res) => {
    try {
        const emailData = req.body;
        const scheduledEmail = new EmailSchedule(emailData);
        await scheduledEmail.save();

        if (emailData.time === "now") {
            const success = await sendEmail(emailData.email, emailData.subject, emailData.body);
            if (success) {
                scheduledEmail.status = "sent";
            } else {
                scheduledEmail.status = "error";
                scheduledEmail.errorMessage = "Failed to send email";
            }
            await scheduledEmail.save();

        } else if (emailData.time === "1 hour later") {
            setTimeout(async () => {
                const success = await sendEmail(emailData.email, emailData.subject, emailData.body);
                if (success) {
                    scheduledEmail.status = "sent";
                } else {
                    scheduledEmail.status = "error";
                    scheduledEmail.errorMessage = "Failed to send email after 1 hour";
                }
                await scheduledEmail.save();
            }, 3600000);  // 1 hour in milliseconds
        }
        else {
            const [datePart, timePart] = emailData.time.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute] = timePart.split(':').map(Number);

            const taskDate = new Date(year, month - 1, day, hour, minute);
            const delay = taskDate.getTime() - new Date().getTime();

            if (delay > 0) {
                setTimeout(async () => {
                    const success = await sendEmail(emailData.email, emailData.subject, emailData.body);
                    if (success) {
                        scheduledEmail.status = "sent";
                    } else {
                        scheduledEmail.status = "error";
                        scheduledEmail.errorMessage = "Failed to send email at scheduled time";
                    }
                    await scheduledEmail.save();
                }, delay);
            } else {
                scheduledEmail.status = "error";
                scheduledEmail.errorMessage = "Scheduled time is in the past";
                await scheduledEmail.save();
            }
        }

        res.status(201).send({ message: "Email scheduled!" });
    } catch (err) {
        res.status(500).send({ error: "Internal Server Error" });
    }
});


app.listen(PORT,async()=>{
    try {
        await Connection
        console.log("Connected to DB")
    } catch (error) {
        console.log("Error in connecting to DB")   
    }
    console.log(`Server running @ ${PORT}`)
})