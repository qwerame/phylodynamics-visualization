import {useValue, useValueDispatch} from "../../context.jsx";
import {useCallback, useEffect} from "react";
import * as d3 from "d3";
import {axis_width, axis_height, axis_margin} from "../../constants.js";

const Slider = () => {

    const value = useValue()
    const dispatch = useValueDispatch();
    const changeValue = e => {
        dispatch({
            type: 'setTime',
            newValue: e.target.value
        })

    }

    const translateTime = useCallback(time => {
        const year = Math.floor(time)
        const raw_month = Math.floor(time % 1 * 12) + 1
        const month = raw_month < 10 ? '0' + raw_month : raw_month
        return year + '-' + month
    }, [])

    useEffect(() => {
        if(value.display_time_axis) {
            const x = d3.scaleUtc()
                .domain([new Date(translateTime(value.startTime)), new Date(translateTime(value.endTime))])
                .range([axis_margin, axis_width - axis_margin]);
            const svg = d3.select("#axis-svg")
                .attr("width", axis_width)
                .attr("height", axis_height);

            svg.append("g").call(d3.axisBottom(x));
        }
    }, []);

    return (
        <div id="slider" style={{display: "flex", width: axis_width + "px",
            justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
            <input type="range" min={value.startTime} max={value.endTime} list="values"
                   onInput={changeValue} step="any" defaultValue={value.endTime}
                   style={{width: axis_width - axis_margin * 2 + "px"}}/>
            <svg id="axis-svg" height="0"></svg>
        </div>
    )
}

export default Slider;