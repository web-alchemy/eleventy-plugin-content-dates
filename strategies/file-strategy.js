const fs = require('node:fs');
const path = require('node:path');

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

function getFolderDates(dirPath) {
  let birthtime = Infinity;
  let mtime = -Infinity;

  for (const item of directoryWalk(dirPath)) {
    if (item.dirent.isDirectory()) {
      continue;
    }

    const stats = fs.statSync(item.path);

    if (stats.mtime > mtime) {
      mtime = stats.mtime;
    }

    if (stats.birthtime < birthtime) {
      birthtime = stats.birthtime;
    }
  }

  return {
    mtime,
    birthtime
  }
}

function FileSystemStrategy(options) {
  return function(data) {
    const contentPath = options.getContentPath(data);
    let stats = fs.statSync(contentPath);
    stats = stats.isFile() ? stats : getFolderDates(contentPath);

    return {
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
    }
  }
}

module.exports = {
  FileSystemStrategy
}