# 源码学习 - CAC

根据崔大给出的问题项目中的各个问题作出解答, 初次读源码，很多地方查询的资料不完善，理解的不到位甚至错误的，请大佬指正

## 代码使用

项目地址:https://github.com/cacjs/cac

依赖安装

```bash
yarn install
```

运行测试

```bash
yarn test
```

# 问题解答

## 分析目录

- 什么类型的文件放到什么文件夹内
.github: 放入与 git 相关文件
examples: 放入项目示例代码
scripts: 放入项目相关的脚本文件
src: 项目源码
src/test: 项目测试代码
在根目录下放入项目相关的配置文件

- 一般都会有几个文件夹

  会有`src`,`test`,`examples`为主要文件夹，其余一些根据项目功能配置其他文件夹

## .editorconfig 是干嘛的

.ediortconfig 是一个定义编码风格的配置文件。为了能够在不同的 IDE 环境中使用相同编码规范，使代码规范和风格能够统一。

[官网](https://editorconfig.org/)  
[vscode 插件](https://github.com/editorconfig/editorconfig-vscode)

## .gitattributes 是干嘛的

每当有文件保存或者创建时，git 根据.gitattributes 中的属性来自动保存。

我的理解就是类似一个勾子，当保存或者创建时会对文件进行一次处理，然后再进行保存。

作为一个开源库来说，不能保证其他代码贡献者的操作系统，代码编辑器是一致的，最常见的列子就是在 windows 系统下行尾符号为 CRLF 而在 Linux/MacOS 上是 LF，这样就会导致部分编辑器的警告.

在这个项目中使用了`* text=auto`，意思是对任何文件设置 text=auto，会对行尾符号自动转换。 如果是文本文件就转换为 LF，如果已经在 git 库中文件为 CRLF，则再次保存时不会保存为 LF，这样就保持了文件行尾符号的一致.

[什么是 .gitattributes ？](https://zhuanlan.zhihu.com/p/108266134)
[Git 的 gitattributes 文件详解](https://blog.csdn.net/taiyangdao/article/details/78484623)
[.gitattributes 文件](https://blog.csdn.net/hxxjxw/article/details/120110165)

## 持续集成是如何实现的

在这个项目中是用 CircleCI 实现的.

- cicle.yml 是如何配置的

```yml
# CircleCI的版本号
version: 2
# 具体工作清单
jobs:
  # 默认job
  build:
    # 使用的环境
    docker:
      - image: circleci/node:12
    # 忽略掉不需要的分支
    branches:
      ignore:
        - gh-pages # list of branches to ignore
        - /release\/.*/ # or ignore regexes
    # 执行步骤
    steps:
      # 代码检出
      - checkout
      # 恢复缓存
      - restore_cache:
          key: dependency-cache-{{ checksum "yarn.lock" }}
      # 安装依赖
      - run:
          name: install dependences
          command: yarn
      # 保存依赖缓存
      - save_cache:
          key: dependency-cache-{{ checksum "yarn.lock" }}
          paths:
            - ./node_modules
      # 运行覆盖测试
      - run:
          name: test
          command: yarn test:cov
      # 上传测试结果
      - run:
          name: upload coverage
          command: bash <(curl -s https://codecov.io/bash)
      # 发布代码
      - run:
          name: Release
          command: yarn semantic-release
```

[官方文档](https://circleci.com/docs)
[使用 CircleCI 2.0 进行持续集成/持续部署](https://www.jianshu.com/p/36af6af74dfc)

## 分析一下单元测试环境是如何搭建的

- ts-jest 是解决什么问题的

  ts-jest 主要是对项目代码进行测试，保证代码能够者正确运行，或者以测试为驱动,进行代码编写

- 如果没有 ts-jest 的话 你会搭建基于 ts 的 jest 环境嘛？写个 demo?

  写了个 demo，demo 中详细的写了搭建的方法，参考了崔大在 B 站中的[视频](https://www.bilibili.com/video/BV1R341177P7?share_source=copy_web).
  [demo 地址](https://github.com/Sky-star/ts-jest-demo)

- 分析一下 jest.config.js 这几个字段有什么用?

  [官方配置文档](https://jestjs.io/zh-Hans/docs/configuration)

  项目中的配置:

  ```js
  module.exports = {
  	testEnvironment: "node",
  	transform: {
  		"^.+\\.tsx?$": "ts-jest"
  	},
  	testRegex: "(/__test__/.*|(\\.|/)(test|spec))\\.tsx?$",
  	testPathIgnorePatterns: ["/node_modules/", "/dist/", "/types/"],
  	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
  }
  ```

  testEnviroment: 测试所用的环境，默认是 node

  transform: 将通过正则表达式匹配到的文件，使用对应的预处理器处理.jest 默认并不能处理类似 js,jsx,ts,tsx 的文件，需要 babel-jest 进行转换

  testRegex: 通过正则表达式匹配需要进行测试的文件，上边的代码中是默认值

  testPathIgnorePatterns: 需要忽略测试路径，默认值为`node_modules`,将第三方库中的测试文件忽略掉

  moduleFileExtensions: 模块所需要的文件扩展名，如果不写文件扩展名会从左到右进行查找，所以要将项目中最通用的文件扩展名写在最左侧，方便查找，这也是为什么这个库会将 ts,tsx 写在最左侧

  ## 分析一下 package.json 里面的字段都是干嘛的

  [官方文档](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)

  根据 cac 中 package.json 进行说明

  name: 库名称,如果打算发布则是必填项否则可以不写
  version: 版本号,与 name 相同，要么必须写，要么可以不写
  description: 项目描述
  repository: 指定代码存放位置
  main: 项目入口文件,这里指的是打包后的入口文件，如果不设置默认为`index.js`
  module: 定义 ESM 规范的入口文件
  types: 如果你的包有一个主 .js 文件，你还需要在你的 package.json 文件中指明主声明文 件。 将 types 属性设置为指向捆绑的声明文件. 这是用 ts 发布库中使用的[配置](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
  exports: 表示 imports/require 的路径
  files: 包被 install 后会有哪些文件,也就是说最后发布后上传的文件
  scripts: 可运行的脚本，一般有调试，测试，打包等命令
  author: 作者
  license: 仓库协议
  devDependencies: 开发依赖,不会打包进发布包中
  engines:环境需要支持的版本,但是除非设置了`engine-strict`,否则安装依赖时只会出现警告
  release: 没查到，我猜应该是需要发布的分支
  config: 配置命令行中的环境参数，并且可以通过命令行改变它，从而再次执行时对引用了环境参数的指令发生变化
  lint-staged: lint 配置使用
  husky: git 提交钩子，在 commit 之前进行操作

## 发布一个库需要用到哪些字段

总结后所需要的字段有: name, version, main, module, types(如果是 ts 写的), exports, files,
author, license

## 写一个库的 README 需要那几个部分

Logo,Badge,介绍，库的特性，内容列表,内容列表下主要包括库如何安装，如何使用，以及详细 API 的 doc 链接，后面就是一些协议，作者，以及代码贡献者

## 构建是如何做的？

通过打包的入口文件，对项目中所需要的所有模块，打包到一起一个 build.js 中.
对于本项目而言 rollup 原生支持了 tree-shaking，也就是树摇.对于在打包中并未使用到的代码剔除掉，从而能够是打包的体积边小且精简.

- 主要分析 rollup.config.js
  [官方解释文档](https://rollupjs.org/guide/en/#input)
  用`createConfig`通用函数来分别处理 ts 和 esm 模块输出文件,
  input: 入口文件
  output: {
  file: 输出后的文件
  format: 输出文件格式
  exports:导出模式
  }
  plugins:打包时使用的插件

## 分析一下 tsconfig 里面的配置项

[文档](http://www.patrickzhong.com/TypeScript/zh/project-config/compiler-options.html#%E7%BC%96%E8%AF%91%E9%80%89%E9%A1%B9-1)

```json
{
  "compilerOptions": {
    # 指定ESM目标版本为ES6
    "target": "es2015",
    # 生成响应的.d.ts文件
    "declaration": true,
    # 生成声明文件的输出路径,就是package.json中的types
    "declarationDir": "types",
    # 支持在 CommonJs 模块下使用 import d from 'cjs'
    "esModuleInterop": true,
    # 给错误和消息设置样式，使用颜色和上下文。
    "pretty": true,
    # 决定如何处理模块
    "moduleResolution": "node",
    # 编译过程中需要引入的库文件的列表
    "lib": ["es2015", "es2016.array.include"],
    # 允许从没有设置默认导出的模块中默认导入
    "allowSyntheticDefaultImports": true,
    "stripInternal": true,
    # 在表达式和声明上有隐含的any类型时报错
    "noImplicitAny": true,
    # 不是函数的所有返回路径都有返回值时报错
    "noImplicitReturns": true,
    # 当this表达式的值为any类型的时候，生成一个错误
    "noImplicitThis": true,
    # 若有未使用的局部变量则抛错
    "noUnusedLocals": true,
    # 若有未使用的参数则抛错
    "noUnusedParameters": true,
    # 不允许switch中的case语句贯穿
    "noFallthroughCasesInSwitch": true,
    # 在严格的null检查模式下，null和undefined值不包含在任何类型里，只允许用它们自己和any来赋值（有个例外，undefined可以赋值到void）
    "strictNullChecks": true,
    # 禁用函数参数双向协变检查
    "strictFunctionTypes": true,
    # 确保类的非undefined属性已经在构造函数里初始化。若要令此选项生效，需要同时启用strictNullChecks
    "strictPropertyInitialization": true,
    # 以严格模式解析并为每个源文件生成"use strict"语句
    "alwaysStrict": true,
    # 指定生成哪个模块系统代码
    "module": "commonjs",
    # 重定向输出目录
    "outDir": "lib"
  },
  # 使用编译选项的文件列表
  "include": ["src", "declarations.d.ts"],
  # 不使用编译选项的文件列表
  "exclude": ["src/deno.ts"]
}
```

## 画一下这个库的程序流程图

## 尝试通过单元测试调试库

## 这个库应该如何使用
[部分翻译文档](./HowToUse.md)

## 如何理解 option

## 如何理解 command

## 如何理解 action

## 如何实现连续调用api

## Brackets 应该如何使用

## Brackets 是如何实现的

## Negated Options 是如何实现的

## 分析一下下面这段代码的执行流程
```js
    const cli = require('cac')()
    
    cli
        .command('build', 'desc')
        .option('--env <env>', 'Set envs')
        .example('--env.API_SECRET xxx')
        .action(options => {
            console.log(options)
        })
    
    cli.help()
    
    cli.parse()
```

## 还可以从功能上分解需求点

## 程序等于数据结构 + 算法