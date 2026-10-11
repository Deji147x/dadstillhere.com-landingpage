#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.BUFFER_API_TOKEN || '';
const PROFILE_IDS = (process.env.BUFFER_PROFILE_IDS || '').split(',').filter(Boolean);

if (!TOKEN) {
  console.error('BUFFER_API_TOKEN not set');
  process.exit(1);
}

if (PROFILE_IDS.length === 0) {
  console.error('BUFFER_PROFILE_IDS not set');
  process.exit(1);
}

async function postToBuffer() {
  const postsPath = path.join(__dirname, '..', 'content', 'posts.json');
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  
  const dayOfMonth = new Date().getDate();
  const todayPost = posts[dayOfMonth - 1];
  
  if (!todayPost) {
    console.log(`No post for day ${dayOfMonth}`);
    process.exit(0);
  }

  const caption = `${todayPost.dek}\n\n${todayPost.body[0]}\n\n→ Read the full story\nhttps://dadstillhere.com/blog/${todayPost.slug}\n\nLearn more: https://dadstillhere.com\n\n#estrangedparents #grief #fatherhood`;

  const formData = new URLSearchParams();
  formData.append('access_token', TOKEN);
  formData.append('text', caption);
  formData.append('now', 'true');

  for (const profileId of PROFILE_IDS) {
    formData.append('profile_ids[]', profileId);
  }

  try {
    const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log(`✓ Day ${dayOfMonth} posted to ${PROFILE_IDS.length} channels: "${todayPost.title}"`);
      process.exit(0);
    } else {
      console.error(`✗ Buffer error: ${data.error}`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`✗ Request failed: ${e.message}`);
    process.exit(1);
  }
}

postToBuffer();
