import {Low, JSONFile} from 'lowdb';

// Lowdb connect
const adapter = new JSONFile('db.json');
export const db = new Low(adapter);
await db.read();
db.data ||= {posts: []};

export const {posts} = db.data;
