const connectioncheck = async (username) => {
  try {
    const response = await fetch('https://callapp.iotcom.io/userconnection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: username }),
    });

    if (response.status === 401) {
      // Handle redirect to login or other actions
    } else {
      const data = await response.json();
      if (data.message !== 'ok connection for user') {
        // Handle poor connection, maybe trigger a notification
      }
    }
  } catch (err) {
    console.error('Error during connection check:', err);
  }
};

addEventListener('checkConnection', async (resolve, reject, args) => {
  try {
    const { username } = args;
    await connectioncheck(username);
    resolve();
  } catch (err) {
    console.error(err);
    reject(err);
  }
});
