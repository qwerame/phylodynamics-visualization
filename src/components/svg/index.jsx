import {useCallback, useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import * as cola from "webcola";
import constraint from "../../data/constraint.json"
import raw_nodes from "../../data/output_node.json"
import raw_links from "../../data/output_edge.json"


const Svg = (props) => {
    const {startColor, endColor, sourceColor, targetColor, time} = props

    const width = 850; // outer width, in pixels
    const height = 850; // outer height, in pixels

    const [marginX, setMarginX] = useState();
    const [marginY, setMarginY] = useState();

    const svgRef = useRef();

    const [ratio, setRatio] = useState();

    const [xReferenceNodes, setXReferenceNodes] = useState()
    const [yReferenceNodes , setYReferenceNodes] = useState()
    const [constraints, setConstraints] = useState()

    const [nodes, setNodes] = useState();
    const [fakeNodes, setFakeNodes] = useState();

    const [links, setLinks] = useState();

    const [startTime, setStartTime] = useState();
    const [endTime, setEndTime] = useState();

    const [selectedId, setSelectedId] = useState("++");

    const getRandom = useCallback( (min, max) => {
        return Math.random() * (max - min) + min + 30
    }, [])

    // to make small nodes visible
    const lenToR = useCallback((len) => {
        return len === 0 ? 0 : (len < 10 ? 10 - 1 / len : len)
    }, [])

    // generate radius
    const getR = useCallback((label, time, startTime, endTime, ratio) => {
        const new_list = raw_nodes.nodes[label].time_list.filter(item => item < startTime * (1 - time) + endTime * time)
        // console.log(new_list)
        return lenToR(new_list.length) * ratio / 2
    }, [lenToR])

    // used for coloring the nodes
    const normalizeTime = useCallback((time) => {
        return (time - startTime) / (endTime - startTime)
    }, [endTime, startTime])

    // generate fake nodes at the corner of the svg to limit all the nodes within the boundary
    const generateFakeNodes = useCallback(() => {
        setFakeNodes([
            {
                id: Object.keys(raw_nodes.nodes).length.toString(),
                fixed: true,
                fixedWeight: 100,
                time_list: [2022,2023],
                label: "bottom_left",
                r: 1,
                x: 0,
                y: height
            },
            {
                id: (Object.keys(raw_nodes.nodes).length + 1).toString(),
                fixed: true,
                fixedWeight: 100,
                r: 1,
                label: "top_right",
                x: width,
                y: 0
            }
        ])
    }, [])


    // generate ratio, marginX, marginY, xReferenceArray, yReferenceArray
    const generateRatio = useCallback( () => {
        const reference_x = []
        const sum_x = constraint.x_constraint.reduce((accumulator, currentValue) => {
            const len_map = new Map(currentValue.map(d => [raw_nodes.nodes[d].time_list.length, d]));
            const len_max = Math.max(...len_map.keys())
            const max_location = len_map.get(len_max)
            console.log(max_location)
            reference_x.push({id: raw_nodes.nodes[max_location].id, length: len_max})
            console.log(reference_x)
            return accumulator + lenToR(len_max)
        }, 0);
        const reference_y = []
        const sum_y = constraint.y_constraint.reduce((accumulator, currentValue) => {
            const len_map = new Map(currentValue.map(d => [raw_nodes.nodes[d].time_list.length, d]));
            const len_max = Math.max(...len_map.keys())
            const max_location = len_map.get(len_max)
            // console.log(max_location)
            reference_y.push({id: raw_nodes.nodes[max_location].id, length: len_max})
            // console.log(reference_y)
            return accumulator + lenToR(len_max)
        }, 0);

        const temp_ratio = width * 0.5 / Math.max(sum_x, sum_y)
        setRatio(temp_ratio)
        setXReferenceNodes(reference_x)
        setYReferenceNodes(reference_y)
        // console.log(reference_y)
        setMarginX((width - sum_x * temp_ratio)/reference_x.length)
        setMarginY((height - sum_y * temp_ratio)/reference_y.length)

    }, [])

    // generate constraints (after generateRatio)
    useEffect(() => {
        if(marginX && marginY && ratio && xReferenceNodes && yReferenceNodes && fakeNodes){
            const temp_constraints = []

            // avoid group overlap
            for (let i = 0; i < xReferenceNodes.length - 1; i++) {
                // console.log(constraint.x_constraint[i])
                temp_constraints.push({
                    "axis": "x",
                    "left": xReferenceNodes[i].id,
                    "right": xReferenceNodes[i + 1].id,
                    "gap": (lenToR(xReferenceNodes[i].length)  + lenToR(xReferenceNodes[i + 1].length)) * ratio / 2 + marginX
                })
            }
            for (let i = 0; i < yReferenceNodes.length - 1; i++) {
                // console.log(constraint.x_constraint[i])
                temp_constraints.push({
                    "axis": "y",
                    "left": yReferenceNodes[i + 1].id,
                    "right": yReferenceNodes[i].id,
                    "gap": (lenToR(yReferenceNodes[i].length)  + lenToR(yReferenceNodes[i + 1].length)) * ratio / 2 + marginY
                })
            }

            // not exceeding the boundary
            temp_constraints.push({
                "axis": "x",
                // "type": "separation",
                "left": fakeNodes[0].id,
                "right": xReferenceNodes[0].id,
                "gap": (lenToR(xReferenceNodes[0].length) + marginX) * ratio / 2

            })
            temp_constraints.push({
                "axis": "x",
                // "type": "separation",
                "left": xReferenceNodes[xReferenceNodes.length - 1].id,
                "right": fakeNodes[1].id,
                "gap": (lenToR(xReferenceNodes[xReferenceNodes.length - 1].length) + marginX) * ratio / 2

            })
            temp_constraints.push({
                "axis": "y",
                // "type": "separation",
                "left": yReferenceNodes[0].id,
                "right": fakeNodes[0].id,
                "gap":  (lenToR(yReferenceNodes[0].length) + marginY) * ratio / 2

            })
            temp_constraints.push({
                "axis": "y",
                // "type": "separation",
                "left": fakeNodes[1].id,
                "right": yReferenceNodes[yReferenceNodes.length - 1].id,
                "gap":  (lenToR(yReferenceNodes[yReferenceNodes.length - 1].length) + marginY) * ratio / 2

            })

            // alignment within the group
            constraint.x_constraint.forEach((item, groupIndex) => {
                if(item.length > 1){
                    const offsets = item.map((location) => {
                        return {
                            "node": raw_nodes.nodes[location].id,
                            "offset": getRandom(lenToR(raw_nodes.nodes[location].time_list.length) - lenToR(xReferenceNodes[groupIndex].length) ,
                                lenToR(xReferenceNodes[groupIndex].length) - lenToR(raw_nodes.nodes[location].time_list.length )) * ratio / 2
                        }
                    })
                    // console.log(offsets)
                    temp_constraints.push({
                        "type": "alignment",
                        "axis": "x",
                        "offsets": offsets
                    })
                }
            })

            constraint.y_constraint.forEach((item, groupIndex) => {
                if(item.length > 1){
                    const offsets = item.map((location) => {
                        return {
                            "node": raw_nodes.nodes[location].id,
                            "offset": getRandom(lenToR(raw_nodes.nodes[location].time_list.length) - lenToR(yReferenceNodes[groupIndex].length) ,
                                lenToR(yReferenceNodes[groupIndex].length) - lenToR(raw_nodes.nodes[location].time_list.length)) * ratio/ 2
                        }
                    })
                    temp_constraints.push({
                        "type": "alignment",
                        "axis": "y",
                        "offsets": offsets
                    })
                }
            })
            console.log(temp_constraints)

            setConstraints(temp_constraints)
        }

    }, [marginX, marginY, ratio, xReferenceNodes, yReferenceNodes, fakeNodes]);

    // generate nodes (after generateRatio)
    useEffect(() => {
        if(ratio) {
            const realNodes = Object.keys(raw_nodes.nodes).map(key => {
                return {
                    id: raw_nodes.nodes[key].id,
                    label: key,
                    r: lenToR(raw_nodes.nodes[key].time_list.length) * ratio / 2,
                    color: normalizeTime(raw_nodes.nodes[key].first_time)
                }
            })
            setNodes(realNodes)
        }
    }, [ratio, normalizeTime, lenToR])

    //generate links (after generating nodes)
    useEffect(() => {
        console.log("nodes done!")
        console.log(nodes)
        if(nodes) {
            setLinks(raw_links.map(d => Object.assign(Object.create(d), {
                source: parseInt(d.source),// index.get(d.source),
                target: parseInt(d.target),//index.get(d.target),
                id_str: d.id_str
            })))
        }
    }, [nodes])

    // init
    useEffect(() => {
        generateFakeNodes()  // used for limiting all the nodes within the boundary
        generateRatio()  // generate ratio, marginX, marginY, xReferenceArray, yReferenceArray
        setStartTime(raw_nodes.time_info.start_time)
        setEndTime(raw_nodes.time_info.end_time)

        const svg = d3.select(svgRef.current);
        svg
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "background-color: lightGrey")
        // .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");
    }, [generateRatio, generateFakeNodes])


    //generate node position (after generating constraints, generating nodes, generating links)
    useEffect(() => {
        if(nodes && links && constraints && fakeNodes){
            console.log("links done")
            console.log(links)
            const svg = d3.select(svgRef.current);
            const layout = cola.d3adaptor(d3)
                .size([width, height])
                .nodes([...nodes, ...fakeNodes])
                .constraints(constraints)
                .links(links)
                .avoidOverlaps(true)
                .handleDisconnected(false)
                .jaccardLinkLengths(20, 0.1)
                .start(30, 30, 60);

            console.log(nodes)


            // gradient go along the x-axis, gradient2 go against the x-axis
            const gradient = svg.append("defs").append("linearGradient")
                .attr("id", "line-gradient")

            gradient.append("stop")
                .attr("id", "source")
                .attr("offset", "0%")
                .attr("stop-color", sourceColor);

            gradient.append("stop")
                .attr("id", "target")
                .attr("offset", "100%")
                .attr("stop-color", targetColor);

            const gradient2 = svg.append("defs").append("linearGradient")
                .attr("id", "line-gradient-reverse")
                .attr("x2", "0%")
                .attr("x1", "100%")

            gradient2.append("stop")
                .attr("id", "source-reverse")
                .attr("offset", "0%")
                .attr("stop-color", sourceColor);

            gradient2.append("stop")
                .attr("id", "target-reverse")
                .attr("offset", "100%")
                .attr("stop-color", targetColor);



            const node = svg
                .selectAll(".node")
                .data(nodes)
                .enter().append("g")

            node.on("click", e => setSelectedId(value => value === "+" + e.target.__data__.id + "+" ?
                "++" : "+" + e.target.__data__.id + "+"))

            node.append("circle")
                .attr("r" , d => getR(d.label, time, startTime, endTime, ratio))
                // .attr("r", d => d.r)
                .attr("fill", d => d3.interpolateRgb(startColor, endColor)(d.color))


            node.append("text")
                .text(d => d.label)
                .attr("fill", "black")
                .attr("stroke", "black")
                .attr("font-size", "8px")
                .attr("stroke-width", 0.8)
                .style("transform", "translate(4px, 2px)")

            const link = svg.selectAll(".line")
                .data(links)
                .enter().append("line")
                .attr("stroke-width",2)


            layout.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y)
                    .attr("stroke", d => d.source.x < d.target.x? "url(#line-gradient)": "url(#line-gradient-reverse)")

                node
                    .attr("transform", d => `translate(${d.x},${d.y})`)
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });
        }
    }, [nodes, links, startColor, endColor, constraints, fakeNodes]);


    //callback for changeSourceColor, changeTargetColor events
    useEffect(() => {
        console.log(sourceColor)
        const svg = d3.select(svgRef.current);
        svg.select("#source")
            .attr("offset", "0%")
            .attr("stop-color", sourceColor);

        svg.select("#target")
            .attr("offset", "100%")
            .attr("stop-color", targetColor);

        svg.select("#source-reverse")
            .attr("offset", "0%")
            .attr("stop-color", sourceColor);

        svg.select("#target-reverse")
            .attr("offset", "100%")
            .attr("stop-color", targetColor);


    }, [sourceColor, targetColor]);



    // callback for changeStartTime, changeEndTime, filterTime, selectNode events
    useEffect(() => {
        if(time && startTime && endTime && ratio){
            // console.log(startTime * (1 - time) + endTime * time)
            const svg = d3.select(svgRef.current);
            if(selectedId === "++") svg.selectAll("line").attr("stroke-opacity", d => d.end_time > startTime * (1 - time) + endTime * time? "0":"1")
            else svg.selectAll("line").attr("stroke-opacity",d => d.end_time > startTime * (1 - time) + endTime * time? "0":
                (d.id_str.includes(selectedId)? "1": "0"))
            // svg.selectAll("line").attr("stroke-opacity", d => d.end_time < startTime * (1 - time) + endTime * time? "1" : "0")
            svg.selectAll("circle").attr("r" , d => getR(d.label, time, startTime, endTime, ratio))
        }

    }, [time, startTime, endTime, ratio, selectedId, startColor, endColor, sourceColor, targetColor]);

    return (
        <div id="svg">
            <svg
                ref={svgRef}
            >
            </svg>
        </div>

    );
};

export default Svg;
