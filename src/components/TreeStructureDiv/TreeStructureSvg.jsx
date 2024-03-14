import {useEffect, useRef} from "react";
import * as d3 from "d3";
import {useValue} from "../../context.jsx";
import {tree_structure_svg_size} from "../../constants.js";


const TreeStructureSvg = (props) => {
    const value = useValue()
    const {treeLeaves, branchTee} = props
    const svgRef = useRef()

    useEffect(() => {
        const svg = d3.select(svgRef.current)

        svg.selectAll("*").remove()
        const tree = svg.append("g").attr("id", 'tree')

        const branchTees = tree.append("g").attr("id", 'branchTees')

        branchTees.selectAll("line")
            .data(branchTee)
            .enter().append("line")
            .attr("x1", d => d.xSelf || 0)
            .attr("y1", d => d.min || 0)
            .attr("x2", d => d.xSelf || 0)
            .attr("y2", d => d.max || 0)
            .attr("stroke", d => value.color_map[d.location])

        const branchStems = tree.append("g").attr("id", 'branchStems')

        branchStems.selectAll("line")
            .data(branchTee)
            .enter().append("line")
            .attr("x1", d => d.xSelf  || 0)
            .attr("y1", d => (d.min + d.max) / 2 || 0)
            .attr("x2", d => d.xParent || 0)
            .attr("y2", d => (d.min + d.max) / 2 || 0)
            .attr("stroke", d => value.color_map[d.location])

        const leaves = tree.append("g").attr("id", 'leaves')
        leaves.selectAll("circle")
            .data(treeLeaves)
            .enter().append("circle")
            .attr("r" , "4")
            .attr("fill", d => value.color_map[d.location])
            .classed("static-circle", true)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)

        console.log(branchTee)
    }, [treeLeaves, branchTee]);
    return (
        <svg ref={svgRef} viewBox={[0, 0, tree_structure_svg_size, tree_structure_svg_size]}
             width={tree_structure_svg_size} height={tree_structure_svg_size} style={{"backgroundColor": "white", "border": "1px solid black"}}>
        </svg>
    );
};

export default TreeStructureSvg;
