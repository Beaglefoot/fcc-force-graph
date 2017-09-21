import { loading } from './Loading.scss';

class Loading {
  constructor() {
    this.loading = document.createElement('div');
    this.loading.appendChild(document.createTextNode('Loading'));
    this.loading.classList.add(loading);
  }

  appendToNode(node) {
    node.appendChild(this.loading);
    return this;
  }

  startAnimation() {
    this.intervalId = setInterval(() => {
      if ((this.loading.textContent.match(/\./g) || []).length <= 5) {
        this.loading.textContent += '.';
      }
      else this.loading.textContent = 'Loading';
    }, 200);
    return this;
  }

  stopAnimation() {
    clearInterval(this.intervalId);
    return this;
  }

  removeFromNode(node) {
    this.stopAnimation();
    node.removeChild(this.loading);
    return this;
  }

  addClass(className) {
    this.loading.classList.add(className);
    return this;
  }
}

export default Loading;
