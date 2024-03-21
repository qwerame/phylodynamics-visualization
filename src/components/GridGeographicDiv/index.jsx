import {useCallback, useEffect, useState} from "react";
import * as d3 from "d3";
import * as cola from "webcola";
import {useValue} from "../../context.jsx";
import {geographic_svg_size} from "../../constants.js";
import GridGeographicSvg from "./GridGeographicSvg.jsx";
import VariationDetail from "../VariationDetail/index.jsx";
const GridGeographicDiv = () => {
    const value = useValue()

    const d3cola = cola.d3adaptor(d3).convergenceThreshold(0.1);

    const [marginX, setMarginX] = useState();
    const [marginY, setMarginY] = useState();

    const [nodes, setNodes] = useState();

    const [links, setLinks] = useState();
    const [finalLinks, setFinalLinks] = useState();

    const [gridSize, setGridSize] = useState()
    const [maxListLength, setMaxListLength] = useState()

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

    const generateLinks = useCallback(() => {
        setLinks(value.raw_links.map(d => Object.assign(Object.create(d), {
            ...d,
            source: parseInt(d.source),// index.get(d.source),
            target: parseInt(d.target),//index.get(d.target),
        })))
    }, [])

    useEffect(() => {
        if(nodes && links){
            // console.log("links done")
            // console.log(links)
            d3cola
                .size([geographic_svg_size, geographic_svg_size])
                .nodes(nodes)
                .links(links)
                .avoidOverlaps(true)
                .handleDisconnected(false)
                .jaccardLinkLengths(20, 0.1)


            // console.log(nodes)
            // console.log(links)


            d3cola.start(30, 30, 60).on("tick", () => {

                nodes.forEach(value => {
                    value.innerBounds = value.bounds.inflate(0)
                    // if(value.height > value.node_width)
                    //     value.innerBounds.y += (value.height - value.node_width) / 2
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
    }, [nodes, links]);

    useEffect(() => {
        const tempGridSize = geographic_svg_size / Math.max(value.grid_columns, value.grid_rows)
        setMarginX((geographic_svg_size - tempGridSize * value.grid_columns) / 2)
        setMarginY((geographic_svg_size - tempGridSize * value.grid_rows) / 2)
        setGridSize(tempGridSize)
        setMaxListLength(Math.max(...Object.values(value.raw_nodes.nodes).map(item => item.time_list.length)))
        generateLinks()

    }, []);

    useEffect(() => {
        console.log(maxListLength)
        if(gridSize && maxListLength && marginX && marginY){
            const sizeList = getTextSizes(Object.keys(value.raw_nodes.nodes))
            setNodes(Object.keys(value.raw_nodes.nodes).map((key, index) => {
                const text_width = Math.min(sizeList[index], gridSize * 0.6)
                return {
                    id: value.raw_nodes.nodes[key].id,
                    label: key,
                    color: value.raw_nodes.nodes[key].time_list.length / maxListLength,
                    width: Math.max(gridSize * 0.6, text_width),
                    height: gridSize * 0.6,
                    text_width: text_width,
                    fixed: true,
                    fixedWeight: 100,
                    x: (value.grid_constraint[key][0] + 0.5) * gridSize + marginX,
                    y: (value.grid_constraint[key][1] + 0.5) * gridSize + marginY,

                }
            }))
        }

    }, [gridSize, maxListLength, marginX, marginY]);

    useEffect(() => {
        if(nodes && finalLinks){
            console.log(finalLinks)
        }
    }, [nodes, finalLinks]);

    return (
        <>
            <div id="geographic-div" className="svg-div" style={{width: geographic_svg_size + 'px', height: geographic_svg_size + 'px'}}>
                {nodes && finalLinks ? <GridGeographicSvg nodes={nodes} links={finalLinks}/> : null}
            </div>
            <VariationDetail></VariationDetail>
        </>
    );
};

export default GridGeographicDiv;