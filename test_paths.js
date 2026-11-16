import fs from 'fs';
import path from 'path';

const paths = [
  'public/sequence',
  'public',
  'scrollytelling/public/sequence',
  'scrollytelling/public',
  'ezgif-split',
  'c:/Users/Ayush/OneDrive/Documents/swarm/ezgif-split',
  'c:/Users/Ayush/OneDrive/Documents/swarm/scrollytelling/public/sequence',
  'c:/Users/Ayush/OneDrive/Documents/swarm/public/sequence'
];

for (const p of paths) {
  if (fs.existsSync(p)) {
    const files = fs.readdirSync(p);
    console.log(p, 'EXISTS, count:', files.length);
    if (files.length > 0) {
      console.log('   first:', files[0], 'last:', files[files.length - 1]);
    }
  } else {
    console.log(p, 'DOES NOT EXIST');
  }
}
