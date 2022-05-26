module.exports = {
  presets: [
    // https://github.com/vuejs/vue-cli/tree/master/packages/@vue/babel-preset-app
    '@vue/cli-plugin-babel/preset'
  ],
  'env': {
    'development': {
      // Babel-plugin-dynamic-import-node插件只做一件事，将所有的import()转换为require()。
      // 当你有大量的页面时，这个插件可以显著提高热更新的速度。.
      // https://panjiachen.github.io/vue-element-admin-site/guide/advanced/lazy-loading.html
      'plugins': ['dynamic-import-node']
    }
  }
}
