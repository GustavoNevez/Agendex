// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Filtra o source-map-loader dos arquivos CSS do rsuite
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOf) => {
            if (
              oneOf.test &&
              oneOf.test.toString().includes('css') &&
              oneOf.use
            ) {
              // Desativa sourceMap no css-loader
              oneOf.use.forEach((loader) => {
                if (
                  typeof loader === 'object' &&
                  loader.loader &&
                  loader.loader.includes('css-loader')
                ) {
                  loader.options = {
                    ...loader.options,
                    sourceMap: false,
                  };
                }
              });

              // Remove qualquer uso de source-map-loader
              oneOf.use = oneOf.use.filter(
                (loader) =>
                  typeof loader !== 'object' ||
                  !(
                    loader.loader &&
                    loader.loader.includes('source-map-loader')
                  )
              );
            }
          });
        }
      });

      // Remove completamente warnings de source-map do rsuite
      webpackConfig.ignoreWarnings = [
        (warning) =>
          warning.message &&
          warning.message.includes('Failed to parse source map') &&
          (warning.module?.resource.includes('rsuite') ||
           warning.module?.resource.includes('rsuite-table')),
      ];

      return webpackConfig;
    },
  },
};
