/*
 * Visualization source
 */
// @ts-expect-error
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
  // @ts-expect-error
  SplunkVisualizationBase,
  // @ts-expect-error
  SplunkVisualizationUtils,
  // @ts-expect-error
  echarts
  // vizUtils
) {
  // Extend from SplunkVisualizationBase
  return SplunkVisualizationBase.extend({
    initialize: function () {
      this.chunk = 50000;
      this.offset = 0;
      SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
      // Initialization logic goes here
      this.el.classList.add("tree-container");
    },

    // Optionally implement to format data returned from search.
    // The returned object will be passed to updateView as 'data'
    // @ts-expect-error
    formatData: function (data) {
      // Format data

      return data;
    },

    // Implement updateView to render a visualization.
    //  'data' will be the data object returned from formatData or from the search
    //  'config' will be the configuration property object
    // @ts-expect-error
    updateView: function (data, config) {
      if (!data.rows || data.rows.length === 0 || data.rows[0].length === 0) {
        return this;
      }

      // updateview logic

      // | makeresults | eval s= "p1,p2,12-p1,p3-p4,p5-p3,p4-p5,p6-p3,p7-p8,p9-p9,p10-p8,p11"| eval s=split(s, "-") | mvexpand s|eval s=split(s, ",")|eval parent=mvindex(s,0), child=mvindex(s,1), value=mvindex(s,2)|table parent, child, value
      let inputData: BranchPair[] = data.rows;
      let f = new Forest(inputData);

      // create all elements first to get correct element sizes, then initialize charts
      for (const t in f.trees) {
        if (!document.getElementById(`tree-child-${t}`)) {
          let div = document.createElement("div");
          div.setAttribute("id", `tree-child-${t}`);
          this.el.appendChild(div);
        }
      }

      for (const t in f.trees) {
        let option = f.toEchartsOption(t);

        if (option) {
          let elem = document.getElementById(`tree-child-${t}`);
          let treeChart = echarts.init(elem);
          treeChart.setOption(option);
          console.log(JSON.stringify(option));
        }
      }

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

// TypeScript from here

class EchartsOption {
  // tooltip = {
  //   trigger: "item",
  //   triggerOn: "mousemove",
  // };
  legend = {
    top: "40",
    left: "80",
    orient: "vertical",
    data: [
      {
        name: "",
        icon: "rectangle",
      },
    ],
    borderColor: "#c23531",
  };
  series = [
    {
      type: /* ...................... */ "tree",
      name: /* ...................... */ "Tree",
      data: /* ...................... */ [] as Branch[],
      top: /* ....................... */ "24",
      left: /* ...................... */ "32",
      bottom: /* .................... */ "24",
      right: /* ..................... */ "32",
      symbolSize: /* ................ */ 7,
      label: /* ..................... */ {
        position: /* ................ */ "left",
        verticalAlign: /* ........... */ "middle",
        align: /* ................... */ "right",
      },
      leaves: /* .................... */ {
        label: /* ................... */ {
          position: /* .............. */ "right",
          verticalAlign: /* ......... */ "middle",
          align: /* ................. */ "left",
        },
      },
      emphasis: /* .................. */ {
        focus: /* ................... */ "descendant",
      },
      expandAndCollapse: /* ......... */ true,
      animationDuration: /* ......... */ 550,
      animationDurationUpdate: /* ... */ 750,
    },
  ];
  constructor(b: Branch) {
    this.series[0].data = [b];
  }
}

type NumberOrEmptyString = number | "";
type BranchPair = [string, string, NumberOrEmptyString?]; // parent, child, child value

interface Branch {
  name: string;
  value: number | "";
  children: Branch[];
}

class Forest {
  trees: { [propName: string]: Branch } = {};
  branches: { [propName: string]: Branch } = {};

  constructor(pairs: BranchPair[]) {
    for (const p of pairs) {
      this.addBranchPair(p[0], p[1], p[2] || "");
    }
  }

  addBranchPair(tid: string, bid: string, v: number | "") {
    if (!this.branches.hasOwnProperty(tid)) {
      this.trees[tid] = this.createBranch(tid);
      this.branches[tid] = this.trees[tid];
    }
    if (!this.branches.hasOwnProperty(bid)) {
      this.branches[bid] = this.createBranch(bid, v);
    } else {
      if (this.trees[bid]) {
        delete this.trees[bid];
      }
    }
    this.branches[tid].children.push(this.branches[bid]);
  }

  createBranch(id: string, v: number | "" = ""): Branch {
    return { name: id, value: v, children: [] };
  }

  toEchartsOption(t: string): EchartsOption | false {
    if (this.trees[t]) {
      let s = new EchartsOption(this.trees[t]);
      s.series[0].name = t;
      s.legend.data[0].name = t;
      return s;
    }
    return false;
  }
}
