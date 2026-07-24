class RealtimeSocket {
  constructor(url) {
    this.url = url;
    this.socket = null;
  }

  connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener('open', () => console.log('WebSocket connected'));
    this.socket.addEventListener('message', (event) => console.log(event.data));
  }

  disconnect() {
    this.socket?.close();
  }
}
