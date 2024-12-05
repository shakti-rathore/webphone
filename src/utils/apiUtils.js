const API_BASE_URL = 'https://callapp.iotcom.io'; 

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
    if (data.message !== 'wrong login info') {
      const url = `https://callapp.iotcom.io/userready/${body?.username}`;
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.message === 'success') {
            const keeplive = setInterval(() => {
              fetch('https://callapp.iotcom.io/userconnection', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user: body?.username }),
              }).then(() => {});
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
