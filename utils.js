const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, execFile } = require('node:child_process');
const util = require('node:util');

function runCommandSync(command) {
  const [bin, ...args] = command.split(' ');
  return execFileSync(bin, args, {
    encoding: 'utf-8'
  });
}

async function runCommand(command) {
  const [bin, ...args] = command.split(' ');
  const { stdout } = await util.promisify(execFile)(bin, args, {
    encoding: 'utf-8'
  });
  return stdout;
}

function* directoryWalkSync(dirPath) {
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
        direntPath,
      };
    }

    dir.closeSync();
  }
}

async function* directoryWalk(dirPath) {
  const queue = [dirPath];

  let item;
  while (item = queue.shift()) {
    const dir = await fs.promises.opendir(item);

    for await (const dirent of dir) {
      const direntPath = path.join(item, dirent.name);

      if (dirent.isDirectory()) {
        queue.push(direntPath);
      }

      yield {
        dirent,
        direntPath
      };
    }
  }
}

// the earliest creation date of all files in the directory
function getFolderCreatedDateSync(dirPath) {
  let birthtime = Infinity;

  for (const item of directoryWalkSync(dirPath)) {
    if (item.dirent.isDirectory()) {
      continue;
    }

    const stats = fs.statSync(item.direntPath);

    if (stats.birthtime < birthtime) {
      birthtime = stats.birthtime;
    }
  }

  return birthtime;
}

async function getFolderCreatedDate(dirPath) {
  let birthtime = Infinity;

  for await (const item of directoryWalk(dirPath)) {
    if (item.dirent.isDirectory()) {
      continue;
    }

    const stats = await fs.promises.stat(item.direntPath);

    if (stats.birthtime < birthtime) {
      birthtime = stats.birthtime;
    }
  }

  return birthtime;
}

// the oldest modified date of all files in the directory
function getFolderModifiedDateSync(dirPath) {
  let mtime = -Infinity;

  for (const item of directoryWalkSync(dirPath)) {
    if (item.dirent.isDirectory()) {
      continue;
    }

    const stats = fs.statSync(item.direntPath);

    if (stats.mtime > mtime) {
      mtime = stats.mtime;
    }
  }

  return mtime;
}

async function getFolderModifiedDate(dirPath) {
  let mtime = -Infinity;

  for await (const item of directoryWalk(dirPath)) {
    if (item.dirent.isDirectory()) {
      continue;
    }

    const stats = await fs.promises.stat(item.direntPath);

    if (stats.mtime > mtime) {
      mtime = stats.mtime;
    }
  }

  return mtime;
}

module.exports = {
  runCommand,
  runCommandSync,
  getFolderCreatedDate,
  getFolderModifiedDate,
  getFolderCreatedDateSync,
  getFolderModifiedDateSync
}