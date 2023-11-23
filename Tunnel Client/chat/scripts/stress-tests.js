import http from 'k6/http';
import encoding from 'k6/encoding';
import { SharedArray } from 'k6/data';
import { sleep } from 'k6';
import { WebSocket } from 'k6/experimental/websockets';
// eslint-disable-next-line import/extensions
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import {
  setTimeout, clearTimeout, setInterval, clearInterval,
} from 'k6/experimental/timers';

const MESSAGE_INTERVAL = 1000;
const CLOSE_SOCKET_INTERVAL = 10000;
const USERS_COUNT = 20;

const parseJwt = (token) => {
  const parts = token.split('.');
  return JSON.parse(encoding.b64decode(parts[1].toString(), 'rawstd', 's'));
};

const connectToTheRoom = (url, userName, connectPassword, https = true) => {
  const payload = {
    userName,
    connectPassword,
  };
  const headers = {
    'Content-Type': 'application/json',
  };
  return http.post(`${https ? 'https://' : 'http://'}${url}/api/connect-to-room`, JSON.stringify(payload), { headers });
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const DEFAULT_MESSAGE = '{"algo":"AES","encoding":"base64","cipher":"aes-256-gcm","ciphertext":"c5hwCIc0+94M/M9hy2VQl0xzJ1BAr8iQbzFt3lpV2bZErQDFycahKUEn/+27qlXdGoPaloE0DyAMuCUuTvFZhZUh3814D482u94YlJvSq5bzkxE8YcSoYYx1Ii/pwoJP/cRqFs7KcW2zWTdM0fqaXA8KRbJCkU9z8QbaJPUI0xQ0n2XjPywYG0HccN8mOeP7KjTiNT8TSG6i90VpTR6s9STPx7LGeuXdflIYyS4OuTw7QSGXJ8l5MK1WItypke0OL28a8qiSnUdQ2YRwMg06mb1k4Dc+KyQ2LH7DoyPTvOeao4samN/ZtW04OXR9wzSJKlOOS4v/y9Tgsi37+oi9w/3nSOAhCNHjuFqsgWtye0x8ovk/hueQM0FwvcOqPYZ3XyfT7jT41qVmlfFpV07ICeDD2763hAF4tukMpLy7qDTzU3mugT5UE0eALGwKLBcWviZcUX+TzaX0AkSNli1XKLTOmoRHKxVzEzEaphfJYrR1vJaOvYPEwDztpaFdS5phvm9QSJOAvLpzGXLr//VEUZTjJ1hINC3+JK481UmgqovB4B2StFqOXqGoj+p26uzLs31XaOBhBvMORyvKi0Yp8KoErSPq4RYhJlgtkjoFmt6JbjhksIgUncERH8BDDSrxYkYgcXoyQSeeGBmC0HhPoBte","iv":"q3Rt0N0+fC2t/8lB","mac":"AJ2LIlTeFjwfBsXvaCKIAg=="}';

const generateMessage = () => {
  return `42["message", ${JSON.stringify({ encryption: DEFAULT_MESSAGE, messageClientId: uuidv4() })}]`;
};

const createSocket = (hostname, token, https = true) => {
  const url = `${https ? 'wss' : 'ws'}://${hostname}/socket.io/?token=${token}&EIO=4&transport=websocket`;
  const ws = new WebSocket(url);
  if (!token) throw new Error('Token required');
  const { userName } = parseJwt(token) || {};
  let closeTimeoutId;
  let sendIntervalId;
  ws.addEventListener('open', () => {
    ws.send('40');
    sleep(1);
    ws.send(`42["joinRoom", "${userName}"]`);
    sendIntervalId = setInterval(() => {
      console.log(`user ${userName} send message`);
      ws.send(generateMessage());
    }, MESSAGE_INTERVAL);
    closeTimeoutId = setTimeout(() => {
      clearInterval(sendIntervalId);
      ws.send('42["leaveRoom"]');
      ws.close();
      console.log(`force socket close ${userName}`);
    }, CLOSE_SOCKET_INTERVAL);
  });
  ws.addEventListener('close', () => {
    console.log('socket close');
    clearTimeout(closeTimeoutId);
    clearInterval(sendIntervalId);
  });
  ws.addEventListener('error', (e) => {
    console.log('socket error', e);
    clearTimeout(closeTimeoutId);
    clearInterval(sendIntervalId);
  });
};

const data = new SharedArray('users', (() => {
  return [...Array(USERS_COUNT).keys()];
}));

export const options = {
  scenarios: {
    'use-all-the-data': {
      executor: 'shared-iterations',
      vus: data.length,
      iterations: data.length,
    },
  },
};

const run = (connectPassword, hostname, https = true) => {
  setTimeout(() => {
    const user = data[Math.floor(Math.random() * data.length)];
    const response = connectToTheRoom(hostname, `Tester ${user}`, connectPassword, https);
    const { body } = response;
    if (!body) throw new Error('Create room failed');
    const { token } = JSON.parse(body).data;
    createSocket(hostname, token, https);
  }, randomInt(0, 1000));
};

export default function () {
  /* global __ENV */
  run(__ENV.CONNECT_PASSWORD, __ENV.HOSTNAME);
}