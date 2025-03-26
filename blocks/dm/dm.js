
function addStyle() {
    let iframe = this;
    let doc = iframe.contentDocument || iframe.contentWindow.document;
    let style = document.createElement('style');
    style.innerHTML = `
        button..vjs-big-play-button {
            color: hotpink;
        }`;
    doc.head.appendChild(style);
}  

export default function decorate(block) {
    const link = block.querySelector('a').href;
    block.textContent = '';

    try {
        let url = new URL(link); // check link is valid
        
        let iframe = document.createElement('iframe');
        iframe.addEventListener('load', addStyle);
        iframe.src = link;
        iframe.width = '100%';
        iframe.height = '100%';        
        iframe.allowfullscreen = '';
        iframe.allow = 'encrypted-media';
        iframe.title = `Content from ${url.hostname}`;
        iframe.loading = 'lazy';
        block.append(iframe);
  
  } catch (error) {
    console.error(error);
  }
}
