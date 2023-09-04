import { combineReducers } from "redux";
import chatRandom from "./chatRandom";
import chatCate from "./chatCate";
import chatFriend from "./chatFriend";
const rootReducer = combineReducers({
    chatminimum: chatRandom,
    chatminimumCate: chatCate,
    chatminimumFriend: chatFriend,
});

export default rootReducer;