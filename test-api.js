// Simple test to check API endpoints
fetch('http://localhost:4000/api/notifications/unread-count', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Unread count response:', data);
})
.catch(error => {
  console.error('Error fetching unread count:', error);
});

fetch('http://localhost:4000/api/notifications', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Notifications response:', data);
})
.catch(error => {
  console.error('Error fetching notifications:', error);
});