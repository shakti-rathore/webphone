//---------- imports 

// react
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// private route
import RouteProtecter from './RouteProtecter';
import Login from '../login';
import App from '../App';
import { HistoryProvider } from "./context/HistoryContext";
import ContextHelper from '../context/ContextHelper';

//---------- main route

const Router = () => {
    const {
        currentUser,
        islogin,
    } = ContextHelper()



    console.log("currentUser", currentUser);

    //---------- View

    return (
        <BrowserRouter>
            <Routes>

                {
                    //---------- private route
                }
               

                <Route
                    path="/app"
                    element={
                        <RouteProtecter  islogin={islogin}>
                            <HistoryProvider>
                              <App />
                            </HistoryProvider>
                            
                        </RouteProtecter>
                    }
                />

                {
                    //---------- public route
                }
                <Route path="/" element={<Login />} />

            </Routes>
        </BrowserRouter>
    )
}

export default Router;