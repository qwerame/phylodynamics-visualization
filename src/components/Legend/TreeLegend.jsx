import {useEffect, useState} from "react";
import {useValue, useValueDispatch} from "../../context.jsx";
import './index.css'
import * as d3 from "d3";
import chevronUp from './chevron-up.svg'
import chevronDown from './chevron-down.svg'

const TreeLegend = () => {
    const value = useValue()
    const dispatch = useValueDispatch()
    const [isFolded, setIsFolded] = useState(false)

    useEffect(() => {
        const legend = d3.select('#tree-legend')
        legend.attr("opacity" , isFolded ? 0 : 1)
    }, [isFolded]);
    return (
        <>
            {
                !isFolded ?
                     <svg id='tree-legend' className='legend' width={280} height={Math.floor((Object.keys(value.color_map).length + 1 )/ 2) * 19 + 18}>
                        <g>
                            <clipPath id='clipPath'>
                                <rect x={0} y={0} width='125px'
                                      height={Math.floor((Object.keys(value.color_map).length + 1 )/ 2) * 19 + 18}></rect>
                            </clipPath>
                            <g id='legendList'>
                                {Object.keys(value.color_map).map((key, index) => (
                                    <g key={key} className='legend-item'
                                       transform={`translate(${5 + 140 * (index % 2)}, ${19 * Math.floor(index / 2)})`}
                                       onMouseOver={() => {
                                           dispatch({
                                               type: 'setHoveredLocation',
                                               newValue: key
                                           })}}
                                       onMouseOut={() => {
                                           dispatch({
                                               type: 'setHoveredLocation',
                                               newValue: null
                                           })
                                       }}
                                    >
                                        <rect width='15px' height='15px' fill={value.color_map[key]}></rect>
                                        <text className='legend-text' x={24} y={11} clipPath='url(#clipPath)'>{value.translation_map[key]}</text>
                                    </g>
                                ))}
                            </g>
                        </g>

                    </svg> : null}
            <div className='title-div'>
                <span>Division</span>
                <img className='chevron-icon' src={isFolded? chevronUp : chevronDown} alt='chevron-icon'
                     onClick={() => setIsFolded(value => !value)}/>
            </div>
        </>
    )

}

export default TreeLegend