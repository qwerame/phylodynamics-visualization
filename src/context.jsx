import {createContext, useContext, useEffect, useReducer} from 'react';
import PropTypes from "prop-types";

const ValueContext = createContext(null);

const ValueDispatchContext = createContext(null);

export function ValueProvider({ children , init}) {
    const [value, dispatch] = useReducer(
        ValueReducer,
        init
    );

    useEffect(() => {
        // console.log(value)
    }, [value]);

    return (
        <ValueContext.Provider value={value}>
            <ValueDispatchContext.Provider value={dispatch}>
                {children}
            </ValueDispatchContext.Provider>
        </ValueContext.Provider>
    );
}

function ValueReducer(value, action) {
    switch (action.type) {
        case 'setStartColor': {
            return {
                ...value,
                startColor: action.newValue === undefined? value.startColor: action.newValue}
        }
        case 'setEndColor': {
            return {
                ...value,
                endColor: action.newValue === undefined ? value.endColor: action.newValue}
        }
        case 'setTime': {
            return {
                ...value,
                time: action.newValue}
        }
        case 'setFilteredStartTime': {
            return {
                ...value,
                filtered_start_time: action.newValue}
        }
        case 'setSelectedId': {
            return {
                ...value,
                selectedId: action.newValue === value.selectedId ? "++" : action.newValue}
        }
        case 'setDetailNodeInfo': {
            return {
                ...value,
                detail_node_info: action.newValue
            }
        }
        case 'setHoveredLocation': {
            return {
                ...value,
                hovered_location: action.newValue
            }
        }
        case 'setHoveredVariationInfo': {
            return {
                ...value,
                hovered_variation_info: action.newValue
            }
        }
        case 'setSelectedNodeId': {
            return {
                ...value,
                selectedNodeId: action.newValue === value.selectedNodeId ? null : action.newValue
            }
        }
        case 'setSelectedNodeIdList': {
            return {
                ...value,
                selectedNodeIdList: action.newValue
            }
        }
        case 'setLineChartNodeInfo': {
            return {
                ...value,
                line_chart_node_info: action.newValue
            }
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}
ValueProvider.propTypes = {
    children: PropTypes.element,
    init: PropTypes.object
}
export function useValue() {
    return useContext(ValueContext);
}

export function useValueDispatch() {
    return useContext(ValueDispatchContext);
}