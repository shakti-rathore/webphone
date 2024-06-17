
import React from 'react';
import { Navigate } from 'react-router-dom';
import ContextHelper from '../ContextHooks/ContextHelper';

const RouteProtecter = ({ children, currentRoute }) => {



    //---------- state, veriable, context and hooks , params
    const {
        currentUser,
        islogin,
    } = ContextHelper()

    console.log("RouteProtecter", currentUser);


    if (islogin===true) {

        return (
            <Navigate to="/app" replace />
        )
    }

    if (islogin!==true) {

        return (
            <Navigate to={'/'} replace />
        )
    }
    return children;
};

export default RouteProtecter;