import {useCallback, useEffect, useRef} from "react";
import * as d3 from "d3";
import {useValue, useValueDispatch} from "../../context.jsx";




const GeographicSvg = (props) => {
    const value = useValue()
    const dispatch = useValueDispatch()

    const {links, nodes, time} = props
    const svgRef = useRef()

    const width = 850; // outer width, in pixels
    const height = 850; // outer height, in pixels

    // generate radius
    const getR = useCallback((label, time) => {
        const new_list = value.raw_nodes.nodes[label].time_list.filter(item => item < time)
        // console.log(new_list)
        return new_list.length / value.raw_nodes.nodes[label].time_list.length
    }, [])

    useEffect(() => {
        console.log(links)
        console.log(nodes)
        const svg = d3.select(svgRef.current)

        svg.selectAll("*").remove()
        svg.append('svg:defs').selectAll('marker')
            .data(links)
            .enter().append("svg:marker")
            .attr('id',d => 'arrow' + d.id)

            .attr('viewBox','0 -5 10 10')
            .attr('refX',8)
            .attr('markerWidth',6)
            .attr('markerHeight',6)
            .attr('orient','auto')
            .append('svg:path')
            .classed("arrow", true)
            .attr('d','M0,-5L10,0L0,5L2,0')
            .attr('stroke-width','0px')
            .attr('fill','#000');

        const vis = svg.append("g").attr("id", 'vis')
        const node = vis
            .selectAll("g")
            .data(nodes)
            .enter().append("g")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        node.on("click", e => {
            dispatch({
                type: 'setSelectedId',
                newValue: "+" + e.target.__data__.id + "+"
            })
        })

        node.append("circle")
            .attr("r" , d => getR(d.label, time) * d.r)
            // .attr("r", d => d.r)
            .attr("fill", d => d3.interpolateRgb(value.startColor, value.endColor)(d.color))


        node.append("text")
            .text(d => d.label)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("font-size", "8px")
            .attr("stroke-width", 0.8)
            .style("transform", "translate(4px, 2px)")

        vis.selectAll(".link")
            .data(links)
            .enter().append("path")
            .classed("link", true)
            .attr("d", d => d.path)
            .attr("stroke-width",1)
            .attr("marker-end", d => "url(#arrow" + d.id + ")")


    }, []);

    useEffect(() => {
        if(links && nodes){
            // console.log(startTime * (1 - time) + endTime * time)
            const svg = d3.select(svgRef.current);
            if(value.selectedId === "++") {
                svg.selectAll(".link").attr("stroke-opacity", d => d.end_time > value.time ? "0" : "1")
                svg.selectAll(".arrow").attr("opacity", d => d.end_time > value.time ? "0" : "1")
            }
            else {
                svg.selectAll(".link").attr("stroke-opacity", d => d.end_time > value.time ? "0" : (d.id_str.includes(value.selectedId) ? "1" : "0"))
                svg.selectAll(".arrow").attr("opacity", d => d.end_time > value.time ? "0" : (d.id_str.includes(value.selectedId) ? "1" : "0"))

            }
            svg.selectAll("circle").attr("r" , d => getR(d.label, value.time) * d.r)
                .attr("fill", d => d3.interpolateRgb(value.startColor, value.endColor)(d.color))
        }

    }, [value.time, value.selectedId, value.startColor, value.endColor]);



    return (
      <svg ref={svgRef} viewBox={[0, 0, width, height]} width={width} height={height} style={{"backgroundColor": "lightGrey"}}>
      </svg>
    );
};

export default GeographicSvg;
