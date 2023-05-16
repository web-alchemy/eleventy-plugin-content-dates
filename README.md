# eleventy-plugin-content-dates

Eleventy-плагин для создания пользовательских полей с датами создания и изменения файлов на основе данных git или файловой системы. На данный момент, Eleventy позволяет производить такие вычисления только для одного поля `date`.

## Установка

```bash
npm install @web-alchemy/eleventy-plugin-content-dates
```

## Настройка

```javascript
const {
  EleventyPluginContentDates,
  getContentFolderPath
} = require('@web-alchemy/eleventy-plugin-content-dates');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyPluginContentDates, {
    // Поля данных, в которые будут подставляться даты, по умолчанию 'createdAt', 'updatedAt'.
    fields: ['createdAt', 'updatedAt'],
    
    // Функция для получения пути файла или папки, для которых будет высичляться дата, по умолчанию - путь до файла
    // Иногда нужно вычислять даты для папок, так как они могут содержать другие ресурсы, например, картинки. Можно использовать функцию `getContentFolderPath` из состава плагина или написать свою.
    getContentPath: function (data) {
      return data?.page?.inputPath;
    }
  });
}
```

## Пример использования для шаблонизатора Nunjucks

После того, как в настройках плагина были указаны имена полей, можно указать способы вычисления дат. Плагин использует те же [типы дат](https://www.11ty.dev/docs/dates/), что и Eleventy - `Last Modified`, `Created`, `git Last Modified`, `git Created`.

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

Поля удобнее указывать в 11tydata-файлах:

```javascript
const { TIMESTAMPS } = require('@web-alchemy/eleventy-plugin-content-dates');

module.exports = {
  createdAt: TIMESTAMPS.GIT_CREATED,
  updatedAt: TIMESTAMPS.GIT_LAST_MODIFIED
}
```