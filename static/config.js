const config = {
  // wsUri: 'ws://antshvets.ddns.net:8888/kurento',
  wsUri: 'ws://vpsanton.ddns.net:8888/kurento',
  isAutoStart: true,
  isRecord: false,
  setItem(prop, value) {
    localStorage.setItem(`kurento_config/${prop}`, value);
  },
  getItem(prop) {
    return localStorage.getItem(`kurento_config/${prop}`);
  }
};

if (config.getItem('autostart') !== null) {
  config.isAutoStart = JSON.parse(
    config.getItem('autostart')
  );
}

if (config.getItem('record') !== null) {
  config.isRecord = JSON.parse(
    config.getItem('record')
  );
}


const configSection = document.getElementById('config');
const div_wsUri= configSection.querySelector('#wsUri');
div_wsUri.textContent = config.wsUri;

class Config
