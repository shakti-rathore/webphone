// src/Login.js
import React, { useState } from 'react';
//import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login,setLogin] = useState(Boolean);

  const handleSubmit = (event) => {
    event.preventDefault();
    if(username && password){

        const url = `https:/devapp.iotcom.io/userlogin/${username}`;
        // Make a edit request to the server
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            //"Authorization": `Bearer ${localStorage.getItem('jwtToken')}`
          },
          body: JSON.stringify({ password: password }),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            //const data={message:"success,Proceed to login"};
            console.log(data.message);
            if (data.message === 'success,Proceed to login') {
             setLogin(true);
            }  else {
             alert(data.message);
            }
          })
          .catch((error) => {
            console.error('Error sending login rquest:', error);
          });

    }else{
        alert("please fill all of details");
    }
    
    
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>,
    username,password,login
  );
};

export default Login;
