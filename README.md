# Eleventy plugin for content dates

Static site generator [Eleventy](https://www.11ty.dev/docs/dates/) uses a special data field `date` with predefined values `Created`, `Last Modified`, `git Created`, `git Last Modified` to sort collections and show post date.

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
const { eleventyPluginContentDates } = require('@web-alchemy/eleventy-plugin-content-dates');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventyPluginContentDates);
}
```

By default, dates are calculated for a file with the path `data.page.inputPath`. But you can change the path to the entity for which you need to calculate dates, for example, for a folder. Sometimes you need to calculate dates for folders, as they may contain other resources, for example, pictures. You can use the `getContentFolderPath` function from the plugin or write your own.

```javascript
const { eleventyPluginContentDates, getContentFolderPath } = require('@web-alchemy/eleventy-plugin-content-dates');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventyPluginContentDates, {
    // this is default
    getContentPath: (data) => {
      return data.page.inputPath;
    }
    
    // you can compute dates for folders using library function `getContentFolderPath`
    getContentPath: getContentFolderPath
    
    // or write your own logic for getting path
    getContentPath: async (data) => {
      // `data` - is Eleventy data
      // function can be async
    }
  });
}
```

By default, library uses are async functions from modules `node:fs` and `node:child_process`. You can use sync version of this functions;

```javascript
const { eleventyPluginContentDates, MODE } = require('@web-alchemy/eleventy-plugin-content-dates');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventyPluginContentDates, {
    mode: MODE.SYNC
  });
}
```

## Usage

The plugin uses specials values for date fields:

- `Date. FS. Created` - the date of creation file received from the file system
- `Date. FS. Last Modified` - the date of modification file received from the file system
- `Date. Git. Created` - the date of creation file received from the git
- `Date. Git. Last Modified` - the date of modification file received from the git

Using in frontmatter:

```nunjucks
---
createdAt: 'Date. Git. Created'
updatedAt: 'Date. Git. Last Modified'
---

<time datetime="{{ createdAt.toISOString()}}">
  {{ createdAt.toLocaleDateString() }}
</time>

<time datetime="{{ updatedAt.toISOString()}}">
  {{ updatedAt.toLocaleDateString() }}
</time>
```

Using in `11tydata`-files:

```javascript
const { TIMESTAMPS } = require('@web-alchemy/eleventy-plugin-content-dates');

module.exports = {
  createdAtWithFS: TIMESTAMPS.FS_CREATED,
  updatedAtWithFS: TIMESTAMPS.FS_LAST_MODIFIED,
  createdAtWithGit: TIMESTAMPS.GIT_CREATED,
  updatedAtWithGit: TIMESTAMPS.GIT_LAST_MODIFIED,
}
```

## Low level usage example

You can use `@web-alchemy/eleventy-plugin-content-dates` as a library without registering the plugin:

```javascript
// index.11tydata.js
const path = require('node:path');
const { TIMESTAMPS, MODE, computeDate } = require('@web-alchemy/eleventy-plugin-content-dates');

module.exports = {
  eleventyComputed: {
    yourCustomDateField: async function(data) {
      return await computeDate({
        strategy: TIMESTAMPS.GIT_LAST_MODIFIED,
        mode: MODE.ASYNC,
        contentPath: path.dirname(data.page.inputPath),
      })
    },
    
    yourAnotherCustomDateField: function(data) {      
      return computeDate({
        strategy: TIMESTAMPS.FS_CREATED,
        mode: MODE.SYNC,
        contentPath: data.page.inputPath,
      })
    },
  }
}
```

## Caveats of use on CI/CD

Many CI/CD tools, such as [Github Actions Checkout](https://github.com/actions/checkout), by default does a shallow clone and dates may be incorrect.

Solutions:

- Make deep clone with `fetch-depth: '0'`:
  ```yaml
    - name: Checkout
      uses: actions/checkout@v4
      with:
        fetch-depth: '0'
  ```
  This is also helpful, if you use git creation dates. But with this method, all branches and tags are pulled out, not just the history of one branch.
- Write your own git commands. Just example:
  ```yaml
  - name: Checkout
    run: |
      git clone --depth 1 <REPO> .
      git fetch --unshallow
  ```