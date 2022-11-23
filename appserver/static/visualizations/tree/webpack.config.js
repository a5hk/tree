var path = require("path");

module.exports = {
  entry: "visualization_source",
  resolve: {
    modules: [path.join(__dirname, "src"), "node_modules"],
  },
  output: {
    filename: "visualization.js",
    path: path.resolve(__dirname),
    libraryTarget: "amd",
  },
  externals: ["api/SplunkVisualizationBase", "api/SplunkVisualizationUtils"],
};
