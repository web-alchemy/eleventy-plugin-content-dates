const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function runCommand(command) {
  const [bin, ...args] = command.split(' ');
  return execFileSync(bin, args, {
    encoding: 'utf-8'
  });
}

function* directoryWalk(dirPath) {
  const queue = [dirPath];

  let item;
  while ((item = queue.shift())) {
    const dir = fs.opendirSync(item);

    let dirent;
    while ((dirent = dir.readSync())) {
      const direntPath = path.join(item, dirent.name);

      if (dirent.isDirectory()) {
        queue.push(direntPath);
      }

      yield {
        dirent,
        path: direntPath,
      };
    }

    dir.closeSync();
  }
}

// the earliest creation date of all files in the directory
function getFolderCreatedDate(dirPath) {
  let birthtime = Infinity;

  for (const item of directoryWalk(dirPath)) {
    if (item.dirent.isDirectory()) {
      continue;
    }

    const stats = fs.statSync(item.path);

    if (stats.birthtime < birthtime) {
      birthtime = stats.birthtime;
    }
  }

  return birthtime
}

// the oldest modified date of all files in the directory
function getFolderModifiedDate(dirPath) {
  let mtime = -Infinity;

  for (const item of directoryWalk(dirPath)) {
    if (item.dirent.isDirectory()) {
      continue;
    }

    const stats = fs.statSync(item.path);

    if (stats.mtime > mtime) {
      mtime = stats.mtime;
    }
  }

  return mtime
}

module.exports = {
  runCommand,
  getFolderCreatedDate,
  getFolderModifiedDate
}