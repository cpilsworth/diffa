export default function decorate(block) {
    const link = block.querySelector('a').href;
    block.textContent = '';

    try {
        let url = new URL(link); // check link is valid
        
        let iframe = block.createElement('iframe');
        iframe.src = link;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.style = 'border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;';
        iframe.allowfullscreen = '';
        iframe.scrolling = 'no';
        iframe.allow = 'encrypted-media';
        iframe.title = `Content from ${url.hostname}`;
        iframe.loading = 'lazy';
        block.append(iframe);
  
  } catch (error) {
    console.error(error);
  }
}
