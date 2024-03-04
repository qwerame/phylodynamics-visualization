const Slider = ( {changeTime}) => {


    return (
        <div id="slider" style={{marginTop: "15px"}}>
            <input type="range" min="0" max="1"  onInput={changeTime} step="any" style={{width: "600px"}}/>
        </div>
    )
}

export default Slider;