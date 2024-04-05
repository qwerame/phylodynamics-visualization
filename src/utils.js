import * as d3 from "d3";
import {tree_structure_svg_size} from './constants.js'
export const generateColor = (values) => {
    const group_sum = Math.round(values.length / 6)
    const finalList = []
    finalList.push(...generateGroupColor(group_sum, "rgb(256, 0, 0)", "rgb(256, 0, 256)"))
    finalList.push(...generateGroupColor(group_sum, "rgb(256, 0, 256)", "rgb(0, 0, 256)"))
    finalList.push(...generateGroupColor(group_sum, "rgb(0, 0, 256)", "rgb(0, 256, 256)"))
    finalList.push(...generateGroupColor(group_sum, "rgb(0, 256, 256)", "rgb(0, 256, 0)"))
    finalList.push(...generateGroupColor(group_sum, "rgb(0, 256, 0)", "rgb(256, 256, 0)"))
    finalList.push(...generateGroupColor(values.length - group_sum * 5, "rgb(256, 256, 0)", "rgb(256, 0, 0)"))
    return values.reduce((acc, currentString, index) => {
        acc[currentString] = finalList[index];
        return acc;
    }, {})
}

const generateGroupColor = (n, startColor, endColor) => {
    const returnList = []
    for (let i = 0; i < n; i++) {
        returnList.push(d3.interpolateRgb(startColor, endColor)(i / n))
    }
    return returnList
}

export const getZone = (x, y, span) => {
    if(x < span / 2 && y < span / 2) return 0;
    else if(x >= span / 2 && y < span / 2) return 1;
    else if(x < span / 2 && y > span / 2) return 2;
    return 3;
}

export const getTransformStyle = (zone, y) => {
    const viewHeight = document.documentElement.clientHeight
    const y_forward_drct = -(y / viewHeight).toFixed(2) * 100 + '%'
    const y_reverse_drct = (((viewHeight - y) / viewHeight).toFixed(2) * 100 - 100) + '%'
    switch (zone){
        case 0:
            return `translate(0%, ${y_forward_drct})`
        case 1:
            return `translate(-100%, ${y_forward_drct})`
        case 2:
            return `translate(0%, ${y_reverse_drct})`
        default:
            return `translate(-100%, ${y_reverse_drct})`
    }
}

export const getDate = time => {
    const year = Math.floor(time)
    const dayOfYear = time - year
    const startDate = new Date(year, 0);
    const endDate = new Date(startDate.getTime() + dayOfYear * 24 * 60 * 60 * 1000);
    return year + '-' + (endDate.getMonth() + 1 < 10 ? '0' + (endDate.getMonth() + 1) : (endDate.getMonth() + 1)) + '-'
        + (endDate.getDate() + 1 < 10 ? '0' + (endDate.getDate() + 1) : (endDate.getDate() + 1))
}

export const translateTrait = (traitName, traitValue) => {
    if(traitName.toLowerCase().includes('date')) {
        console.log(typeof trait)
        if(Number.isFinite(traitValue)) return getDate(traitValue)
        else if(Array.isArray(traitValue)) return '(' + getDate(traitValue[0]) + ', ' + getDate(traitValue[1]) + ')'
    }
    else if(Number.isFinite(traitValue)) return traitValue.toFixed(5)
    else if(Array.isArray(traitValue)) return '(' + traitValue[0].toFixed(5) + ' , ' + traitValue[1].toFixed(5) + ')'
    return traitValue

}

export const getStroke = oldValue => {
    return d3.interpolateRgb('rgb(0,0,0)', oldValue)(0.8)
}

export const getLnLength = length => {
    return Math.log(length + 1)
}

export const getPath = (parentX, selfX, min, max) => {
    const selfY = (min + max) / 2
    return 'M' + parentX + ',' + selfY + 'L' + selfX + ',' + selfY + 'L' + selfX + ',' + min + 'L' + selfX + ',' + max
}