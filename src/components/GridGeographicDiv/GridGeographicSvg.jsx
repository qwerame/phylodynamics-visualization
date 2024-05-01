import {useCallback, useEffect, useRef} from "react";
import * as d3 from "d3";
import {useValue, useValueDispatch} from "../../context.jsx";
import {geographic_svg_size} from "../../constants.js";
import {getZone} from "../../utils.js";
import MapLegend from "../Legend/MapLegend.jsx";
import PropTypes from "prop-types";


const GridGeographicSvg = (props) => {
    const value = useValue()
    const dispatch = useValueDispatch()

    const {nodes, links} = props
    const svgRef = useRef()


    // generate radius
    const getTime = useCallback((label, time) => {
        if(value.raw_nodes.nodes[label]) {
            const new_list = value.raw_nodes.nodes[label].time_list.filter(item => item < time)
            // console.log(new_list)
            return new_list.length / value.raw_nodes.nodes[label].time_list.length
        }
        return -1
    }, [])

    useEffect(() => {
        console.log(links)
    }, [links]);

    useEffect(() => {
        // console.log(links)
        // console.log(nodes)
        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        svg.append('svg:defs').selectAll('marker')
            .data(links)
            .enter().append("svg:marker")
            .attr('id',d => 'arrow' + d.id)

            .attr('viewBox','0 -25 50 50')
            .attr('refX',8)
            .attr('markerWidth',6)
            .attr('markerHeight',6)
            .attr('orient','auto')
            .append('svg:path')
            .classed("arrow", true)
            .attr('d','M0,-20L50,0L0,20L2,0')
            .attr('stroke-width','0px')
            .attr('fill','#000');

        const vis = svg.append("g").attr("id", 'vis')

        const node = vis
            .selectAll("g")
            .data(nodes)
            .enter().append("g")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("stroke", d => '+' + d.id + '+' === value.selectedId ? "rgb(0, 0, 0)" : "")
            .attr("stroke-width", "2")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .on("click", e => {
                if(e.target.__data__.isReal){
                    dispatch({
                        type: 'setSelectedId',
                        newValue: "+" + e.target.__data__.id + "+"
                    })
                    dispatch({
                        type: 'setSelectedNodeIdList',
                        newValue: null
                    })
                    dispatch({
                        type: 'setSelectedNodeId',
                        newValue: null
                    })
                }
            })
            .on("mouseenter", function (e){
                if(e.target.__data__.isReal) {
                    dispatch({
                        type: 'setHoveredLocation',
                        newValue: e.target.__data__.label
                    })
                    dispatch({
                        type: 'setHoveredVariationInfo',
                        newValue: {
                            location: e.target.__data__.label,
                            zone: getZone(e.target.__data__.x, e.target.__data__.y, geographic_svg_size),
                            x: e.clientX,
                            y: e.clientY
                        }
                    })
                }
            })
            .on("mouseleave", () => {
                dispatch({
                    type: 'setHoveredLocation',
                    newValue: null
                })
                dispatch({
                    type: 'setHoveredVariationInfo',
                    newValue: null
                })
            })

        // node.append("circle")
        //     .attr("r" , d => d.width / 2)
        //     .attr("fill", d => d.color)
        //     // .attr("opacity", "0.2")
        //     .classed("static-circle", true)


        node.append("rect")
            .attr("width" , d => d.width * 0.9)
            .attr('height', d => d.height * 0.9)
            // .attr("fill", d => d.color)
            .attr('transform', d => `translate(-${d.width * 0.9 / 2}, -${d.height * 0.9 / 2})`)
            .attr('rx', '1%')
            .attr('ry', '1%')
            .classed("real-node", d => d.isReal)
            .classed("rect", true)


        node.append("text")
            .text(d => d.label)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("font-size", "8px")
            .attr("stroke-width", 0.8)
            .attr("textLength", d => d.text_width)
            .attr("lengthAdjust", "spacingAndGlyphs")
            .style("transform", d => `translate(${-1 * d.text_width / 2}px, 3px)`)

        vis.selectAll(".link")
            .data(links)
            .enter().append("path")
            .classed("link", true)
            .attr("d", d => d.path)
            .attr("stroke-width",1)
            .attr("marker-end", d => "url(#arrow" + d.id + ")")


    }, [value.selectedId]);

    useEffect(() => {

        // console.log(startTime * (1 - time) + endTime * time)
        const svg = d3.select(svgRef.current);
        if(value.selectedId === "++" && value.selectedNodeIdList === null) {
            svg.selectAll(".link").attr("stroke-opacity", d => d.end_time > value.time || d.start_time < value.filtered_start_time ? "0" : "1")
            svg.selectAll(".arrow").attr("opacity", d => d.end_time > value.time || d.start_time < value.filtered_start_time ? "0" : "1")
        }
        else if(value.selectedNodeIdList){
            svg.selectAll(".link").attr("stroke-opacity", d => d.end_time > value.time || d.start_time < value.filtered_start_time ? "0" :
                (value.selectedNodeIdList.includes(d.source_node_id) && value.selectedNodeIdList.includes(d.target_node_id)) ? "1" : "0")
            svg.selectAll(".arrow").attr("opacity", d => d.end_time > value.time || d.start_time < value.filtered_start_time ? "0" :
                (value.selectedNodeIdList.includes(d.source_node_id) && value.selectedNodeIdList.includes(d.target_node_id)) ? "1" : "0")

        }
        else {
            svg.selectAll(".link").attr("stroke-opacity", d => d.end_time > value.time || d.start_time < value.filtered_start_time ? "0" : (d.id_str.includes(value.selectedId) ? "1" : "0"))
            svg.selectAll(".arrow").attr("opacity", d => d.end_time > value.time || d.start_time < value.filtered_start_time ? "0" : (d.id_str.includes(value.selectedId) ? "1" : "0"))
        }
        svg.selectAll(".rect").attr("fill", d => d.isReal && getTime(d.label, value.time) > 0 ? d3.interpolateRgb(value.startColor, d3.interpolateRgb(value.startColor, value.endColor)(d.color))(getTime(d.label, value.time)) : 'rgb(105 105 105)')
        svg.selectAll(".filtered-num").text(d => value.raw_nodes.nodes[d.label].time_list.filter(item => item < value.time).length)


    }, [value.time, value.filtered_start_time, value.selectedId, value.startColor, value.endColor, value.selectedNodeIdList]);




    return (
        <>
            <svg ref={svgRef} viewBox={[0, 0, geographic_svg_size, geographic_svg_size]}
                 width={geographic_svg_size} height={geographic_svg_size} style={{"backgroundColor": "aliceblue"}}>
            </svg>
            <MapLegend></MapLegend>
        </>
    );
};

GridGeographicSvg.propTypes = {
    nodes: PropTypes.array,
    links: PropTypes.array
}

export default GridGeographicSvg;

