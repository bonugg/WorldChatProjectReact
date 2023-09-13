import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import "./App.css";
import { GoogleOAuthProvider } from '@react-oauth/google'



const App = () => {
    const clientId = '879795063670-a2a8avf7p2vnlqg9mc526r8ge2h5cgvc.apps.googleusercontent.com'

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <Routes>
                <Route index component={Home} element={<Home />} />
            </Routes>
        </GoogleOAuthProvider>
    );
};

export default App;
