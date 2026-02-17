// Safari-specific fix: other browsers throw when WebSocket is called with an object as the second argument, but Safari doesn't, 
// so this forces a throw to ensure Colyseus falls back to the browser-safe WebSocket(url, protocols) signature.
// Must run before colyseus.js is imported
const NativeWebSocket = window.WebSocket;

(window as any).WebSocket = function (url: any, protocols?: any) {
  // Debug line
  console.log("[wsPatch] WebSocket called with:", url, protocols);

  // If protocols is an object (like { headers, protocols }) force a throw.
  // This makes Colyseus fall back to the browser-safe WebSocket(url, protocols) signature.
  if (protocols && typeof protocols === "object" && !Array.isArray(protocols)) {
    throw new TypeError("Invalid WebSocket protocols argument (object).");
  }

  return protocols !== undefined
    ? new NativeWebSocket(String(url), protocols as any)
    : new NativeWebSocket(String(url));
} as any;

(window as any).WebSocket.prototype = NativeWebSocket.prototype;
