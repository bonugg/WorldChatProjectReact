import { Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import About from './pages/About';
import Article from './pages/Article';
import Articles from './pages/Articles';
import Home from './pages/Home';
import Login from './pages/Login';
import Join from './pages/Join';
import MyPage from './pages/MyPage';
import MyPage2 from './pages/MyPage2';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import "./App.css";

const App = () => {
    return (
            <Routes>
                <Route index element={<Home />} />
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