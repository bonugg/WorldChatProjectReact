const initialState = {
    randomMax: true,
    randomChatDrag: false,
    position: {
        x: (window.innerWidth / 2) - (450 / 2),
        y: (window.innerHeight / 2) - (250 / 2)
    },
    // ...other states,
};

function chatRandom(state=initialState, action) {
    switch(action.type) {
        case "SET_RANDOMMAX":
            return {...state, randomMax: action.payload};
        // ...other actions,
        case "SET_RANDOMDRAG":
            return {...state, randomChatDrag: action.payload};
        // ...other actions,
        case "SET_RANDOMDRAG_POSITION":
            return {...state, position: action.payload};
        // ...other actions,
        default:
            return state;
    }
}

export default chatRandom;