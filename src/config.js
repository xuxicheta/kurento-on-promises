import { socket } from './web-socket.service';

const config = {};

export const set = (prop, value) => {
  socket.send('config/patch', { [prop]: value });
  config[prop] = value;
};

export const getAll = () => {
  return config;
};

export const get = (prop) => {
  return config[prop];
};

socket.addHandler('config/all', (data) => {
  Object.assign(config, data);
  console.log({ config });
});
socket.send('config/fetch');
