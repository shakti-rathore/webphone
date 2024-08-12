import React, { useEffect } from 'react';
import { BackgroundRunner } from '@capacitor/background-runner';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const BG = () => {
  useEffect(() => {
    const registerBackgroundTask = async () => {
      try {
        await BackgroundRunner.register({
          taskId: 'background-task',
          task: async () => {
            console.log('Background task is running');

            // Schedule a local notification from the background task
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: 'Background Task Notification',
                  body: 'Your background task has run.',
                  id: 1,
                  schedule: { at: new Date(Date.now() + 1000) }, // 1 second delay
                  sound: null,
                  attachments: null,
                  actionTypeId: '',
                  extra: null,
                },
              ],
            });
          },
        });
      } catch (error) {
        console.error('Error registering background task:', error);
      }
    };

    registerBackgroundTask();

    const showTestNotification = async () => {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Test Notification',
            body: 'Your app is running in the background.',
            id: 2,
            schedule: { at: new Date(Date.now() + 10000) }, // 10 seconds delay
            sound: null,
            attachments: null,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    };

    showTestNotification();

    const handleNotificationAction = (notification) => {
      if (Capacitor.isNativePlatform()) {
        alert('Notification Clicked: ' + notification.notification.title);
        // Handle app navigation or actions here
      }
    };

    LocalNotifications.addListener('localNotificationActionPerformed', handleNotificationAction);

    // Cleanup function to remove the listener
    return () => {
      LocalNotifications.removeListener('localNotificationActionPerformed', handleNotificationAction);
    };
  }, []);

  return (
    <div>
      <h1>Capacitor Background Runner Test</h1>
      <p>Wait for 10 seconds to see the test notification.</p>
    </div>
  );
};

export default BG;
