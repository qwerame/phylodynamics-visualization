import './App.css'

import Panel from "./components/Panel";
import {useEffect, useState} from "react";
import GeographicDiv from "./components/GeographicDiv";
import GridGeographicDiv from "./components/GridGeographicDiv/index.jsx";
import TreeStructureDiv from "./components/TreeStructureDiv/index.jsx";
// import constraint from "./data/constraint.json"
//
import gridConstraints from "./data/grid_constraint.json"
import raw_nodes from "./data/output_node.json"
import raw_links from "./data/output_edge.json"
import raw_tree from "./data/output_tree.json"
// import gridConstraints from "./data/constraint_aferica.json"
// import raw_nodes from "./data/node_aferica.json"
// import raw_links from "./data/edge_aferica.json"
// import raw_tree from "./data/tree_aferica.json"

import {ValueProvider} from "./context.jsx";
import {generateColor} from "./utils.js";


function App() {
    const [initValue, setInitValue] = useState()
    useEffect(() => {
        setInitValue({
            startColor: 'rgb(255,240,230)',
            endColor: 'rgb(255, 0, 0)',
            selectedId: '++', // location id
            time: raw_nodes.time_info.end_time,
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
                    </ValueProvider> : null
            }
        </>
    )
}

export default App
