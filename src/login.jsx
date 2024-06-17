
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import ContextHelper from "./context/ContextHelper";

function Login() {
  //---------- state, veriable, context and hooks
  const {
 setCurrentUser,
  setislogin,
  setPassword,
  storeDataInLocalStorage,
  } = ContextHelper();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState({});



 

  //--------- user Login

  const handleLogin = (event) => {
    event.preventDefault();
    let data = {
      username: event.target.username.value,
      password: event.target.password.value,
    };
    if (!data?.username) {
      setErrorMessage({
        username: "Please provide a valid username.",
      });
      return;
    }
    if (!data?.password) {
      setErrorMessage({
        password: "Please provide a valid password.",
      });
      return;
    } else {
      setErrorMessage();
    }

    const url = `https://devapp.iotcom.io/userlogin/${data.username}`;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then ((data)=>{
        if (data.message==="success,Proceed to login") {
         
      
            storeDataInLocalStorage({ key: "current_user", value: data.username });
      
            setCurrentUser(data.username);
            setPassword(data.password);
            setislogin(true);
      
            navigate("/app");
          } else {
           
              setErrorMessage({
                error: "Please Enter Valid Details",
              });
              console.log(data.message);
            } 
          }
        
      ).catch((err)=>{
        console.log("error fetching data from devserver",err)
      });
   
  };



  return (
    <div className="main_containar">
      <div className="auth-inner">
        <form onSubmit={handleLogin}>
          {errorMessage?.error && (
            <div className="errorMassage">{errorMessage?.error}</div>
          )}

          <h3>Sign In</h3>
          <div className="mb-3">
            <label>Email</label>
            <input
              // type="email"
              name="username"
              className="form-control"
              placeholder="Enter email"
            />
            {errorMessage?.username && (
              <div className="errorMassage">{errorMessage?.username}</div>
            )}
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
            />
            {errorMessage?.password && (
              <div className="errorMassage">{errorMessage?.password}</div>
            )}
          </div>
          <div className="d-grid mt-4">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
