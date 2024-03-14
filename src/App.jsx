import './App.css'

import Panel from "./components/Panel";
import {useEffect, useState} from "react";
import GeographicDiv from "./components/GeographicDiv";
import TreeStructureDiv from "./components/TreeStructureDiv/index.jsx";

import constraint from "./data/constraint.json"
import raw_nodes from "./data/output_node.json"
import raw_links from "./data/output_edge.json"
import raw_tree from "./data/output_tree.json"
import {ValueProvider} from "./context.jsx";
import {generateColor} from "./utils.js";


function App() {
    const [initValue, setInitValue] = useState()
    useEffect(() => {
        setInitValue({
            startColor: 'rgb(249, 249, 249)',
            endColor: 'rgb(255, 0, 0)',
            selectedId: '++',
            time: raw_nodes.time_info.end_time,
            raw_nodes: raw_nodes,
            raw_links: raw_links,
            constraint: constraint,
            startTime: raw_nodes.time_info.start_time,
            endTime: raw_nodes.time_info.end_time,
            nodes_map: raw_nodes.nodes_map,
            raw_tree_nodes: raw_tree.nodes,
            tree_root: raw_tree.tree_info.root,
            x_span: raw_tree.tree_info.xSpan,
            raw_leaves: raw_tree.leaves,
            color_map: generateColor(Object.values(raw_nodes.nodes_map))
        })
    }, []);


    return (
        <>
            {
                initValue ?
                    <ValueProvider init={initValue}>
                        <GeographicDiv/>
                        <TreeStructureDiv/>
                        <Panel/>
                    </ValueProvider> : null
            }
        </>
    )
}

export default App
