
function addStyle() {
    var videoStyle = {
        "name": "video-style",
        "css": "https://unpkg.com/@videojs/themes@1/dist/city/index.css"
    };
    window.addEventListener("message", function (event) {
        if(event.data.name === "video-style") {
            event.source.window.postMessage(JSON.stringify(videoStyle), '*');
        }
    });
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
