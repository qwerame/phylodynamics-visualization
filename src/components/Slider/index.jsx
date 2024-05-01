import {useValue, useValueDispatch} from "../../context.jsx";
import {useCallback, useEffect, useState} from "react";
import * as d3 from "d3";
import {
    axis_width,
    axis_height,
    axis_margin,
    statical_chart_height,
    slider_height,
    slider_color, min_length, visible_color, slider_svg_height
} from "../../constants.js";
import {getStroke} from "../../utils.js";

const Slider = () => {

    const value = useValue()
    const dispatch = useValueDispatch();

    const [startX, setStartX] = useState(axis_margin)
    const [endX, setEndX] = useState(axis_width - axis_margin)

    const dataset1 = [
        [1,5], [2,5], [3,14],
        [4, 68], [5, 135], [6, 209],
        [7, 268], [8, 322], [9, 346],
        [10, 164]
    ];


    const translateTime = useCallback(time => {
        const year = Math.floor(time)
        const raw_month = Math.floor(time % 1 * 12) + 1
        const month = raw_month < 10 ? '0' + raw_month : raw_month
        return year + '-' + month
    }, [])

    const dragTogether = useCallback(d3.drag()
        .on('drag', function(e){
            const dx = e.dx < 0 ? Math.max(axis_margin - d3.select(this).attr('x1'), e.dx) :
                Math.min(axis_width - axis_margin - d3.select(this).attr('x2'), e.dx)
            setStartX(value => Math.max(value + dx, axis_margin))
            setEndX(value => Math.min(axis_width - axis_margin, value + dx))
        }),[])

    const dragStart = useCallback(d3.drag()
        .on('drag', e => {
            const newX = Math.max(axis_margin, Math.min(e.x, axis_width - axis_margin - min_length))
            setStartX(newX)
            setEndX(value => Math.max(newX + min_length, value))
        }), [])

    const dragEnd = useCallback(d3.drag()
        .on('drag', e => {
            const newX = Math.max(axis_margin + min_length, Math.min(e.x, axis_width - axis_margin))
            setStartX(value => Math.min(newX - min_length, value))
            setEndX(newX)
        }), [])

    useEffect(() => {
        const svg = d3.select("#axis-svg")
            // .attr("width", axis_width)
            // .attr("height", axis_height);

        d3.select("#start-btn").call(dragStart)
        d3.select("#end-btn").call(dragEnd)
        d3.select("#selected-zone").call(dragTogether)
        if(value.display_time_axis) {
            const x = d3.scaleTime()
                .domain([new Date(translateTime(value.startTime)), new Date(translateTime(value.endTime))])
                .range([axis_margin, axis_width - axis_margin])

            svg.append("g").call(d3.axisBottom(x).ticks(10).tickSize(5).ticks(d3.timeYear.every(1)))
                .attr("transform", `translate(0, ${statical_chart_height + slider_height})`);
        }

        const xScale = d3.scaleLinear().domain([0,10 ]).range([axis_margin, axis_width - axis_margin])
        const yScale = d3.scaleLinear().domain([0, 350]).range([statical_chart_height, 0]);

        const line = d3.line()
            .x(function(d) { return xScale(d[0]); })
            .y(function(d) { return yScale(d[1]); })
            // .curve(d3.curveMonotoneX)
        d3.select("#chart").append("path")
            .datum(dataset1)
            // .attr("class", "line")
            .attr("transform", `translate(${(axis_margin * 2 - axis_width) / 20 }, 0)`)
            .attr("d", line)
            .style("fill", "none")
            .style("stroke", "#CC0000")
            .style("stroke-width", "1");
    }, []);

    useEffect(() => {
        const ratio = (endX - axis_margin) / (axis_width - 2 * axis_margin)
        dispatch({
            type: 'setTime',
            newValue: value.startTime * (1 - ratio) + value.endTime * ratio
        })
    }, [endX]);

    useEffect(() => {
        const ratio = (startX - axis_margin) / (axis_width - 2 * axis_margin)
        dispatch({
            type: 'setFilteredStartTime',
            newValue: value.startTime * (1 - ratio) + value.endTime * ratio
        })
    }, [startX]);



    return (
        <div id="slider" style={{display: "flex", width: axis_width + "px",
            justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
            {/*<input type="range" min={value.startTime} max={value.endTime} list="values"*/}
            {/*       onInput={changeValue} step="any" defaultValue={value.endTime}*/}
            {/*       style={{width: axis_width - axis_margin * 2 + "px"}}/>*/}
            <svg id="axis-svg" style={{height: slider_svg_height, width: axis_width}}>
                <g id='chart'></g>
                <g id='slider-g' transform={`translate(0, ${statical_chart_height})`}>
                    <line x1={axis_margin} x2={axis_width - axis_margin}
                          y1={slider_height / 2} y2={slider_height / 2} stroke={slider_color} strokeWidth={5}></line>
                    <line id='selected-zone' x1={startX} x2={endX}
                          y1={slider_height / 2} y2={slider_height / 2} stroke={visible_color} strokeWidth={5}
                    ></line>
                    <circle id='start-btn' r='6' fill={slider_color} stroke={getStroke(slider_color)}
                            cx={startX} cy={slider_height / 2}
                    ></circle>
                    <circle id='end-btn' r='6' fill={slider_color} stroke={getStroke(slider_color)}
                             cx={endX} cy={slider_height / 2}
                    ></circle>
                </g>
            </svg>
        </div>
    )
}

export default Slider;