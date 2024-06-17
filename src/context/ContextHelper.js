//---------- imports

// react
import  { useContext } from "react";
import { AppContext } from "./GlobalContextProvide";

//---------- context


const ContextHelper = () => {

    //---------- state, veriable, context and hooks
    const {
        currentUser,
        setCurrentUser,
        password,
        setPassword,
        islogin,
        setislogin
        
    } = useContext(AppContext);

    //---------- main app / component

    return {
        currentUser,
        setCurrentUser,
        password,
        setPassword,
        islogin,
        setislogin
    }

}

//---------- export component

export default ContextHelper;