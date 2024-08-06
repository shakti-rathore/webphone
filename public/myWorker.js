// public/myWorker.js
self.addEventListener('message', (event) => {
  console.log('Worker received message:', event.data);
  // Simulate a long-running task
  setTimeout(() => {
    self.postMessage('Worker finished task');
  }, 5000);
});
