
import React from 'react';
import { createRoot } from 'react-dom/client'; // 이렇게 바꿔주세요
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from "react-redux";
import { store } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

function Fallback() {
    return (
        <>
            <div className={"loading_copy"}>
                {/*<div className="spinner"></div>*/}
            </div>
        </>
    );
}
const persistor = persistStore(store);

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <PersistGate loading={<Fallback/>} persistor={persistor}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </PersistGate>
    </Provider>,
);