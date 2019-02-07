//@ts-check
import './scss/styles.scss';
import { WebSocketModule } from './modules/web-socket.module';
import { MirrorModule } from './modules/mirror.module';

const ws = new WebSocketModule();
const mirrorInstance = new MirrorModule(ws);
mirrorInstance.on('playStatus', (evt) => console.log(evt));


