const { EleventyPluginContentDates, getContentFolderPath } = require('../.eleventy.js');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyPluginContentDates, {
    getContentPath: getContentFolderPath,
  });

  return {
    dir: {
      input: 'src'
    },
    templateFormats: ['html', 'njk', 'md'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  }
}