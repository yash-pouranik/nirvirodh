const sendMail = require("./nodemailer"); // your configured mail function

module.exports = async function sendInvitationEmail({ to, teamName, inviterName }) {
  return await sendMail({
    to,
    subject: "🚀 You're Invited to Join a Team on Nirvirodh!",
    text: `Hi there!

You've been invited to join the team "${teamName}" on Nirvirodh by ${inviterName}.

Click the link below to join:
https://nirvirodh.bitBros/join?team=${encodeURIComponent(teamName)}

If you were not expecting this email, ignore this message.

- Nirvirodh Team`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>🚀 You're Invited to Join <span style="color: #8B5CF6;">${teamName}</span> on Nirvirodh!</h2>
        <p><strong>${inviterName}</strong> has invited you to collaborate on Nirvirodh.</p>
        <p style="margin: 1rem 0;">
          <a href="http://localhost:5000/join?team=${encodeURIComponent(teamName)}" 
             style="padding: 10px 20px; background: #8B5CF6; color: white; border-radius: 5px; text-decoration: none;">
            Accept Invitation
          </a>
        </p>
        <p style="color: #777;">Ignore this email if you're not expecting it.</p>
        <p>– Nirvirodh Team</p>
      </div>
    `
  });
};
