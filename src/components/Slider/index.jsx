import {useValue, useValueDispatch} from "../../context.jsx";

const Slider = () => {

    const value = useValue()
    const dispatch = useValueDispatch();
    const changeValue = e => {
        dispatch({
            type: 'setTime',
            newValue: e.target.value
        })

    }

    return (
        <div id="slider" style={{marginTop: "15px", display: "inline-block"}}>
            <input type="range" min={value.startTime} max={value.endTime} onInput={changeValue} step="any" style={{width: "600px"}} defaultValue={value.endTime} />
        </div>
    )
}

export default Slider;