import './App.css'

import Panel from "./components/panel";

import Slider from "./components/slider";
import {useState} from "react";
import Svg from "./components/svg";

function App() {
    const [startColor, setStartColor] = useState('rgb(249, 249, 249)');
    const [endColor, setEndColor] = useState('rgb(255, 0, 0)');

    const [sourceColor, setSourceColor] = useState('rgb(255, 255, 255)');
    const [targetColor, setTargetColor] = useState('rgb(255, 255, 255)');

    const [time, setTime] = useState(1)
    const handleStartChange = color => setStartColor(color)
    const handleEndChange = color => setEndColor(color)

    const handleSourceChange = color => setSourceColor(color)
    const handleTargetChange = color => setTargetColor(color)

    const changeTime = e => {
        // console.log(e.target.value)
        setTime(e.target.value)
    }


    return (
        <>

            <Panel startColor={startColor} handleStartChange={handleStartChange} endColor={endColor} handleEndChange={handleEndChange}
                    sourceColor={sourceColor} handleSourceChange={handleSourceChange} targetColor={targetColor} handleTargetChange={handleTargetChange}
                    changeTime={changeTime}
            ></Panel>
            <Svg startColor={startColor} endColor={endColor} sourceColor={sourceColor} targetColor={targetColor} time={time}></Svg>
            <Slider changeTime={changeTime}></Slider>

        </>
    )
}

export default App
