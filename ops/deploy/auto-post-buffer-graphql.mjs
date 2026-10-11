#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.BUFFER_ACCESS_TOKEN || '';
const ORG_ID = '6ab2944bde33c2bbc1cf0dd4';

if (!TOKEN) {
  console.error('BUFFER_ACCESS_TOKEN not set');
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

  const text = `${todayPost.dek}\n\n${todayPost.body[0]}\n\nhttps://dadstillhere.com/blog/${todayPost.slug}`;

  try {
    const res = await fetch('https://api.bufferapp.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        query: `mutation { createUpdate(input: { organizationId: "${ORG_ID}", updates: [{text: "${text.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"}]}) { updates { id } } }`,
      }),
    });
    
    const data = await res.json();
    
    if (data.data?.createUpdate?.updates?.length > 0) {
      console.log(`✓ Day ${dayOfMonth}: ${todayPost.title}`);
      process.exit(0);
    } else {
      console.error(data.errors ? data.errors[0].message : JSON.stringify(data));
      process.exit(1);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

postToBuffer();
