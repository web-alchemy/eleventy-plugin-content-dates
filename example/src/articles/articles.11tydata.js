const { TIMESTAMPS } = require('../../../.eleventy.js');

module.exports = {
  layout: 'main-layout.njk',

  createdAt: TIMESTAMPS.GIT_CREATED,
  updatedAt: TIMESTAMPS.LAST_MODIFIED,

  eleventyComputed: {
    permalink: function(data) {
      const { fileSlug } = data.page;
      return `/articles/${fileSlug}/`
    }
  }
}