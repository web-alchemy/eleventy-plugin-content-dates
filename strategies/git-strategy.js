const { execFileSync } = require('node:child_process');

function runCommand(command) {
  const [bin, ...args] = command.split(' ');
  return execFileSync(bin, args, {
    encoding: 'utf-8'
  });
}

function GitStrategy(options) {
  return function(data) {
    const contentPath = options.getContentPath(data);

    return {
      get createdAt() {
        if (!contentPath) {
          return null;
        }
        const date = runCommand(`git --no-pager log --diff-filter=A --follow -1 --format="%ci" ${contentPath}`).trim()
        return date ? new Date(date) : null;
      },

      get updatedAt() {
        if (!contentPath) {
          return null;
        }
        const date = runCommand(`git --no-pager log -n 1 --format="%ci" ${contentPath}`).trim()
        return date ? new Date(date) : null;
      },
    }
  }
}

module.exports = {
  GitStrategy
}