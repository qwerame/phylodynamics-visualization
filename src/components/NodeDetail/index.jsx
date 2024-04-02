import {useEffect, useState} from "react";
import {useValue} from "../../context.jsx";
import {getTransformStyle, translateTrait} from "../../utils.js";
const NodeDetail = () => {
    const value = useValue()
    const [name, setName] = useState()
    const [style, setStyle] = useState({
        position: 'absolute',
        width: '260px',
        background: 'rgb(55, 55, 55)',
        borderRadius: '10px',
        padding: '10px',
        zIndex: '1000',
        pointerEvents: 'none',
        fontSize: '14px',
        lineHeight: '1',
        fontWeight: '300',
        color: 'white',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        opacity: 0
    })
    const [traits, setTraits] = useState()
    useEffect(() => {
        // console.log(value.detail_node_info)
        setStyle(oldStyle => {
            return value.detail_node_info === null ? {
                ...oldStyle,
                opacity: 0
            } : {
                ...oldStyle,
                left: value.detail_node_info.x + 'px',
                top: value.detail_node_info.y + 'px',
                opacity: 0.9,
                transform: getTransformStyle(value.detail_node_info.zone)
            }
        })
        setName(value.detail_node_info ? value.detail_node_info.name : null)
        setTraits(value.detail_node_info ? value.detail_node_info.traits : null)
    }, [value.detail_node_info]);

    return (
        <div style={style}>
            {traits && name ?
                <div style={{position: 'relative', padding: '5px'}}>
                    <div style={{fontSize: '18px',fontWeight: '400',marginBottom: '10px', textAlign: 'left'}}>{name}</div>
                    {Object.keys(traits).map(key => {
                        return (
                            <div key={key} style={{textAlign: 'left', paddingBottom: '10px'}}>
                                <span style={{fontWeight: '500'}}>{key + ': '}</span>
                                <span style={{fontWeight: '300'}}>{translateTrait(key, traits[key])}</span>
                            </div>
                        )
                    })}
                </div> : null}
        </div>
    )

}

export default NodeDetail