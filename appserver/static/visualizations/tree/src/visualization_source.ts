// @ts-expect-error
define(["api/SplunkVisualizationBase", "api/SplunkVisualizationUtils", "echarts"], function (
  // @ts-expect-error
  SplunkVisualizationBase,
  // @ts-expect-error
  SplunkVisualizationUtils,
  // @ts-expect-error
  echarts
) {
  return SplunkVisualizationBase.extend({
    initialize: function () {
      this.chunk = 1000;
      this.offset = 0;
      SplunkVisualizationBase.prototype.initialize.apply(this, arguments);

      this.el.classList.add("a5hk-tree-container");
      this.idPrefix = "a5hk-tree-child-";
    },

    // @ts-expect-error
    formatData: function (data) {
      if (data.fields.length == 0 || data.rows.length == 0) {
        return data;
      }

      if (data.rows.length > 1000) {
        throw new SplunkVisualizationBase.VisualizationError(
          "Data is too large: This visualization supports up to 1000 rows of data."
        );
      }

      return data;
    },

    // @ts-expect-error
    updateView: function (data, config) {
      if (!data.rows || data.rows.length === 0 || data.rows[0].length === 0) {
        return this;
      }

      const inputData: Edge[] = data.rows;
      const conf = new Config(config, SplunkVisualizationUtils.getCurrentTheme());
      const forest = new Forest(inputData);

      // create all elements first to get correct element sizes, then initialize charts
      for (const tree in forest.trees) {
        if (!document.getElementById(`${this.idPrefix}${tree}`)) {
          let div = document.createElement("div");
          div.setAttribute("id", `${this.idPrefix}${tree}`);
          this.el.appendChild(div);
        }
      }

      for (const tree in forest.trees) {
        let opt = option(forest.trees[tree], conf);

        if (opt) {
          let elem = document.getElementById(`${this.idPrefix}${tree}`);
          let treeChart = this.initChart(elem);
          treeChart.setOption(opt);
        }
      }
    },

    getInitialDataParams: function () {
      return {
        outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
        count: 1000,
      };
    },

    reflow: function () {
      document.querySelectorAll(`[id^=${this.idPrefix}]`).forEach((e) => {
        echarts.getInstanceByDom(e).resize();
      });
    },

    initChart: function (e: HTMLElement) {
      if (SplunkVisualizationUtils.getCurrentTheme() == "dark") {
        return echarts.init(e, "dark");
      }
      return echarts.init(e);
    },
  });
});

// TypeScript from here

type Direction = "LR" | "RL" | "TB" | "BT";

class Config {
  background: string;
  foreground: string;
  layout: "orthogonal" | "radial";
  direction: Direction;
  itemcolor: string;

  constructor(c: { [key: string]: string }, mode: string) {
    this.background = mode === "dark" ? "#333" : "#fff";
    this.foreground = mode === "dark" ? "#fff" : "#333";
    const layout = c["display.visualizations.custom.tree_viz.tree.direction"];
    this.layout = layout === "radial" ? "radial" : "orthogonal";
    this.direction = ["LR", "RL", "TB", "BT"].includes(layout) ? (layout as Direction) : "LR";
    this.itemcolor = c["display.visualizations.custom.tree_viz.tree.itemcolor"];
  }
}

function option(data: Tree, conf: Config) {
  return {
    toolbox: {
      feature: {
        saveAsImage: {
          backgroundColor: conf.background,
          name: "tree-chart",
        },
      },
    },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    series: [
      {
        type: /* ...................... */ "tree",
        // name: /* ................... */ "Tree",
        color: /* ..................... */ [] as string[],
        data: /* ...................... */ [data],
        top: /* ....................... */ "16",
        left: /* ...................... */ "32",
        bottom: /* .................... */ "16",
        right: /* ..................... */ "32",
        symbolSize: /* ................ */ 7,
        initialTreeDepth: /* .......... */ 3,
        layout: /* .................... */ conf.layout,
        orient: /* .................... */ conf.direction,
        itemStyle: /* ................. */ {
          color: /* ................... */ conf.itemcolor,
        },
        label: /* ..................... */ {
          position: /* ................ */ "right",
          verticalAlign: /* ........... */ "bottom",
          align: /* ................... */ "left",
          padding: /* ................. */ [0, 0, 8, -14],
          rotate: /* .................. */ 0,
        },
        leaves: /* .................... */ {
          label: /* ................... */ {
            position: /* .............. */ "left",
            verticalAlign: /* ......... */ "bottom",
            align: /* ................. */ "right",
            overflow: /* .............. */ "truncate",
            rotate: /* ................ */ 0,
          },
        },
        emphasis: /* .................. */ {
          focus: /* ................... */ "descendant",
        },
        expandAndCollapse: /* ......... */ true,
        animationDuration: /* ......... */ 550,
        animationDurationUpdate: /* ... */ 750,
      },
    ],
  };
}

type NumberOrEmptyString = number | "";
type Edge = [parnet: string, child: string, childValue?: NumberOrEmptyString];

interface Tree {
  name: string;
  value: number | "";
  children: Tree[];
}

class Forest {
  trees: { [propName: string]: Tree } = {};
  subtrees: { [propName: string]: Tree } = {};
  // conf: Config;

  constructor(edges: Edge[]) {
    // this.conf = conf;

    for (const edge of edges) {
      this.addEdge(edge[0], edge[1], edge[2] ?? "");
    }
  }

  addEdge(treeId: string, subtreeId: string, value: number | "") {
    if (treeId == subtreeId) {
      return;
    }

    if (treeId === "" || treeId === null) {
      treeId = "Data is missing!";
    }
    if (subtreeId === "" || subtreeId === null) {
      subtreeId = "Data is missing!";
    }

    if (this.isANewTree(treeId)) {
      this.trees[treeId] = this.edgeToNode(treeId);
      this.subtrees[treeId] = this.trees[treeId];
    }

    if (this.isANewSubtree(subtreeId)) {
      this.subtrees[subtreeId] = this.edgeToNode(subtreeId, value);
      this.subtrees[treeId].children.push(this.subtrees[subtreeId]);
    } else {
      if (this.trees[subtreeId]) {
        this.subtrees[treeId].children.push(this.subtrees[subtreeId]);
        delete this.trees[subtreeId];
      }
    }
  }

  edgeToNode(id: string, v: number | "" = ""): Tree {
    return { name: id, value: v, children: [] };
  }

  isANewTree(treeId: string) {
    return !this.subtrees.hasOwnProperty(treeId);
  }

  isANewSubtree(subtreeId: string) {
    return this.isANewTree(subtreeId);
  }
}
