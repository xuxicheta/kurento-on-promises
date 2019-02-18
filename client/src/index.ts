//@ts-check
import './scss/styles.scss';
import { WebSocketModule } from './modules/web-socket.module';
import { MirrorModule } from './modules/mirror.module';

const webSocketModule = new WebSocketModule();
const mirrorInstance = new MirrorModule(webSocketModule);
// mirrorInstance.on('playStatus', (evt) => console.log(evt));

const foldables = Array.from(document.querySelectorAll('.foldable'));
foldables.forEach((foldable) => {
  const title = foldable.querySelector('.title') as HTMLDivElement;
  const content = foldable.querySelector('.content') as HTMLDivElement;
  title.onclick = () => {
    content.classList.toggle('hidden');
    content.dispatchEvent(new CustomEvent('change', { detail: content.classList.contains('hidden') }));
    title.classList.toggle('visibleState');
  };
})


