import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Use an environment variable for your API key if possible.
const API_KEY =
  process.env.GENERATIVE_AI_API_KEY ||
  "AIzaSyCVs2GVPL55Xa6-nABR7PdnWuqPRgp1n8E";
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send'
];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credential.json');

// Global label map to store label names and their IDs.
let labelMap = [];

// Helper to get a label's ID by name from labelMap.
function getLabelId(labelName) {
  const label = labelMap.find((l) => l.name === labelName);
  return label ? label.id : null;
}

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function listLabels(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.labels.list({ userId: 'me' });
  const labels = res.data.labels;
  labelMap = []; // Reset the label map.
  if (!labels || labels.length === 0) {
    console.log('No labels found.');
    return;
  }
  console.log('Labels:');
  labels.forEach((label) => {
    console.log(`${label.name}: ${label.id}`);
    labelMap.push({ name: label.name, id: label.id });
  });
}

async function moveEmailToLabel(auth, messageId, labelId, removeLabelIds) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const res = await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: [labelId], // Passing labelId instead of labelName
        removeLabelIds: removeLabelIds || [],
      },
    });
    console.log('Email moved:', res.data);
  } catch (err) {
    console.error('Error moving email:', err);
  }
}

async function createLabel(auth, labelName) {
  const gmail = google.gmail({ version: 'v1', auth });
  const labelObject = {
    name: labelName,
    labelListVisibility: 'labelShow',
    messageListVisibility: 'show',
  };

  try {
    const response = await gmail.users.labels.create({
      userId: 'me',
      requestBody: labelObject,
    });
    console.log(`Created label: ${response.data.name}`);
    labelMap.push({ name: response.data.name, id: response.data.id });
    return response.data.id;
  } catch (error) {
    console.error('Error creating label:', error);
    return null;
  }
}

async function generateEmailLabels(emailContent) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Given the following email content, suggest two appropriate label names (only the label names, separated by commas): ${emailContent}`;
  const response = await model.generateContent([prompt]);
  const labels = response.response.text().split(',').map((label) => label.trim());
  return labels;
}

async function getEmail(messageId, auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
  });
  return res;
}

async function processEmails(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res1 = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
    maxResults: 5,
  });
  const messages = res1.data.messages;
  if (messages && messages.length > 0) {
    for (let message of messages) {
      const email = await getEmail(message.id, auth);
      try {
        const generatedLabels = await generateEmailLabels(email.data.snippet);
        console.log('Generated labels:', generatedLabels);
        for (const labelName of generatedLabels) {
          let labelId = getLabelId(labelName);
          if (!labelId) {
            labelId = await createLabel(auth, labelName);
          }
          if (labelId) {
            await moveEmailToLabel(auth, email.data.id, labelId, email.data.labelIds);
          }
        }
      } catch (error) {
        console.error('Error processing email:', error);
      }
    }
  }
}

async function main() {
  const auth = await authorize();
  await listLabels(auth);
  await processEmails(auth);
}

export default async function handler(req, res) {
  try {
    await main();
    res.status(200).json({ message: 'Email labeling process initiated.' });
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: error.message });
  }
}
