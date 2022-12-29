# Tree

A chart to display hierarchical data.

## Usage

This chart expects tabular data with 2 or 3 columns of data. Column three is optional but must be a number when present. It interprets first column as parent node and second column as child node. The value of third optional column is displayed when hovering on a child node. You can click on non-leaf nodes to expand/collapse tree/subtrees. If values of first and second columns are equal for row of data, that row will be discarded.

### Examples

```
index=main source="t2.json"
| rename Event.EventData.ParentProcessName as parent, Event.EventData.NewProcessName as child, Event.EventData.ProcessId as parent_id, Event.EventData.NewProcessId as child_id
| eval parent = if(parent = "", parent_id, parent . " - " . parent_id), child = if(child = "", child_id, child . " - " . child_id)
| table parent, child
```

![processes](/static/x1.png)

```
| makeresults
| eval s="p1,p2,12.1-p1,p3,33-p4,p5-p3,p4-p5,p6-p3,p7-p8,p9-p9,p10-p8,p11-p3,p7-p1,p2-p1,p2-p1,p1-p7,p11-p12,p13-p13,p14-p12,p15-p15,p16-p13,p17-p15,p18"
| eval s=split(s, "-")
| mvexpand s
| eval s=split(s, ",")
| eval parent=mvindex(s,0), child=mvindex(s,1), optional_child_value=mvindex(s,2)
| table parent, child, optional_child_value
```

![multiple trees](/static/x2.png)

## Third party software

[Apache ECharts](https://echarts.apache.org/)
