module.exports = {
  layout: 'main-layout.njk',

  eleventyComputed: {
    permalink: function(data) {
      const { fileSlug } = data.page;
      return `/articles/${fileSlug}/`
    }
  }
}