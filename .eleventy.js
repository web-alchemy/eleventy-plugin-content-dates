const path = require('node:path');
const { FileSystemStrategy } = require('./strategies/file-strategy.js');
const { GitStrategy } = require('./strategies/git-strategy.js');

function getContentPath(data) {
  const inputPath = data?.page?.inputPath;
  return path.dirname(inputPath);
}

function EleventyPlugin(eleventyConfig, userOptions = {}) {
  const fieldKey = userOptions.fieldKey ?? 'dates';
  const getContentPathFunction = userOptions.getContentPath ?? getContentPath;
  const strategy = userOptions.strategy ?? FileSystemStrategy;

  eleventyConfig.addGlobalData('eleventyComputed', {
    [fieldKey]: strategy({
      getContentPath: getContentPathFunction
    })
  });
}

module.exports = {
  EleventyPluginContentDates: EleventyPlugin,
  FileSystemStrategy,
  GitStrategy
}