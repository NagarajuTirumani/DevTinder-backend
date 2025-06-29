const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");

const RequestModel = require("../models/request");
const { sendEmail } = require("../utils/email");

cron.schedule("0 8 * * *", async () => {
  const yesterday = subDays(new Date(), 1);
  const yesterdayStartTime = startOfDay(yesterday).toDateString();
  const yesterdayEndTime = endOfDay(yesterday).toLocaleString();

  const connections = await RequestModel.find({
    createdAt: {
      $gt: yesterdayStartTime,
      $lt: yesterdayEndTime,
    },
  }).populate("toUserId");

  const uniqueEmails = new Array(
    ...new Set(connections.map((connection) => connection.toUserId.email))
  );

  for (let email of uniqueEmails) {
    await sendEmail({
      subject: "Yah! you got new Connection Requests in DevTinder!",
      toEmail: email,
      template: `
        <p>Hi,</p>
        <p>you have got some new connetion requests in the past 24 hours. </p>
        <p>Please Login to Devtinder and Accept/Reject them</p>

        <p>
            <span>yours,</span><br/>
            <span>The DevTinder Team</span>
        </p>
        `,
    });
  }
});
