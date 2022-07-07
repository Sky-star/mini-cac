
## 介绍

CAC库的使用简单翻译

## 特点

- **超级轻量化**: 无依赖,就只一个文件.
- **简单易学**: 创建只需要学习 4 个 API: `cli.option` `cli.version` `cli.help` `cli.parse`.
- **却又很强大**: 具有默认指令，类似 git 的子指令，对必要的参数和选项进行验证,可变参数,点-嵌入式选项,
  自动帮助消息生成等.
- **开发友好**: 用 TypeScript 编写.

## 安装

```bash
yarn add cac
```

## 使用

### 简单的解析

使用 CAC 进行简单的解析

```js
// examples/basic-usage.js
const cli = require('cac')()

cli.option('--type <type>', 'Choose a project type', {
  default: 'node',
})

const parsed = cli.parse()

console.log(JSON.stringify(parsed, null, 2))
```

<img width="500" alt="2018-11-26 12 28 03" src="https://user-images.githubusercontent.com/8784712/48981576-2a871000-f112-11e8-8151-80f61e9b9908.png">

### 显示帮助信息的版本信息

```js
// examples/help.js
const cli = require('cac')()

cli.option('--type [type]', 'Choose a project type', {
  default: 'node',
})
cli.option('--name <name>', 'Provide your name')

cli.command('lint [...files]', 'Lint files').action((files, options) => {
  console.log(files, options)
})

// Display help message when `-h` or `--help` appears
cli.help()
// Display version number when `-v` or `--version` appears
// It's also used in help message
cli.version('0.0.0')

cli.parse()
```

<img width="500" alt="2018-11-25 8 21 14" src="https://user-images.githubusercontent.com/8784712/48979012-acb20d00-f0ef-11e8-9cc6-8ffca00ab78a.png">

### 指令-特殊选项

你可以添加选项到指令中

```js
const cli = require('cac')()

cli
  .command('rm <dir>', 'Remove a dir')
  .option('-r, --recursive', 'Remove recursively')
  .action((dir, options) => {
    console.log('remove ' + dir + (options.recursive ? ' recursively' : ''))
  })

cli.help()

cli.parse()
```

当一个指令被使用时会对传入的选项进行验证.任何未知的选项都会已错误的形式报告出来.然而,如果是一个基于动作的指令并定义动作，这个选项就不会被验证.如果你真的想使用未定义的选项,请用

<img alt="command options" width="500" src="https://user-images.githubusercontent.com/8784712/49065552-49dc8500-f259-11e8-9c7b-a7c32d70920e.png">

### 选项名称中的短划线`-`

在选项中以 kebab-case 命名的名称,在代码中使用 cameCase 引用

```js
cli
  .command('dev', 'Start dev server')
  .option('--clear-screen', 'Clear screen')
  .action((options) => {
    console.log(options.clearScreen)
  })
```

实际上 `--clear-screen` 和 `--clearScreen` 都会被更改为`options.clearScreen`

### 括号

在指令名称中使用括号时，尖括号表示必需的指令参数，而方括号表示可选参数。

在选项名称中使用括号时，尖括号表示需要字符串/数字值，而方括号表示该值也可以为 `true`。

```js
const cli = require('cac')()

cli
  .command('deploy <folder>', 'Deploy a folder to AWS')
  .option('--scale [level]', 'Scaling level')
  .action((folder, options) => {
    // ...
  })

cli
  .command('build [project]', 'Build a project')
  .option('--out <dir>', 'Output directory')
  .action((folder, options) => {
    // ...
  })

cli.parse()
```

### 否定选项

为了允许选项的值为 `false`，您需要手动指定一个否定选项：

```js
cli
  .command('build [project]', 'Build a project')
  .option('--no-config', 'Disable config file')
  .option('--config <path>', 'Use a custom config file')
```

如上的写法 CAC 会将`config`的默认值设置为true,你可以使用`--no-config`设置值为`false`

### 可变参数

指令的最后一个参数可以是可变参数,只能是最后一个参数才可以是可变参数.
让一个参数变为可变参数需要在参数名称之前添加`...`,就像 JavaScript中的 rest 操作.下面是一些例子:

```js
const cli = require('cac')()

cli
  .command('build <entry> [...otherFiles]', 'Build your app')
  .option('--foo', 'Foo option')
  .action((entry, otherFiles, options) => {
    console.log(entry)
    console.log(otherFiles)
    console.log(options)
  })

cli.help()

cli.parse()
```

<img width="500" alt="2018-11-25 8 25 30" src="https://user-images.githubusercontent.com/8784712/48979056-47125080-f0f0-11e8-9d8f-3219e0beb0ed.png">

### 点语法选项

点语法选项会将传入的参数合并为一个对象

```js
const cli = require('cac')()

cli
  .command('build', 'desc')
  .option('--env <env>', 'Set envs')
  .example('--env.API_SECRET xxx')
  .action((options) => {
    console.log(options)
  })

cli.help()

cli.parse()
```

<img width="500" alt="2018-11-25 9 37 53" src="https://user-images.githubusercontent.com/8784712/48979771-6ada9400-f0fa-11e8-8192-e541b2cfd9da.png">

### 默认指令

当没有其他指令被匹配时，默认指令会被调用

```js
const cli = require('cac')()

cli
  // 省略命令名称，只需要参数即可
  .command('[...files]', 'Build files')
  .option('--minimize', 'Minimize output')
  .action((files, options) => {
    console.log(files)
    console.log(options.minimize)
  })

cli.parse()
```

### 提供一个数组最为选项的值

当同一个参数名称多次传入参数，会将参数以数组的方式展现

```bash
node cli.js --include project-a
# The parsed options will be:
# { include: 'project-a' }

node cli.js --include project-a --include project-b
# The parsed options will be:
# { include: ['project-a', 'project-b'] }
```

### 错误处理

在全局范围内处理指令错误:

```js
try {
  // Parse CLI args without running the command
  cli.parse(process.argv, { run: false })
  // Run the command yourself
  // You only need `await` when your command action returns a Promise
  await cli.runMatchedCommand()
} catch (error) {
  // Handle error here..
  // e.g.
  // console.error(error.stack)
  // process.exit(1)
}
```
