const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  for (const [search, replace] of replacements) {
    if (content.includes(search) || (search instanceof RegExp && search.test(content))) {
      content = content.replace(search, replace);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed', filePath);
  }
}

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walkSync(p, callback);
    } else {
      callback(p);
    }
  }
}

walkSync(srcDir, (p) => {
  if (p.endsWith('.tsx') || p.endsWith('.ts')) {
    let content = fs.readFileSync(p, 'utf-8');
    let original = content;

    // Fix uppercase enums
    content = content.replace(/"PENDING"/g, '"pending"');
    content = content.replace(/"APPROVED"/g, '"approved"');
    content = content.replace(/"REJECTED"/g, '"rejected"');
    content = content.replace(/"ACTIVE"/g, '"active"');
    content = content.replace(/"INACTIVE"/g, '"inactive"');
    content = content.replace(/"SUSPENDED"/g, '"suspended"');
    content = content.replace(/"RETIRED"/g, '"inactive"'); // mapping retired to inactive
    content = content.replace(/"ON_LEAVE"/g, '"inactive"');

    // Fix User -> Employee property accesses for UI
    // In many places, the code does emp.fullName etc. We will just tell TS to ignore or cast.
    // Actually, adding ts-ignore is dirty. 
    // Let's just restore the UI helper properties to User in types.ts instead of hacking the TSX.
    
    if (content !== original) {
      fs.writeFileSync(p, content, 'utf-8');
      console.log('Fixed ENUMs in', p);
    }
  }
});
