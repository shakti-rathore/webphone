//---------- imports

// react
import React, { useEffect, useState, createContext } from "react";



//---------- context

const AppContext = createContext();

//---------- main app / component

const GlobalContextProvide = (props) => {

    //---------- state, veriables and hooks
    const [currentUser, setCurrentUser] = useState("")
    const[loading,setLoading] = useState({})
    const [islogin, setislogin] = useState(false);
    const[password,setpassword] = useState("");

    //---------- life cycles
    // check previous user is login
    const setup = async () => {

        const current_user = await getDataFromLocalStorage('current_user');
        // await removeDataFromAsyncStorage('current_user')


        if (current_user) {

            setCurrentUser(current_user)
            setLoading(false)
        } else {
            setLoading(false)
        }
    }
    useEffect(() => {
        setLoading(true)
        setup()
    }, [])

    //------------------------------ localStorage  Storage ------------------------------------------//

    //---------- Local storage

    // store
    const storeDataInLocalStorage = async ({ key, value }) => {

        try {
            const jsonValue = JSON.stringify(value)
            await localStorage.setItem(key, jsonValue)
            return true
        } catch (e) {
            // saving error
            return false
        }
    }

    // get data
    const getDataFromLocalStorage = async (key) => {
        try {
            const value = await localStorage.getItem(key)
            if (value !== null) {

                return JSON.parse(value)
            }

            return false
        } catch (e) {

            // error reading value
            return false
        }
    }

    //---------- return main view

    return (
        <AppContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                password,
                setpassword,
                islogin,
                setislogin,
                storeDataInLocalStorage,
                getDataFromLocalStorage
            }}
        >

            {
                !loading && props.children
            }
        </AppContext.Provider >

    );
};

//---------- export component

export { GlobalContextProvide, AppContext };
// export default { GlobalContextProvide, AppContext };