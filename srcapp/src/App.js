import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import "./App.css";

const App = () => {
    return (
            <Routes>
                <Route index element={<Home />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/randomTest" element={<RandomStart />} />
                <Route path='/random/:randomRoomId' element={<RandomChat />} />
            </Routes>
    );
};

export default App;