'use strict'
const path = require('path')

// 基础的设置
const defaultSettings = require('./src/settings.js')

// 组合文件的路径
function resolve(dir) {
  return path.join(__dirname, dir)
}

// 设置默认页面的title
const name = defaultSettings.title || '看什么看'

// 如果您的端口设置为80，
// 使用管理员权限执行命令行。
// 例如:Mac: sudo npm run
// 可以通过以下方式修改端口:
// 所有配置项说明请参见  n https://cli.vuejs.org/config/
const port = process.env.port || process.env.npm_config_port || 9528 // dev port

module.exports = {

  // 如果你计划在子路径下部署你的网站，你需要设置publicPath
  // 例如GitHub页面。 如果您计划将站点部署到https://foo.github.io/bar/，
  // 则publicPath应该设置为“/bar/”。
  // 大多数情况下请使用'/' !!
  // 详情: https://cli.vuejs.org/config/#publicpath
  publicPath: '/',
  outputDir: 'dist', // 输出目录
  assetsDir: 'static', // 静态文件输出的目录
  lintOnSave: process.env.NODE_ENV === 'development', // 开启保存代码eslint检测代码
  productionSourceMap: false, // 关闭生产环境的SourceMap(就每次错误代码的提示精确到每个位置)
  devServer: {
    compress: true, // 启动静态文件压缩(压缩你的http请求数据)
    port: port, // 端口号
    open: true, // 自动打开浏览器
    host: 'localhost', // 域名
    overlay: { // 如果出现错误信息，不要全屏提示
      warnings: false,
      errors: true
    },
    // 这是mock数据
    before: require('./mock/mock-server.js')
    // 服务器代理，解决开发环境下跨域问题
    // proxy: {
    //   // 一旦devserver（3000）服务器接收到 /api/xxx的请求，就会把请求转发到另外一个服务器（3000）
    //   '/api': {
    //     target: process.env.VUE_APP_BASE_API, // 根据evn配置，配置生产开发的请求域名

    //     pathRewrite: { // 发送请求时，请求路径重写：将/api/xxx -> /xxx(去掉/api)
    //       '^/api': ''
    //     },
    //     changeOrigin: true // 是否更新代理后的请求的headers中的host地址
    //   }
    // }
  },
  // 合并webpack配置
  configureWebpack: {
    // 在webpack的name字段中提供应用程序的标题
    // 可以在index.html中访问，以注入正确的标题。
    name: name,
    resolve: { // 别名配置
      alias: {
        '@': resolve('src')
      }
    }
  },
  // 修改添加loader和plugin
  chainWebpack(config) {
    // 它可以提高第一个画面的速度，建议开启预加载
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // 当页面太多时，会导致太多无意义的请求
    config.plugins.delete('prefetch')

    // 设置 svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          // 其实我们发现打包生成的 runtime.js（wepack运行时文件）非常的小，gzip 之后一般只有几 kb，
          // 但这个文件又经常会改变，我们每次都需要重新请求它，它的 http 耗时远大于它的执行时间了，
          // 所以建议不要将它单独拆包，而是将它内联到我们的 index.html 之中(index.html 本来每次打包都会变)。
          // 这里我选用了 script - ext - html - webpack - plugin，主要是因为它还支持preload和 prefetch，
          // 正好需要就不想再多引用一个插件了，
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          // 分包，提取公共资源
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // 只对最初依赖的第三方进行打包
                },
                elementUI: {
                  name: 'chunk-elementUI', // 将elementUI拆分为单个包
                  priority: 20, // 权重需要大于libs和app，否则它将被打包到libs或app中
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // 为了适应CNPM
                },
                commons: {
                  name: 'chunk-commons', // 抽取公共的组件
                  test: resolve('src/components'), // 可以自定义规则
                  minChunks: 3, //  最少使用次数
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
          // 运行时代码 https://www.jianshu.com/p/714ce38b9fdc
          // 它的作用是将包含chunks 映射关系的 list单独从 app.js里提取出来，
          // 因为每一个 chunk 的 id 基本都是基于内容 hash 出来的，所以你每次改动都会影响它，
          // 如果不将它提取出来的话，等于app.js每次都会改变。缓存就失效了。
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
