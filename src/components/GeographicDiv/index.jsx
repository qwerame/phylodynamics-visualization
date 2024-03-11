import {useCallback, useEffect, useState} from "react";
import * as d3 from "d3";
import * as cola from "webcola";
import GeographicSvg from "./GeographicSvg.jsx";
import {useValue} from "../../context.jsx";


const GeographicDiv = () => {
    const value = useValue()

    const d3cola = cola.d3adaptor(d3).convergenceThreshold(0.1);
    const width = 850; // outer width, in pixels
    const height = 850; // outer height, in pixels

    const [marginX, setMarginX] = useState();
    const [marginY, setMarginY] = useState();


    const [ratio, setRatio] = useState();

    const [xReferenceNodes, setXReferenceNodes] = useState()
    const [yReferenceNodes , setYReferenceNodes] = useState()
    const [constraints, setConstraints] = useState()

    const [nodes, setNodes] = useState();
    const [fakeNodes, setFakeNodes] = useState();

    const [links, setLinks] = useState();
    const [finalLinks, setFinalLinks] = useState();

    // to make small nodes visible
    const lenToR = useCallback((len) => {
        return len === 0 ? 0 : (len < 10 ? 10 - 1 / len : len)
    }, [])

    // used for coloring the nodes
    const normalizeTime = useCallback((time, startTime, endTime) => {
        return (time - startTime) / (endTime - startTime)
    }, [])

    // generate fake nodes at the corner of the GeographicSvg to limit all the nodes within the boundary
    const generateFakeNodes = useCallback(() => {
        setFakeNodes([
            {
                id: Object.keys(value.raw_nodes.nodes).length.toString(),
                fixed: true,
                fixedWeight: 100,
                label: "bottom_left",
                r: 1,
                x: 0,
                y: height,
                width: 1,
                height: 1
            },
            {
                id: (Object.keys(value.raw_nodes.nodes).length + 1).toString(),
                fixed: true,
                fixedWeight: 100,
                r: 1,
                label: "top_right",
                x: width,
                y: 0,
                width: 1,
                height: 1
            }
        ])
    }, [])


    // generate ratio, marginX, marginY, xReferenceArray, yReferenceArray
    const generateRatio = useCallback( () => {
        const reference_x = []
        const sum_x = value.constraint.x_constraint.reduce((accumulator, currentValue) => {
            const len_map = new Map(currentValue.map((d, index) => [value.raw_nodes.nodes[d].time_list.length, {name:d, index: index}]));
            const len_max = Math.max(...len_map.keys())
            const max_location = len_map.get(len_max)
            // console.log(max_location)
            reference_x.push({id: value.raw_nodes.nodes[max_location.name].id, length: len_max, index: max_location.index})
            // console.log(reference_x)
            return accumulator + lenToR(len_max)
        }, 0);
        const reference_y = []
        const sum_y = value.constraint.y_constraint.reduce((accumulator, currentValue) => {
            const len_map = new Map(currentValue.map((d, index) => [value.raw_nodes.nodes[d].time_list.length, {name:d, index: index}]));
            const len_max = Math.max(...len_map.keys())
            const max_location = len_map.get(len_max)
            // console.log(max_location)
            reference_y.push({id: value.raw_nodes.nodes[max_location.name].id, length: len_max, index: max_location.index})
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

    const lineFunction = d3.line()
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; });

    const getTextSizes = useCallback(nameList => {
        const widthList = []
        const container = d3.select("#geographic-div");
        container.append("svg")
            .selectAll("text")
            .data(nameList)
            .enter().append("text")
            .text(d => d)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("font-size", "8px")
            .attr("stroke-width", 0.8)
            .each(function () {
                widthList.push(this.getBBox().width)
            });

        container.selectAll("*").remove()
        return widthList
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
            value.constraint.x_constraint.forEach((item, groupIndex) => {
                if(item.length > 1){
                    const offsets = item.map((location, index) => {
                        return {
                            "node": value.raw_nodes.nodes[location].id,
                            "offset": (lenToR(xReferenceNodes[groupIndex].length) - lenToR(value.raw_nodes.nodes[location].time_list.length))
                                * ((index - xReferenceNodes[groupIndex].index) >= 0 ? 1 : -1)* ratio / 2
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

            value.constraint.y_constraint.forEach((item, groupIndex) => {
                if(item.length > 1){
                    const offsets = item.map((location, index) => {
                        return {
                            "node": value.raw_nodes.nodes[location].id,
                            "offset": (lenToR(yReferenceNodes[groupIndex].length) - lenToR(value.raw_nodes.nodes[location].time_list.length))
                                * ((index - yReferenceNodes[groupIndex].index >= 0 ? 1 : -1)) * ratio/ 2
                        }
                    })
                    temp_constraints.push({
                        "type": "alignment",
                        "axis": "y",
                        "offsets": offsets
                    })
                }
            })
            // console.log(temp_constraints)

            setConstraints(temp_constraints)
        }

    }, [marginX, marginY, ratio, xReferenceNodes, yReferenceNodes, fakeNodes]);

    // generate nodes (after generateRatio)
    useEffect(() => {
        if(ratio) {
            const sizeList = getTextSizes(Object.keys(value.raw_nodes.nodes))
            // console.log(widthList)
            const realNodes = Object.keys(value.raw_nodes.nodes).map((key, index) => {
                const node_width = lenToR(value.raw_nodes.nodes[key].time_list.length) * ratio
                const text_width = Math.min(sizeList[index], node_width + marginX)
                return {
                    id: value.raw_nodes.nodes[key].id,
                    label: key,
                    r: node_width / 2,
                    color: normalizeTime(value.raw_nodes.nodes[key].first_time, value.startTime, value.endTime),
                    width: Math.max(node_width, text_width),
                    height: Math.max(node_width, 20),
                    text_width: text_width,
                    node_width: node_width
                }
            })
            setNodes(realNodes)
        }
    }, [ratio, marginX])

    useEffect(() => {
        // console.log(finalLinks)
    }, [finalLinks]);

    const generateLinks = useCallback(() => {
        setLinks(value.raw_links.map(d => Object.assign(Object.create(d), {
            ...d,
            source: parseInt(d.source),// index.get(d.source),
            target: parseInt(d.target),//index.get(d.target),
        })))
    }, [])

    // init
    useEffect(() => {
        generateFakeNodes()  // used for limiting all the nodes within the boundary
        generateRatio()  // generate ratio, marginX, marginY, xReferenceArray, yReferenceArray
        generateLinks()
    }, [generateRatio, generateFakeNodes, generateLinks])


    //generate node position (after generating constraints, generating nodes, generating links)
    useEffect(() => {
        if(nodes && links && constraints && fakeNodes){
            // console.log("links done")
            // console.log(links)
            d3cola
                .size([width, height])
                .nodes([...nodes, ...fakeNodes])
                .constraints(constraints)
                .links(links)
                .avoidOverlaps(true)
                .handleDisconnected(false)
                .jaccardLinkLengths(20, 0.1)


            console.log(nodes)
            // console.log(links)


            d3cola.start(30, 30, 60).on("tick", () => {

                nodes.forEach(value => {
                    value.innerBounds = value.bounds.inflate(0)
                    if(value.height > value.node_width)
                        value.innerBounds.y += (value.height - value.node_width) / 2
                })

            }).on("end", () => {

                d3cola.prepareEdgeRouting();
                // console.log(links)
                setFinalLinks(links.map(item => Object.assign(Object.create(item), {
                    ...item,
                    path:lineFunction(d3cola.routeEdge(item))
                })))
            });
        }
    }, [value.startColor, value.endColor, constraints, fakeNodes]);



    return (
        <div id="geographic-div" style={{width: "850px", height: "850px"}}>
            {finalLinks && nodes ? <GeographicSvg links={finalLinks} nodes={nodes}/> : null}
        </div>

    );
};

export default GeographicDiv;
