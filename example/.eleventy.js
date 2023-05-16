const { EleventyPluginContentDates, getContentFolderPath } = require('../.eleventy.js');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyPluginContentDates, {
    fields: ['createdAt', 'updatedAt'],
    getContentPath: getContentFolderPath
  });

  return {
    dir: {
      input: 'src'
    }
  }
}