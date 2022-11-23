/*
 * Visualization source
 */
define([
  // 'jquery',
  // 'underscore',
  "api/SplunkVisualizationBase",
  "api/SplunkVisualizationUtils",
  "echarts",
  // Add required assets to this list
], function (
  // $,
  // _,
  SplunkVisualizationBase,
  SplunkVisualizationUtils,
  echarts
  // vizUtils
) {
  // Extend from SplunkVisualizationBase
  return SplunkVisualizationBase.extend({
    initialize: function () {
      this.chunk = 50000;
      this.offset = 0;
      // SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
      // this.$el = $(this.el);
      // this.$el.append('<h3>This is a custom visualization stand in.</h3>');
      // this.$el.append('<p>Edit your custom visualization app to render something here.</p>');
      // Initialization logic goes here
    },

    // Optionally implement to format data returned from search.
    // The returned object will be passed to updateView as 'data'
    formatData: function (data) {
      // Format data

      return data;
    },

    // Implement updateView to render a visualization.
    //  'data' will be the data object returned from formatData or from the search
    //  'config' will be the configuration property object
    updateView: function (data, config) {
      if (!data.rows || data.rows.length === 0 || data.rows[0].length === 0) {
        return this;
      }

      // updateview logic
      let myChart = echarts.init(this.el);
      let option;

      option = {
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: "line",
            areaStyle: {},
          },
        ],
      };

      myChart.setOption(option);

      this.offset += data.rows.length;
      this.updateDataParams({ count: this.chunk, offset: this.offset });
    },

    // Search data params
    getInitialDataParams: function () {
      return {
        outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
        count: 10000,
      };
    },

    // Override to respond to re-sizing events
    reflow: function () {},
  });
});
