# eleventy-plugin-content-dates

Eleventy-плагин для вычисления дат создания и изменения файлов на основе данных git или файловой системы.

## Установка

```bash
npm install @web-alchemy/eleventy-plugin-content-dates
```

## Настройка

```javascript
const {
  EleventyPluginContentDates,
  FileSystemStrategy,
  GitStrategy
} = require('@web-alchemy/eleventy-plugin-content-dates');

const isProd = process.env.NODE_ENV === 'production';

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyPluginContentDates, {
    // поле данных, в котором будут находится поля `createdAt` и `updatedAt`, по умолчанию - `dates`
    fieldKey: 'dates', 
    
    // стратегия для вычисления дат, по умолчанию - `FileSystemStrategy`
    strategy: isProd ? GitStrategy : FileSystemStrategy,
    
    // функция для уточнения пути для файла или папки, по умолчанию - папка, в которой находится файл
    getContentPath: function (data) {
      const inputPath = data?.page?.inputPath;
      return require('node:path').dirname(inputPath);
    }
  });
}
```

## Пример использования для шаблонизатора Nunjucks

```nunjucks
<time datetime="{{ dates.createdAt.toISOString()}}">
  {{ dates.createdAt.toLocaleDateString() }}
</time>

<time datetime="{{ dates.updatedAt.toISOString()}}">
  {{ dates.updatedAt.toLocaleDateString() }}
</time>
```