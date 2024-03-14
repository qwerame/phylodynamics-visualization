import {useCallback, useEffect, useState} from "react";
import {useValue} from "../../context.jsx";
import {tree_structure_svg_size, tree_structure_svg_padding} from "../../constants.js"
import TreeStructureSvg from "./TreeStructureSvg.jsx";
const TreeStructureDiv = () => {
    const value = useValue()

    const [selectedLocation, setSelectedLocation] = useState("")

    const [selectedNodes, setSelectedNodes] = useState([]) // only index
    const [selectedLeavesArr, setSelectedLeavesArr] = useState([]) // only index
    const [leavesMap, setLeavesMap] = useState({}) // index - y

    const [xRatio, setXRatio] = useState()

    // full data , used in TreeStructureSvg
    const [selectedLeaves, setSelectedLeaves] = useState([])
    const [branches, setBranches] = useState([])


    useEffect(() => {
        setSelectedLocation(value.selectedId.length > 2 ?
            value.nodes_map[value.selectedId.slice(1, value.selectedId.length - 1)]: "")
    }, [value.selectedId]);

    useEffect(() => {
        // console.log(Object.keys(value.raw_tree_nodes).length)

        const list = []
        filter_nodes(value.raw_tree_nodes[value.tree_root], list)
        // console.log(list)
        setSelectedNodes(list)
        setSelectedLeavesArr(list.filter(item => value.raw_leaves.includes(item)))
    }, [selectedLocation]);

    const add_nodes = useCallback((cur_node, list) => {
        list.push(cur_node.index)
        cur_node.children.forEach(item => add_nodes(value.raw_tree_nodes[item], list))
    }, [])

    const filter_nodes = useCallback((cur_node, list) => {
        var isSelected = false
        if(cur_node.location && cur_node.location.includes(selectedLocation)) {
            isSelected = true
            add_nodes(cur_node, list)
            return true
        }
        else {
            cur_node.children.forEach(item => {
                if(filter_nodes(value.raw_tree_nodes[item], list)) isSelected = true
            })
            if(isSelected){
                list.push(cur_node.index)
                return true
            }
            return false
        }
    }, [selectedLocation])

    useEffect(() => {
        const xRatio = (tree_structure_svg_size - 2 * tree_structure_svg_padding)
            / Math.max(...selectedLeavesArr.map(item => value.raw_tree_nodes[item].height))
        setXRatio(xRatio)
        const yRatio = (tree_structure_svg_size - 2 * tree_structure_svg_padding) / selectedLeavesArr.length
        const tempSelectedLeaves = selectedLeavesArr.map((item, index) => Object.assign(Object.create(value.raw_tree_nodes[item]), {
            ...value.raw_tree_nodes[item],
            x: value.raw_tree_nodes[item].height * xRatio + tree_structure_svg_padding,
            y: (index + 0.5) * yRatio + tree_structure_svg_padding
        }))
        setSelectedLeaves(tempSelectedLeaves)
        const tempLeavesMap = {}
        tempSelectedLeaves.forEach(item => tempLeavesMap[item.index] = item.y)
        setLeavesMap(tempLeavesMap)
    }, [selectedNodes,selectedLeavesArr]);

    useEffect(() => {
        console.log(xRatio)
        const nodesObj = {}
        generate_nodes(value.raw_tree_nodes[value.tree_root], nodesObj)
        setBranches(Object.keys(nodesObj).map(nodeKey => Object.assign(Object.create(nodesObj[nodeKey]), {
                ...nodesObj[nodeKey],
                xSelf: nodesObj[nodeKey]['height'] * xRatio + tree_structure_svg_padding,
                xParent: nodesObj[nodesObj[nodeKey].parent]['height'] * xRatio + tree_structure_svg_padding,
            })))
    }, [selectedLeaves, xRatio, leavesMap]);

    const generate_nodes = (cur_node, list) => {
        const children = cur_node.children.length ? cur_node.children.filter(item => selectedNodes.includes(item)) : []
        let min = tree_structure_svg_size
        let max = 0
        if(children.length){
            children.forEach(childIndex => {
                const new_child = generate_nodes(value.raw_tree_nodes[childIndex], list)
                min = Math.min(min, (new_child.min + new_child.max) / 2)
                max = Math.max(max, (new_child.min + new_child.max) / 2)
            })
        }
        else {
            min = leavesMap[cur_node.index]
            max = leavesMap[cur_node.index]
        }
        const new_node = {
            ...cur_node,
            children: children,
            min: min,
            max: max
        }
        list[cur_node.index] = new_node
        return new_node
    }

    return (
        <div className="svg-div" style={{width: tree_structure_svg_size + 'px', height: tree_structure_svg_size + 'px'}}>
            {selectedLeaves && branches ?
                <TreeStructureSvg treeLeaves={selectedLeaves} branchTee={branches} xRatio={xRatio}/> : null }
        </div>

    );
};

export default TreeStructureDiv;