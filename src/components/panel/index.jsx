import {useRef, useState} from "react";
import { ChromePicker } from 'react-color';
import './index.css'

const Panel = (props)  => {
    const {startColor, handleStartChange, endColor, handleEndChange,
        sourceColor, handleSourceChange, targetColor, handleTargetChange} = props

    const [localStartColor, setLocalStartColor] = useState(startColor)
    const [localEndColor, setLocalEndColor] = useState(endColor)

    const [localSourceColor, setLocalSourceColor] = useState(startColor)
    const [localTargetColor, setLocalTargetColor] = useState(endColor)

    const startRef = useRef()
    const endRef = useRef()

    const sourceRef = useRef()
    const targetRef = useRef()

    const [displayStart, setDisplayStart] = useState(false);
    const [displayEnd, setDisplayEnd] = useState(false);

    const [displaySource, setDisplaySource] = useState(false);
    const [displayTarget, setDisplayTarget] = useState(false);



    //隐藏 color picker，调整传播路径中的显示颜色
    const handleCloseStart = () => {
        setDisplayStart(false)
        handleStartChange(localStartColor)
    }
    const handleCloseEnd = () => {
        setDisplayEnd(false)
        handleEndChange(localEndColor)
    }

    const handleCloseSource = () => {
        setDisplaySource(false)
        handleSourceChange(localSourceColor)
    }
    const handleCloseTarget = () => {
        setDisplayTarget(false)
        handleTargetChange(localTargetColor)
    }

    //显示 或 隐藏 color picker
    const clickStart = () => {
        setDisplayStart(value => !value)
    }
    const clickEnd = () => {
        setDisplayEnd(value => !value)
    }


    const clickSource = () => {
        setDisplaySource(value => !value)
    }
    const clickTarget = () => {
        setDisplayTarget(value => !value)
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

    const handleSetSource = (color) => {
        sourceRef.current.style.background = getColor(color.rgb).toString()
        setLocalSourceColor(getColor(color.rgb).toString())
        console.log(color)
    }

    const handleSetTarget = (color) => {
        targetRef.current.style.background = getColor(color.rgb).toString()
        setLocalTargetColor(getColor(color.rgb).toString())

    }



    return (
        <div id="panel">
            <button className="panel-button" onClick={clickStart} ref={startRef} style={{background: startColor}}>start color</button>
            <button className="panel-button" onClick={clickEnd} ref={endRef} style={{background: endColor}}>end color</button>

            <button className="panel-button" onClick={clickSource} ref={sourceRef} style={{background: sourceColor}}>source color</button>
            <button className="panel-button" onClick={clickTarget} ref={targetRef} style={{background: targetColor}}>target color</button>

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

            {displaySource ?
                <div id="popoverSource" className="panel-popover">
                    <div className="cover" onClick={handleCloseSource}></div>
                    <ChromePicker color={localSourceColor} onChangeComplete={handleSetSource}/>
                </div>
                : null }
            {displayTarget ?
                <div id="popoverTarget" className="panel-popover">
                    <div className="cover" onClick={handleCloseTarget}></div>
                    <ChromePicker color={localTargetColor} onChangeComplete={handleSetTarget}/>
                </div>
                : null }

        </div>
    )
}
export default Panel;