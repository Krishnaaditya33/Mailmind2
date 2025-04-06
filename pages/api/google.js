// pages/api/google.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "path/to/your/service-account.json", // update path accordingly
      scopes: ["https://www.googleapis.com/auth/some.scope"],
    });
    const client = await auth.getClient();
    const gmail = google.gmail({ version: "v1", auth: client });
    const response = await gmail.users.labels.list({ userId: "me" });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
