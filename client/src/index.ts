//@ts-check
import './scss/styles.scss';
import { WebSocketUnit } from './modules/web-socket.unit';
import { MirrorModule } from './modules/mirror.module';

const webSocketUnit = new WebSocketUnit();
const mirrorInstance = new MirrorModule(webSocketUnit);


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


