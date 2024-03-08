import './App.css'

import Panel from "./components/Panel";
import {useEffect, useState} from "react";
import GeographicDiv from "./components/GeographicDiv";

import constraint from "./data/constraint.json"
import raw_nodes from "./data/output_node.json"
import raw_links from "./data/output_edge.json"
import {ValueProvider} from "./context.jsx";

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
            endTime: raw_nodes.time_info.end_time
        })
    }, []);


    return (
        <>
            {
                initValue ?
                    <ValueProvider init={initValue}>
                        <GeographicDiv/>
                        <Panel/>
                    </ValueProvider> : null
            }
        </>
    )
}

export default App
