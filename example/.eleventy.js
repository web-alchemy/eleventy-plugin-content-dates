const { EleventyPluginContentDates, FileSystemStrategy, GitStrategy } = require('../.eleventy.js');

const isProd = process.env.NODE_ENV === 'production';

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyPluginContentDates, {
    strategy: isProd ? GitStrategy : FileSystemStrategy
  });

  return {
    dir: {
      input: 'src'
    }
  }
}