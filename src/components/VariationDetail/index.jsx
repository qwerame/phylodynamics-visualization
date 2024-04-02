import {useEffect, useState} from "react";
import {useValue} from "../../context.jsx";
const VariationDetail = () => {
    const value = useValue()
    const [variationNum, setVariationNum] = useState(null)
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
        textAlign: 'center'
    })


    useEffect(() => {
        setStyle(oldStyle => {
            return value.hovered_variation_info ? {
                ...oldStyle,
                left: (value.hovered_variation_info.x ) + 'px',
                top: (value.hovered_variation_info.y ) + 'px',
                // transform: getTransformStyle(value.hovered_variation_info.zone)
            } : oldStyle
        })
        setVariationNum(value.hovered_variation_info ?
            value.raw_nodes.nodes[value.hovered_variation_info.location].time_list.filter(item => item < value.time).length : null)
        // console.log(value.hovered_variation_info)
    }, [value.hovered_variation_info]);


    return (
        <>
            {variationNum !== null ? <div style={style}>{variationNum}</div> : null}
        </>

    )

}

export default VariationDetail