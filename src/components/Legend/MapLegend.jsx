import {useEffect, useState} from "react";
import {useValue} from "../../context.jsx";
import * as d3 from "d3";
import chevronUp from './chevron-up.svg'
import chevronDown from './chevron-down.svg'
import './index.css'

const MapLegend = () => {
    const value = useValue()

    const [isFolded, setIsFolded] = useState(false)

    useEffect(() => {
        const legend = d3.select('#map-legend')
        legend.attr("opacity" , isFolded ? 0 : 1)
    }, [isFolded]);

    useEffect(() => {
         const x = d3.scaleLog()
            .domain([1,value.maxLength])         // This is what is written on the Axis: from 0 to 100
            .range([250, 0])       // This is where the axis is placed: from 100 px to 800px
            .base(Math.E)

        const svg = d3.select("#map-legend")
        console.log(d3.axisRight(x).tickFormat(d3.format(".0f")))

        svg.append("g")
            .attr("transform", 'translate(40, -20)')
            .call(d3.axisRight(x).tickFormat(d3.format(".0f")));

    }, []);

    return (
        <>
            <svg id="map-legend" className='legend' height={250} width={80} opacity={isFolded? 0: 1}>
                <defs>
                    <linearGradient id="Gradient2" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={value.endColor} />
                        <stop offset="100%" stopColor={value.startColor} />
                    </linearGradient>
                </defs>
                <g id="color-bar" transform="translate(5,0)">
                    <rect width="30px" height="230px" fill="url(#Gradient2)"></rect>
                </g>
            </svg>

            <div className='title-div'>
                <span>Legend</span>
                <img className='chevron-icon' src={isFolded? chevronUp : chevronDown} alt='chevron-icon'
                     onClick={() => setIsFolded(value => !value)}/>
            </div>
        </>
    )

}

export default MapLegend