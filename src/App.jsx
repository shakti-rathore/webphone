import React, { useEffect, useState } from 'react';
import { BackgroundRunner } from '@capacitor/background-runner';

const HomePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Request permissions for background tasks
    const init = async () => {
      try {
        const permissions = await BackgroundRunner.requestPermissions({
          apis: ['notifications', 'geolocation'],
        });
        console.log('permissions', permissions);
      } catch (err) {
        console.log(`ERROR: ${err}`);
      }
    };

    init();
  }, []);

  // Test the background fetch
  const performBackgroundFetch = async () => {
    try {
      const result = await BackgroundRunner.dispatchEvent({
        label: 'com.capacitor.background.check',
        event: 'fetchTest',
        details: {},
      });
      setUser(result);
    } catch (err) {
      console.log(`ERROR: ${err}`);
    }
  };

  // Schedule a notification from background
  const scheduleNotification = async () => {
    try {
      await BackgroundRunner.dispatchEvent({
        label: 'com.capacitor.background.check',
        event: 'notificationTest',
        details: {},
      });
    } catch (err) {
      console.log(`ERROR: ${err}`);
    }
  };

  // Test the KV Store
  const testSave = async () => {
    try {
      const result = await BackgroundRunner.dispatchEvent({
        label: 'com.capacitor.background.check',
        event: 'testSave',
        details: {},
      });
      console.log('save result', result);
    } catch (err) {
      console.log(`ERROR: ${err}`);
    }
  };

  const testLoad = async () => {
    try {
      const result = await BackgroundRunner.dispatchEvent({
        label: 'com.capacitor.background.check',
        event: 'testLoad',
        details: {},
      });
      console.log('load result', result);
    } catch (err) {
      console.log(`ERROR: ${err}`);
    }
  };

  return (
    <div>
      <button onClick={performBackgroundFetch}>Perform Background Fetch</button>
      <button onClick={scheduleNotification}>Schedule Notification</button>
      <button onClick={testSave}>Test Save</button>
      <button onClick={testLoad}>Test Load</button>
      {user && <div>User Data: {JSON.stringify(user)}</div>}
    </div>
  );
};

export default HomePage;
