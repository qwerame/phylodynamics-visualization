import {useRef, useState} from "react";
import { ChromePicker } from 'react-color';
import './index.css'
import {useValue, useValueDispatch} from "../../context.jsx";
import Slider from "./Silder.jsx";
import {getDate} from "../../utils.js";

const Panel = ()  => {
    const value = useValue()
    const dispatch = useValueDispatch()

    const [localStartColor, setLocalStartColor] = useState(value.startColor)
    const [localEndColor, setLocalEndColor] = useState(value.endColor)

    const startRef = useRef()
    const endRef = useRef()

    const [displayStart, setDisplayStart] = useState(false);
    const [displayEnd, setDisplayEnd] = useState(false);


    //隐藏 color picker，调整传播路径中的显示颜色
    const handleCloseStart = () => {
        setDisplayStart(false)
        dispatch({
            type: 'setStartColor',
            newValue: localStartColor
        })
    }
    const handleCloseEnd = () => {
        setDisplayEnd(false)
        dispatch({
            type: 'setEndColor',
            newValue: localEndColor
        })
    }

    //显示 或 隐藏 color picker
    const clickStart = () => {
        setDisplayStart(value => !value)
    }
    const clickEnd = () => {
        setDisplayEnd(value => !value)
    }

    const getColor = (color) => {
        return 'rgb(' + color.r + ','  + color.g + ',' + color.b + ')'
    }

    //调整按钮的显示颜色，不调整传播路径中的显示颜色
    const handleSetStart = (color) => {
        startRef.current.style.background = getColor(color.rgb).toString()
        setLocalStartColor(getColor(color.rgb).toString())
        console.log(color)
    }

    const handleSetEnd = (color) => {
        endRef.current.style.background = getColor(color.rgb).toString()
        setLocalEndColor(getColor(color.rgb).toString())

    }



    return (
        <div id="panel">
            <div className='panel-block'>
                <button className="panel-button" onClick={clickStart} ref={startRef} style={{background: localStartColor}}>min color</button>
                <button className="panel-button" onClick={clickEnd} ref={endRef} style={{background: localEndColor}}>max color</button>
                {displayStart ?
                    <div id="popoverStart" className="panel-popover">
                        <div className="cover" onClick={handleCloseStart}></div>
                        <ChromePicker color={localStartColor} onChangeComplete={handleSetStart}/>
                    </div>
                    : null }
                {displayEnd ?
                    <div id="popoverEnd" className="panel-popover">
                        <div className="cover" onClick={handleCloseEnd}></div>
                        <ChromePicker color={localEndColor} onChangeComplete={handleSetEnd}/>
                    </div>
                    : null }
            </div>
            <Slider></Slider>
            <div className='panel-block'>
                <p className='date-display'>{getDate(value.filtered_start_time)}</p>
                 ~
                <p className='date-display'>{getDate(value.time)}</p>
            </div>

        </div>
    )
}
export default Panel;