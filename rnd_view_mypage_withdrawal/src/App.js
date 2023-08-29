import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import "./App.css";
import RandomStart from './pages/random/RandomStart';
import RandomChat from './pages/random/RandomChat';
import Friends from "./pages/danny/Friends";
import Accept from "./pages/danny/Accept";
import ReceivedList from "./pages/danny/ReceivedList";
import RequestedList from "./pages/danny/RequestedList";
import FriendsList from "./pages/danny/FriendsList";
import TestChat from "./pages/danny/TestChat";
import ChatRoomList from "./pages/danny/ChatRoomList";
import ChatRoom from "./pages/danny/ChatRoom";
import Chatroom2 from "./pages/danny/chatroom2";
import ChatRoom4 from "./pages/danny/ChatRoom4";


const App = () => {

    return (
            <Routes>
                <Route index element={<Home />} />
                <Route path='/friends' element={<Friends/>}/>
                <Route path='/accept' element={<Accept/>}/>
                <Route path='/received-list' element={<ReceivedList/>}/>
                <Route path='/requested-list' element={<RequestedList/>}/>
                <Route path='/friends-list' element={<FriendsList/>}/>
                <Route path='/chatroom-list' element={<ChatRoomList/>}/>
                <Route path='/chat/:roomId' element={<ChatRoom4/>}/>
                <Route path='/chatroom' element={<ChatRoom/>}/>
                <Route path='/chatroom2' element={<Chatroom2/>}/>
                {/*<Route path='/chatroom/:{id}' element={<ChatRoom/>}/>*/}
                <Route path="*" element={<NotFound />} />
                <Route path="/randomTest" element={<RandomStart />} />
                <Route path='/random/:randomRoomId' element={<RandomChat />} />
                {/*<Route path="/" element={<Layout />}>*/}
                {/*    <Route path="/about" element={<About />} />*/}
                {/*    <Route path="/profiles/:username" element={<Profile />} />*/}
                {/*    <Route path="/articles" element={<Articles />}>*/}
                {/*        <Route path=":id" element={<Article />} />*/}
                {/*    </Route>*/}
                {/*    <Route path="/mypage" element={<MyPage/>} />*/}
                {/*    <Route path="/mypage2" element={<MyPage2 />} />*/}
                {/*</Route>*/}

                {/*<Route path="/login" element={<Login />} />*/}
                {/*<Route path="/join" element={<Join />} />*/}
                {/*<Route path="*" element={<NotFound />} />*/}
            </Routes>
    );
};

export default App;