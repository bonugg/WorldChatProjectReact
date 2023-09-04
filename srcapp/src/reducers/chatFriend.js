const initialState = {
    roomId : null,
    friendNum : null,
    firendMax : true,
    firendChatDrag : false,
    position: {
        x: (window.innerWidth / 2) - (450 / 2),
        y: (window.innerHeight / 2) - (600 / 2)
    },
    // ...other states,
};

function chatFriend(state=initialState, action) {
    switch(action.type) {
        case "SET_FRIENDROOM_NUM":
            return {...state, roomId: action.payload};
        case "SET_FRIEND_NUM":
            return {...state, friendNum: action.payload};
        case "SET_FRIENDMAX":
            return {...state, firendMax: action.payload};
        // ...other actions,
        case "SET_FRIENDDRAG":
            return {...state, firendChatDrag: action.payload};
        // ...other actions,
        case "SET_FRIENDDRAG_POSITION":
            return {...state, position: action.payload};
        // ...other actions,
        default:
            return state;
    }
}

export default chatFriend;