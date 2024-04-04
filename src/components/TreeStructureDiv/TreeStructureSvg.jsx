import {useEffect, useRef} from "react";
import * as d3 from "d3";
import {useValue, useValueDispatch} from "../../context.jsx";
import {tree_structure_svg_padding, tree_structure_svg_size} from "../../constants.js";
import {getPath, getStroke, getZone} from "../../utils.js";
import Legend from "../Legend/Legend.jsx";

const TreeStructureSvg = (props) => {
    const value = useValue()
    const dispatch = useValueDispatch()
    const {treeLeaves, branchTee} = props
    const svgRef = useRef()


    useEffect(() => {
        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()
        const tree = svg.append("g").attr("id", 'tree')
        tree.selectAll("*").remove()
        svg.append('rect')
            .attr('id', 'temporalRect')
            .attr('width', 0)
            .attr('height', tree_structure_svg_size)
            .attr('fill', 'rgb(238, 238, 238)')
            .attr('opacity', 0.8)
            .attr('x',  tree_structure_svg_size - tree_structure_svg_padding)
    }, []);

    useEffect(() => {
        dispatch({
            type: 'setDetailNodeInfo',
            newValue: null
        })
        const tree = d3.select('#tree')
        tree.selectAll("*").remove()

        const branches = tree.append("g").attr("id", 'branches')

        branches.selectAll("path")
            .data(branchTee)
            .enter().append("path")
            .attr("d", d => getPath(d.xParent, d.xSelf, d.min, d.max))
            .attr("stroke-width",d => d.index === value.selectedNodeId ? 3 : 1)
            .attr("stroke", d => value.color_map[d.location])
            .attr("fill", 'none')
            .on("mouseover", function (e){
                d3.select(this).attr("stroke-width", d => d.index === value.selectedNodeId ? 3 : 2)
                dispatch({
                    type: 'setDetailNodeInfo',
                    newValue: {
                        name: e.target.__data__.name,
                        traits: e.target.__data__.traits,
                        zone: getZone(e.target.__data__.xSelf, (e.target.__data__.min + e.target.__data__.min) / 2, tree_structure_svg_size),
                        x: e.clientX,
                        y: e.clientY
                    }
                })
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-width", d => d.index === value.selectedNodeId ? 3 : 1)
                dispatch({
                    type: 'setDetailNodeInfo',
                    newValue: null
                })
            })
            .on("click", function (e) {
                dispatch({
                    type: 'setSelectedNodeId',
                    newValue: e.target.__data__.index
                })
                dispatch({
                    type: 'setSelectedId',
                    newValue: '++'
                })
            })

        const nodes = tree.append("g").attr("id", 'nodes')
        nodes.selectAll("circle")
            .data(branchTee)
            .enter().append("circle")
            .attr("r" , "1")
            .attr("fill", d => value.color_map[d.location])
            .attr("cx", d => d.xSelf)
            .attr("cy", d => (d.min + d.max) / 2)
            .attr('stroke', d => getStroke(value.color_map[d.location]))

        const leaves = tree.append("g").attr("id", 'leaves')
        leaves.selectAll("circle")
            .data(treeLeaves)
            .enter().append("circle")
            .attr("r" , "4")
            .attr("fill", d => value.color_map[d.location])
            .classed("tree-leaf", true)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr('stroke', d => getStroke(value.color_map[d.location]))
            .on("mouseover", function (e){
                d3.select(this).attr('r', 6)
                dispatch({
                    type: 'setDetailNodeInfo',
                    newValue: {
                        name: e.target.__data__.name,
                        traits: e.target.__data__.traits,
                        zone: getZone(e.target.__data__.x, e.target.__data__.y, tree_structure_svg_size),
                        x: e.clientX,
                        y: e.clientY
                    }
                })
            })
            .on("mouseout", function () {
                d3.select(this).attr('r', 4)
                dispatch({
                    type: 'setDetailNodeInfo',
                    newValue: null
                })
            })



    }, [treeLeaves, branchTee]);

    useEffect(() => {
        d3.selectAll('.tree-leaf').attr('r', d => d.location === value.hovered_location ? 6 : 4)
    }, [value.hovered_location]);

    useEffect(() => {
        const ratio = (value.time - value.startTime) / (value.endTime - value.startTime)
        d3.select('#temporalRect')
            .attr('width' , Math.abs(ratio) <= 1e-10 ? tree_structure_svg_size : (
                Math.abs(ratio - 1) <= 1e-10 ? 0 : tree_structure_svg_padding + (1 - ratio) * (tree_structure_svg_size - 2 * tree_structure_svg_padding)
            ))
            .attr('x', Math.abs(ratio) <= 1e-10 ? 0 : tree_structure_svg_padding + ratio * (tree_structure_svg_size - 2 * tree_structure_svg_padding))
        // console.log(ratio)
    }, [value.time]);
    return (
        <>
            <svg ref={svgRef} viewBox={[0, 0, tree_structure_svg_size, tree_structure_svg_size]}
                 width={tree_structure_svg_size} height={tree_structure_svg_size} style={{"backgroundColor": "aliceblue"}}>
            </svg>

            <Legend></Legend>
        </>
    );
};
export default TreeStructureSvg;
