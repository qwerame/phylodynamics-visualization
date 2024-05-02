import {useEffect, useState} from "react";
import {useValue} from "../../context.jsx";
const LineChartNodeDetail = () => {
    const value = useValue()
    const [timeNum, setTimeNum] = useState(null)
    const [style, setStyle] = useState({
        position: 'absolute',
        width: '40px',
        height: '30px',
        background: 'rgb(55, 55, 55)',
        borderRadius: '5px',
        zIndex: '1000',
        pointerEvents: 'none',
        fontSize: '14px',
        lineHeight: '30px',
        fontWeight: '300',
        color: 'white',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        textAlign: 'center',
        transform: 'translate(-50%, -100%)'
    })


    useEffect(() => {
        setStyle(oldStyle => {
            return value.line_chart_node_info ? {
                ...oldStyle,
                left: (value.line_chart_node_info.x ) + 'px',
                top: (value.line_chart_node_info.y - 3 ) + 'px',
                // transform: getTransformStyle(value.hovered_variation_info.zone)
            } : oldStyle
        })
        setTimeNum(value.line_chart_node_info ?
            value.line_chart_node_info.num : null)
        // console.log(value.hovered_variation_info)
    }, [value.line_chart_node_info]);


    return (
        <>
            {timeNum !== null ? <div style={style}>{timeNum}</div> : null}
        </>

    )

}

export default LineChartNodeDetail