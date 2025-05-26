module.exports = {
  // ...existing code...
  module: {
    rules: [
      // ...existing rules...
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        enforce: 'pre',
        loader: 'source-map-loader',
        exclude: [
          /node_modules\/rsuite\/dist\/styles/,
          /\.css$/
        ]
      },
      // ...existing rules...
    ]
  },
  // ...existing code...
  ignoreWarnings: [
    {
      message: /Failed to parse source map from '.*rsuite.*index\.css\.map'/
    }
  ]
  // ...existing code...
};