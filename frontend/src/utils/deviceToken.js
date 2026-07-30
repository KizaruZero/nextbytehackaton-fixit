export function getDeviceToken() {
  let token = localStorage.getItem('fixit_device_token');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('fixit_device_token', token);
  }
  return token;
}
