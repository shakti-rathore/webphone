const API_BASE_URL = 'https://awsdev.iotcom.io'; // base url changed by shakti  

export async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong!');
  } else {
    if(data.message !=="wrong login info"){

      const url = `https://awsdev.iotcom.io/userready/${body?.username}`;
      // Make a edit request to the server
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //"Authorization": `Bearer ${localStorage.getItem('jwtToken')}`
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          //const data1={message:"success"};
          console.log(data.message);
          if (data.message === 'success') {
            console.log('user ready to take call');
            // we can use this in future to create login session for agents
            //userlogin = true;
            //console.log(ua);
            //connectionTime = Date.now();
            const keeplive = setInterval(() => {
              fetch('https://awsdev.iotcom.io/userconnection', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user: body?.username }),
              }).then(()=>{})
              
            }, 2000);
            
          } else if (data.message === 'failed,logout and login again') {
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error('Error sending login rquest:', error);
        });
       
     

    }

    
    return data;
  }

  
}

export function login(username, password) {

  return apiRequest(`/userlogin/${username}`, 'POST', { username, password });
}
