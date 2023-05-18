# eleventy-plugin-content-dates

Static site generator [Eleventy](https://www.11ty.dev/docs/dates/) uses a special data field `date` with predefined values `Created`, `Last Modified`, `git Created`, `git Last Modified` to sort collections.

But there are two problems here:
- it is not possible to use several fields at the same time, for example, for the creation date and for the modification date,
- the date is calculated for one file, but you can have a whole folder for an article with pictures, fonts and other resources. Their update should also be considered as a modification of the article.

This plugin solves this problems.

## Installation

```bash
npm install @web-alchemy/eleventy-plugin-content-dates
```

## Configuration

```javascript
const {
  EleventyPluginContentDates,
  getContentFolderPath
} = require('@web-alchemy/eleventy-plugin-content-dates');

module.exports = function(eleventyConfig) {
  // all settings are optional
  eleventyConfig.addPlugin(EleventyPluginContentDates, {
    // Data fields in which dates will be substituted. By default it is 'createdAt', 'updatedAt'.
    fields: ['createdAt', 'updatedAt'],
    
    // By default, dates are calculated for a file with the path `data?.page?.inputPath`. But you can change the path to the entity for which you need to calculate dates, for example, for a folder. Sometimes you need to calculate dates for folders, as they may contain other resources, for example, pictures. You can use the `getContentFolderPath` function from the plugin or write your own.
    getContentPath: function (data) {
      return data?.page?.inputPath;
    }
  });
}
```

## Usage example

After the field names have been specified in the plugin settings (By default it is `createdAt`, `updatedAt`), you can specify the methods for calculating dates. The plugin uses the same [date types](https://www.11ty.dev/docs/dates/) as Eleventy - `Last Modified`, `Created`, `git Last Modified`, `git Created`.

```nunjucks
---
createdAt: git Created
updatedAt: git Last Modified,
---

<time datetime="{{ createdAt.toISOString()}}">
  {{ createdAt.toLocaleDateString() }}
</time>

<time datetime="{{ updatedAt.toISOString()}}">
  {{ updatedAt.toLocaleDateString() }}
</time>
```

It is more convenient to specify the fields in `11tydata`-files:

```javascript
const { TIMESTAMPS } = require('@web-alchemy/eleventy-plugin-content-dates');

module.exports = {
  createdAt: TIMESTAMPS.GIT_CREATED,
  updatedAt: TIMESTAMPS.GIT_LAST_MODIFIED
}
```

## Low level usage example

```javascript
// .eleventy.js

const { EleventyPluginContentDates } = require('@web-alchemy/eleventy-plugin-content-dates');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyPluginContentDates, {
    fields: []
  });
}
```

```javascript
// index.11tydata.js
const { TIMESTAMPS, computeDate } = require('@web-alchemy/eleventy-plugin-content-dates');

module.exports = {
  eleventyComputed: {
    customDateField: function(data) {
      return computeDate({
        strategy: TIMESTAMPS.GIT_LAST_MODIFIED,
        contentPath: data?.page?.inputPath
      })
    },
  }
}
```