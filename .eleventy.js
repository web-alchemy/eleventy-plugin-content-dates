const fs = require('node:fs');
const path = require('node:path');
const { runCommand, getFolderCreatedDate, getFolderModifiedDate } = require('./utils.js');

const TIMESTAMPS = {
  'LAST_MODIFIED': 'Last Modified',
  'CREATED': 'Created',
  'GIT_LAST_MODIFIED': 'git Last Modified',
  'GIT_CREATED': 'git Created',
};

const strategies = {
  [TIMESTAMPS.LAST_MODIFIED]: function(contentPath) {
    const stats = fs.statSync(contentPath);
    return stats.isFile() ? stats.mtime : getFolderModifiedDate(contentPath);
  },

  [TIMESTAMPS.CREATED]: function(contentPath) {
    const stats = fs.statSync(contentPath);
    return stats.isFile() ? stats.birthtime : getFolderCreatedDate(contentPath);
  },

  [TIMESTAMPS.GIT_LAST_MODIFIED]: function(contentPath) {
    const date = runCommand(`git --no-pager log -n 1 --format="%ci" ${contentPath}`).trim()
    return date ? new Date(date) : null;
  },

  [TIMESTAMPS.GIT_CREATED]: function(contentPath) {
    const date = runCommand(`git --no-pager log --diff-filter=A --follow -1 --format="%ci" ${contentPath}`).trim()
    return date ? new Date(date) : null;
  }
}

function getContentFolderPath(data) {
  return path.dirname(data?.page?.inputPath);
}

function getContentFilePath(data) {
  return data?.page?.inputPath;
}

function computeDate(options) {
  const {
    strategy: strategyKey,
    contentPath
  } = options;

  const strategy = strategies[strategyKey];

  if (!strategy) {
    return;
  }

  if (!contentPath) {
    return;
  }

  return strategy(contentPath);
}

function EleventyPlugin(eleventyConfig, userOptions = {}) {
  const getContentPathFunction = userOptions.getContentPath ?? getContentFilePath;

  const timestampFields = userOptions.fields ?? ['createdAt', 'updatedAt'];

  const eleventyComputed = {}

  for (const field of timestampFields) {
    eleventyComputed[field] = function(data) {
      if (!data[field]) {
        return;
      }

      return computeDate({
        strategy: data[field],
        contentPath: getContentPathFunction(data)
      })
    }
  }

  eleventyConfig.addGlobalData('eleventyComputed', eleventyComputed);
}

module.exports = {
  EleventyPluginContentDates: EleventyPlugin,
  TIMESTAMPS,
  getContentFilePath,
  getContentFolderPath,
  computeDate
}