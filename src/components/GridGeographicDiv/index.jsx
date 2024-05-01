import {useCallback, useEffect, useState} from "react";
import * as d3 from "d3";
import * as cola from "webcola";
import {useValue} from "../../context.jsx";
import {geographic_svg_padding, geographic_svg_size} from "../../constants.js";
import GridGeographicSvg from "./GridGeographicSvg.jsx";
import VariationDetail from "../VariationDetail/index.jsx";
import {getLnLength} from "../../utils.js";
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

    const getIdList = useCallback(nameList => {
        const idList = []
        const realListLength = Object.keys(value.raw_nodes.nodes).length
        let fakeIndex = 0
        nameList.forEach(name => {
            if(value.raw_nodes.nodes[name]) idList.push(value.raw_nodes.nodes[name].id)
            else {
                idList.push(realListLength + fakeIndex)
                fakeIndex ++
            }
        })
        return idList
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
                .size([geographic_svg_size - 2 * geographic_svg_padding, geographic_svg_size - 2 * geographic_svg_padding])
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
        const tempGridSize = (geographic_svg_size - 2 * geographic_svg_padding)/ Math.max(value.grid_columns, value.grid_rows)
        setMarginX((geographic_svg_size - 2 * geographic_svg_padding - tempGridSize * value.grid_columns) / 2 + geographic_svg_padding)
        setMarginY((geographic_svg_size - 2 * geographic_svg_padding - tempGridSize * value.grid_rows) / 2 + geographic_svg_padding)
        setGridSize(tempGridSize)
        setMaxListLength(getLnLength(value.maxLength))
        generateLinks()

    }, []);

    useEffect(() => {
        console.log(maxListLength + ' ' + gridSize + ' ' + marginX + ' ' + marginY)
        if(gridSize && maxListLength && marginX && marginY){
            const fakeList = Object.keys(value.grid_constraint).filter(name => value.raw_nodes.nodes[name] == undefined)
            const finalList = [...Object.keys(value.raw_nodes.nodes), ...fakeList]
            const sizeList = getTextSizes(finalList)
            const idList = getIdList(finalList)
            console.log(value.grid_constraint)
            setNodes(finalList.map((key, index) => {
                const text_width = Math.min(sizeList[index], gridSize * 0.7)
                console.log(key + ' ' + value.grid_constraint[key])
                return {
                    id: idList[index],
                    label: key,
                    color: value.raw_nodes.nodes[key] ? getLnLength(value.raw_nodes.nodes[key].time_list.length) / maxListLength : -1,
                    width: Math.max(gridSize * 0.75, text_width),
                    height: gridSize * 0.75,
                    text_width: text_width,
                    fixed: true,
                    fixedWeight: 100,
                    x: (value.grid_constraint[key][0] + 0.5) * gridSize + marginX,
                    y: (value.grid_constraint[key][1] + 0.5) * gridSize + marginY,
                    isReal: !!value.raw_nodes.nodes[key]

                }
            }))
        }

    }, [gridSize, maxListLength, marginX, marginY]);

    useEffect(() => {
        if(nodes ){
            console.log(nodes)
        }
    }, [nodes]);

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
