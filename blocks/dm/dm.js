import './dm-video.js';

function addStyle() {
    let iframe = this;
    let doc = iframe.contentDocument || iframe.contentWindow.document;
    let style = document.createElement('style');
    style.innerHTML = `
        button.vjs-big-play-button {
            color: hotpink;
        }`;
    doc.head.appendChild(style);
}  

export default async function decorate(block) {
    const link = block.querySelector('a').href;
    block.textContent = '';

    try {
        let url = new URL(link); // check link is valid
        
        // Wait for the custom element to be defined
        if (!customElements.get('dm-video')) {
            await customElements.whenDefined('dm-video');
        }
        
        // Create and configure the dm-video component
        const videoComponent = document.createElement('dm-video');
        videoComponent.setAttribute('src', link);
        videoComponent.style.width = '100%';
        videoComponent.style.height = '100%';
        block.append(videoComponent);
  
    } catch (error) {
        console.error(error);
    }
}
