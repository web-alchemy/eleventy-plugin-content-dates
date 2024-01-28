const fs = require('node:fs');
const path = require('node:path');
const {
  runCommand,
  runCommandSync,
  getFolderCreatedDate,
  getFolderModifiedDate,
  getFolderCreatedDateSync,
  getFolderModifiedDateSync
} = require('./utils.js');

const TIMESTAMPS = {
  'FS_CREATED':        'Date. FS. Created',
  'FS_LAST_MODIFIED':  'Date. FS. Last Modified',
  'GIT_CREATED':       'Date. Git. Created',
  'GIT_LAST_MODIFIED': 'Date. Git. Last Modified',
};

const MODE = {
  'ASYNC': 'ASYNC',
  'SYNC': 'SYNC',
};

const strategiesSync = {
  [TIMESTAMPS.FS_LAST_MODIFIED](contentPath) {
    const stats = fs.statSync(contentPath);
    return stats.isFile() ? stats.mtime : getFolderModifiedDateSync(contentPath);
  },

  [TIMESTAMPS.FS_CREATED](contentPath) {
    const stats = fs.statSync(contentPath);
    return stats.isFile() ? stats.birthtime : getFolderCreatedDateSync(contentPath);
  },

  [TIMESTAMPS.GIT_LAST_MODIFIED](contentPath) {
    const command = `git --no-pager log -n 1 --format="%ci" ${contentPath}`;
    const date = runCommandSync(command).trim();
    return date ? new Date(date) : null;
  },

  [TIMESTAMPS.GIT_CREATED](contentPath) {
    const command = `git --no-pager log --diff-filter=A --follow -1 --format="%ci" ${contentPath}`;
    const date = runCommandSync(command).trim();
    return date ? new Date(date) : null;
  }
}

const strategiesAsync = {
  async [TIMESTAMPS.FS_LAST_MODIFIED](contentPath) {
    const stats = await fs.promises.stat(contentPath);
    return stats.isFile() ? stats.mtime : await getFolderModifiedDate(contentPath);
  },

  async [TIMESTAMPS.FS_CREATED](contentPath) {
    const stats = await fs.promises.stat(contentPath);
    return stats.isFile() ? stats.birthtime : await getFolderCreatedDate(contentPath);
  },

  async [TIMESTAMPS.GIT_LAST_MODIFIED](contentPath) {
    const command = `git --no-pager log -n 1 --format="%ci" ${contentPath}`;
    const date = (await runCommand(command)).trim();
    return date ? new Date(date) : null;
  },

  async [TIMESTAMPS.GIT_CREATED](contentPath) {
    const command = `git --no-pager log --diff-filter=A --follow -1 --format="%ci" ${contentPath}`;
    const date = (await runCommand(command)).trim();
    return date ? new Date(date) : null;
  }
}

function getContentFolderPath(data) {
  return path.dirname(data.page.inputPath);
}

function getContentFilePath(data) {
  return data.page.inputPath;
}

function computeDate(options) {
  const {
    strategy: strategyKey,
    contentPath,
    mode = MODE.ASYNC
  } = options;

  const strategy = (mode === MODE.ASYNC ? strategiesAsync : strategiesSync)[strategyKey];

  if (!strategy) {
    return;
  }

  if (!contentPath) {
    return;
  }

  return strategy(contentPath);
}

const EFFECT_FIELD_NAME = '__EFFECT_COMPUTED_DATE_FIELD__';
const timestampsSet = new Set(Object.values(TIMESTAMPS));

function EleventyPlugin(eleventyConfig, userOptions = {}) {
  const getContentPathFunction = userOptions.getContentPath ?? getContentFilePath;
  const mode = userOptions.mode ?? MODE.ASYNC;

  eleventyConfig.addGlobalData(`eleventyComputed.${EFFECT_FIELD_NAME}`, () => {
    return async function(data) {
      for (const [key, value] of Object.entries(data)) {
        if (timestampsSet.has(value)) {
          data[key] = await computeDate({
            strategy: value,
            contentPath: await getContentPathFunction(data),
            mode
          });
        }
      }
    }
  });
}

module.exports = EleventyPlugin;
module.exports.EleventyPlugin = EleventyPlugin;
module.exports.eleventyPlugin = EleventyPlugin;
module.exports.EleventyPluginContentDates = EleventyPlugin;
module.exports.eleventyPluginContentDates = EleventyPlugin;
module.exports.TIMESTAMPS = TIMESTAMPS;
module.exports.MODE = MODE;
module.exports.strategiesAsync = strategiesAsync;
module.exports.strategiesSync = strategiesSync;
module.exports.getContentFilePath = getContentFilePath;
module.exports.getContentFolderPath = getContentFolderPath;
module.exports.computeDate = computeDate;