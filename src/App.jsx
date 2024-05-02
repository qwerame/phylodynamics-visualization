import './App.css'

import Panel from "./components/Panel";
import {useEffect, useState} from "react";
// import GeographicDiv from "./components/GeographicDiv";
import GridGeographicDiv from "./components/GridGeographicDiv/index.jsx";
import TreeStructureDiv from "./components/TreeStructureDiv/index.jsx";
// import constraint from "./data/constraint.json"
//
// import gridConstraints from "./data/USA_constraint.json"
// import raw_nodes from "./data/USA_node.json"
// import raw_links from "./data/USA_edge.json"
// import raw_tree from "./data/USA_tree.json"

// import gridConstraints from "./data/africa_constraint.json"
// import raw_nodes from "./data/africa_node.json"
// import raw_links from "./data/africa_edge.json"
// import raw_tree from "./data/africa_tree.json"

import gridConstraints from "./data/china_constraint.json"
import raw_nodes from "./data/china_node.json"
import raw_links from "./data/china_edge.json"
import raw_tree from "./data/china_tree.json"

import {ValueProvider} from "./context.jsx";
import {generateColor} from "./utils.js";
import LineChartNodeDetail from "./components/DetailCard/LineChartNodeDetail.jsx";
import NodeDetail from "./components/DetailCard/NodeDetail.jsx";
import VariationDetail from "./components/DetailCard/VariationDetail.jsx";


function App() {
    const [initValue, setInitValue] = useState()
    useEffect(() => {
        setInitValue({
            startColor: 'rgb(255,240,230)',
            endColor: 'rgb(255, 0, 0)',
            selectedId: '++', // location id
            time: raw_nodes.time_info.end_time,
            filtered_start_time: raw_nodes.time_info.end_time,
            raw_nodes: raw_nodes,
            raw_links: raw_links,
            // constraint: constraint,
            startTime: raw_nodes.time_info.start_time,
            endTime: raw_nodes.time_info.end_time,
            nodes_map: raw_nodes.nodes_map,
            raw_tree_nodes: raw_tree.nodes,
            tree_root: raw_tree.tree_info.root,
            x_span: raw_tree.tree_info.xSpan,
            raw_leaves: raw_tree.leaves,
            color_map: generateColor(Object.values(raw_nodes.nodes_map)),
            grid_constraint: gridConstraints.groups,
            grid_columns: gridConstraints.info.columns,
            grid_rows: gridConstraints.info.rows,
            detail_node_info: null,
            hovered_location: null,
            hovered_variation_info: null,
            selectedNodeId: null, // node id in tree structure
            selectedNodeIdList: null,
            display_time_axis: raw_nodes.time_axis,
            maxLength: Math.max(...Object.values(raw_nodes.nodes).map(item => item.time_list.length)),
            span_record: raw_tree.span_record, //used in line chart
            max_ref: raw_tree.max_ref, // used as the max y-axis in line chart
            line_chart_node_info: null
        })
    }, []);


    return (
        <>
            {
                initValue ?
                    <ValueProvider init={initValue}>
                        {/*<GeographicDiv/>*/}
                        <GridGeographicDiv/>
                        <TreeStructureDiv/>
                        <Panel/>
                        <LineChartNodeDetail></LineChartNodeDetail>
                        <NodeDetail></NodeDetail>
                        <VariationDetail></VariationDetail>
                    </ValueProvider> : null
            }
        </>
    )
}

export default App
