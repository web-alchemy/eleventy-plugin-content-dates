const { TIMESTAMPS } = require('../../../.eleventy.js');

module.exports = {
  layout: 'main-layout.njk',

  createdAtFS: TIMESTAMPS.GIT_CREATED,
  updatedAtFS: TIMESTAMPS.FS_LAST_MODIFIED,
  createdAtGit: TIMESTAMPS.GIT_CREATED,
  updatedAtGit: TIMESTAMPS.GIT_LAST_MODIFIED,

  eleventyComputed: {
    permalink: function(data) {
      const { fileSlug } = data.page;
      return `/articles/${fileSlug}/`
    }
  }
}