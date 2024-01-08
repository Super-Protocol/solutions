import http from 'k6/http';
import encoding from 'k6/encoding';
import { SharedArray } from 'k6/data';
import { sleep } from 'k6';
import exec from 'k6/execution';
import { WebSocket } from 'k6/experimental/websockets';
// eslint-disable-next-line import/extensions
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import {
  setTimeout, clearTimeout, setInterval, clearInterval,
} from 'k6/experimental/timers';

const MESSAGE_INTERVAL = 1000;
const MESSAGE_PER_TESTER = 10;
const USERS_COUNT = 10;

const READY_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

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

const DEFAULT_MESSAGE = '{"algo":"AES","encoding":"base64","cipher":"aes-256-gcm","ciphertext":"W7sZULdos1kJQPxvZPHvp4IVDw4gvrk1iLKYD1DiBn3ZN700SbZhYoAFY5JK4EgLXQo8BRsrbXz485CcCQYSMrnmR0dNYfni32b4ZQV+ASLSA6nvSRZjGOUSE8zwHrpyImt0q3ZxGnfuDkUGakUYTVWEk7SDwbCpW2Bo3UOYCNK384prQqboGTShJDSE5wUOuZ1wXQ8lMautbkHreFhmiv7Dub4f53s4Pf7OI7kp3aBdVmVBM/q16k1Ey0krjyvKZEjW9DrDElg12OISrL9T0bPEzbRjcaK0zqw8/xMVRIbT0YlYO9EAbR4E1gtD2kL+MxBBIm1Y9ARq9hXN0Dej693rs7n/0L/5Djki42njvgWUO1NBasVv7fHeRRgQuYMMeJWmAdUhzkkurGv6yzJ17dIOjcjlbQwVuyBtU1j8MdKQXrH7NGMKo8SOhCUEJCbGdh+9od9SstxLDRlG9rqJjvQQye0Gced17rDf8d+EafBiaKSQzmmZu5LJr1TK05npJfs6BJop8kfozOJa3DPdzSLHOtH9B9PziPKcMtePqeZR+Pnnx1/z+pBnZgX1rtHrCKtcaz8PTqoDClcfsJwfNJxkJLNh7p2WNcYx76Ex1xMpDc+HG7L5usaUr2I9SPz04dpbincmfRdDhk9tjZ0vDt0R","iv":"PkfagOLG4Kn+/VUG","mac":"AMBgpruwL8Fmz8u7idG0eg=="}';

const generateMessage = () => {
  return `42["message", ${JSON.stringify({ encryption: DEFAULT_MESSAGE, messageClientId: uuidv4() })}]`;
};

const processTester = (hostname, token, https = true, firstTime = false, remainMessages = MESSAGE_PER_TESTER) => {
  const url = `${https ? 'wss' : 'ws'}://${hostname}/socket.io/?token=${token}&EIO=4&transport=websocket`;
  const ws = new WebSocket(url);
  if (!token) throw new Error('Token required');
  const { userName } = parseJwt(token) || {};
  let sendIntervalId;

  ws.addEventListener('open', () => {
    if (firstTime && ws.readyState && ws.readyState == READY_STATE.OPEN) {
      ws.send('40');
      sleep(1);
      ws.send(`42["joinRoom", "${userName}"]`);
    }

    sendIntervalId = setInterval(() => {
      if (ws.readyState && ws.readyState == READY_STATE.OPEN) {
        console.log(`user ${userName} send message with remain ${remainMessages}`);
        ws.send(generateMessage());
        remainMessages = remainMessages - 1;
        if (remainMessages == 0) {
          ws.send('42["leaveRoom"]');
          ws.close();
          return;
        }
      }
    }, MESSAGE_INTERVAL);
  });

  ws.addEventListener('close', () => {
    //console.log('socket close');
    clearInterval(sendIntervalId);
  });

  ws.addEventListener('error', (e) => {
    //console.log('socket error', e);
    clearInterval(sendIntervalId);

    if (remainMessages > 0) {
      return processTester(hostname, token, http, false, remainMessages);
    }
  });
};

export const options = {
  scenarios: {
    'use-all-the-data': {
      executor: 'shared-iterations',
      vus: USERS_COUNT,
      iterations: USERS_COUNT,
    },
  },
};

const run = (connectPassword, hostname, https = true) => {
  setTimeout(() => {
    const userId = exec.vu.idInTest;
    console.log(`Start processing user ${userId}`);
    const response = connectToTheRoom(hostname, `Tester ${userId}`, connectPassword, https);
    const { body } = response;
    if (!body) throw new Error('Create room failed');
    const { token } = JSON.parse(body).data;
    processTester(hostname, token, https, true);
  }, randomInt(0, 1000));
};

export default function (data) {
  /* global __ENV */
  run(__ENV.CONNECT_PASSWORD, __ENV.HOSTNAME);
}
