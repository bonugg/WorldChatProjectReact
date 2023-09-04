const initialState = {
    cateMax : true,
    cateChatDrag : false,
    position: {
        x: (window.innerWidth / 2) - (450 / 2),
        y: (window.innerHeight / 2) - (600 / 2)
    },
    // ...other states,
};

function chatCate(state=initialState, action) {
    switch(action.type) {
        case "SET_CATEMAX":
            return {...state, cateMax: action.payload};
        // ...other actions,
        case "SET_CATEDRAG":
            return {...state, cateChatDrag: action.payload};
        // ...other actions,
        case "SET_CATEDRAG_POSITION":
            return {...state, position: action.payload};
        // ...other actions,
        default:
            return state;
    }
}

export default chatCate;