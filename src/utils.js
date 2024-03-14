import * as d3 from "d3";

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