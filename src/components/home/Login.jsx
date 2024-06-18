import React, { useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryContext from "../../context/HistoryContext"

function Login() {
  
  const [error, setError] = useState(null);
  const { username,setUsername,password,setPassword } = useContext(HistoryContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Reset error
    setError(null);

    // Mock API request for demonstration (replace with your API endpoint)
    const response = await fetch(`https://samwad.iotcom.io/userlogin/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username:username, password:password })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("ok");
      // Store JWT token (for example, in localStorage)
      //setIsLogin(true);
      if(data.message==="wrong login info"){

        console.log("error",data.message);
        navigate("/login")

        

      } else {

        localStorage.setItem('token', JSON.stringify(data));


        // Redirect to the dashboard
        //window.location.href = '/dashboard';
        navigate("/dashboard")
        

      }
      
     
    } else {
       console.log("error");
      // Show error message
      setError(data.message || 'Something went wrong!');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
