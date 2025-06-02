// Copyright 2024 Adobe
// All Rights Reserved.

class DMVideo extends HTMLElement {
    static get observedAttributes() {
        return ['src'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.authToken = '';
        this.videoConfig = undefined;
    }

    connectedCallback() {
        this.render();
        if (this.hasAttribute('src')) {
            this.initVideoPlayer();
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'src' && oldValue !== newValue) {
            this.initVideoPlayer();
        }
    }

    render() {
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }

            html, body {
                width: 100%;
                height: 100%;
            }

            body {
                padding: 0;
                margin: 0;
                font-size: 12px;
                background: #FFFFFF;
                overflow: hidden;
            }

            @media screen and (max-width: 560px) {
                .video-js .vjs-big-play-button {
                    width: 60px;
                    height: 32px;
                    line-height: 1em;
                    margin-top: -16px;
                    margin-left: -30px;
                }
            }

            @media screen and (min-width: 561px) and (max-width: 1100px) {
                .video-js .vjs-big-play-button {
                    width: 75px;
                    height: 40px;
                    line-height: 1.25em;
                    margin-top: -20px;
                    margin-left: -37.5px;
                }
            }

            @media screen and (min-width: 1101px) and (max-width: 1600px) {
                .video-js .vjs-big-play-button {
                    width: 90px;
                    height: 48px;
                    line-height: 1.5em;
                    margin-top: -24px;
                    margin-left: -45px;
                }
            }

            @media screen and (min-width: 1601px) {
                .video-js .vjs-big-play-button {
                    width: 100px;
                    height: 53.33px;
                    line-height: 1.5em;
                    margin-top: -26.66px;
                    margin-left: -50px;
                }
            }

            .video-js .vjs-big-play-button {
                top: 50%;
                left: 50%;
                aspect-ratio: 1.875;
            }

            video {
                object-fit: cover;
            }
        `;

        const container = document.createElement('div');
        container.id = 'videoParentDiv';

        // Add Video.js CSS
        const videoJSCSS = document.createElement('link');
        videoJSCSS.rel = 'stylesheet';
        videoJSCSS.href = 'https://vjs.zencdn.net/7.20.3/video-js.css';

        // Add Video.js script
        const videoJSScript = document.createElement('script');
        videoJSScript.src = 'https://vjs.zencdn.net/7.20.3/video.min.js';

        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(videoJSCSS);
        this.shadowRoot.appendChild(videoJSScript);
        this.shadowRoot.appendChild(container);
    }

    getVideoJSConfigObject() {
        let config = {
            html5: {
                vhs: {
                    overrideNative: true
                }
            },
        };
        if (this.videoConfig) {
            config = Object.assign(config, this.videoConfig);
        }
        return config;
    }

    exposeVideoEvents(videoObj, videoAssetId, isHls) {
        const videoEvents = ["ended", "loadedmetadata", "play", "playing"];

        videoEvents.forEach((event) => {
            if (isHls) {
                videoObj.addEventListener(event, () => {
                    this.dispatchEvent(new CustomEvent('video-' + event, {
                        detail: {
                            videoId: videoAssetId
                        }
                    }));
                });
            } else {
                videoObj.on(event, () => {
                    this.dispatchEvent(new CustomEvent('video-' + event, {
                        detail: {
                            videoId: videoAssetId
                        }
                    }));
                });
            }
        });
    }

    enablePlayPauseOnVideo(videoObj) {
        videoObj.on('click', () => {
            if (videoObj.paused()) {
                videoObj.play();
            } else {
                videoObj.pause();
            }
        });
    }

    playUsingVideoElem(url, type, videoConfig, aid, isIPhone, isSafari) {
        const parentDiv = this.shadowRoot.getElementById('videoParentDiv');
        const videoObj = document.createElement('video');

        videoObj.preload = "none";
        videoObj.id = 'my-video';
        videoObj.controls = true;
        videoObj.className = 'video-js vjs-default-skin';
        
        if (!(videoConfig && videoConfig.hasOwnProperty("width"))) {
            videoObj.style.height = '100%';
            videoObj.style.width = '100%';
        }

        const sourceElement = document.createElement('source');
        sourceElement.src = url;
        sourceElement.type = type;
        videoObj.appendChild(sourceElement);

        if (videoConfig) {
            if (videoConfig.hasOwnProperty("currentTime") && videoConfig.currentTime >= 0) {
                if(isSafari) {
                    videoObj.addEventListener('loadedmetadata', () => {
                        videoObj.currentTime = videoConfig.currentTime;
                    });
                } else {
                    videoObj.currentTime = videoConfig.currentTime;
                }
            }

            if (videoConfig.hasOwnProperty("playsinline")) {
                videoObj.setAttribute("playsinline", "");
                videoObj.setAttribute("webkit-playsinline", "");
            }

            if(videoConfig.hasOwnProperty("autoplay")) {
                if(isIPhone && !videoConfig.hasOwnProperty("playsinline")) {
                    videoObj.setAttribute("playsinline", "");
                    videoObj.setAttribute("webkit-playsinline", "");
                }
                videoObj.setAttribute("autoplay","");
                videoObj.setAttribute("muted","");
            }

            if(videoConfig.hasOwnProperty("muted")) {
                videoObj.setAttribute("muted","");
            }

            if(videoConfig.hasOwnProperty("height")) {
                videoObj.setAttribute("height", videoConfig.height);
            }

            if(videoConfig.hasOwnProperty("poster")) {
                videoObj.poster = videoConfig.poster;
            }

            if(videoConfig.hasOwnProperty("loop")) {
                videoObj.setAttribute("loop","");
            }

            if(videoConfig.hasOwnProperty("width")) {
                videoObj.setAttribute("width", videoConfig.width);
            }

            if(videoConfig.hasOwnProperty("controls")) {
                if(videoConfig["controls"] === false) {
                    videoObj.removeAttribute("controls");
                }
            }
        }

        this.enablePlayPauseOnVideo(videoObj);
        this.exposeVideoEvents(videoObj, aid, true);

        parentDiv.appendChild(videoObj);
    }

    playUsingVideoJSPlayer(url, type, videoJSConfig, aid) {
        const parentDiv = this.shadowRoot.getElementById('videoParentDiv');
        const videoObj = document.createElement('video');

        videoObj.id = 'my-video';
        videoObj.controls = true;
        videoObj.className = 'video-js vjs-default-skin';
        videoObj.style.width = '100%';
        videoObj.style.height = '100%';

        parentDiv.appendChild(videoObj);

        const myVideo = videojs("my-video", videoJSConfig);

        videojs.Vhs.xhr.beforeRequest = (option) => {
            option.uri += window.location.search;
            option.headers = option.headers || {};

            if (this.authToken && this.authToken !== "") {
                option.headers["Authorization"] = this.authToken;
            }
        };

        myVideo.controlBar.fullscreenToggle = true;

        myVideo.src([
            { type: type, src: url }
        ]);

        this.enablePlayPauseOnVideo(myVideo);
        this.exposeVideoEvents(myVideo, aid, false);

        if (videoConfig) {
            if (videoConfig.hasOwnProperty("currentTime") && videoConfig.currentTime >= 0) {
                myVideo.currentTime(videoConfig.currentTime);
            }

            if (videoConfig.hasOwnProperty("playsinline") && document.getElementsByTagName("video").length > 0) {
                if (videoConfig.playsinline === true) {
                    document.getElementsByTagName("video")[0].removeAttribute("playsinline");
                }

                if (videoConfig.playsinline === false) {
                    document.getElementsByTagName("video")[0].setAttribute("playsinline", true);
                }
            }
        }
    }

    startVideo(aid) {
        const videoJSConfig = this.getVideoJSConfigObject();
        const deliveryEndpoint = "/adobe/assets/";
        const origin = window.location.origin;
        let url = origin + deliveryEndpoint + aid;
        
        if (!videoJSConfig.hasOwnProperty("poster")) {
            videoJSConfig.poster = url + "/as/thumbnail.jpeg?preferwebp=true&accept-experimental" + 
                "&width=" + innerWidth + "&height=" + innerHeight;
        }

        const agent = navigator.userAgent;
        const isSafari = /Version\/([0-9\._]+).*Safari/.test(agent);
        const isIPadDevice = /iPad/.test(agent);
        const isIPhone = /iPhone/.test(agent);

        if (isIPadDevice || isIPhone) {
            url = url + "/manifest" + "." + "m3u8";
            const type = "application/x-mpegURL";
            this.playUsingVideoElem(url, type, videoJSConfig, aid, isIPhone, isSafari);
        } else {
            url = url + "/manifest" + "." + "mpd";
            const type = "application/dash+xml";
            this.playUsingVideoJSPlayer(url, type, videoJSConfig, aid);
        }
    }

    initVideoPlayer() {
        const urlLink = this.getAttribute('src');
        if (!urlLink) {
            console.warn('dm-video: No src attribute provided');
            return;
        }

        const urlLinkNew = urlLink.substring(8);
        const parts = urlLinkNew.split('/');
        const aid = parts[3];

        window.addEventListener('message', (event) => {
            if (event.data && event.data.isIMSToken) {
                const secureDeliveryQueryParamKey = "secureDelivery";
                const searchParams = new URLSearchParams(window.location.search);
                if (searchParams && searchParams.get(secureDeliveryQueryParamKey) && 
                    searchParams.get(secureDeliveryQueryParamKey) === "true") {
                    this.authToken = event.data.token;
                }
            } else {
                try {
                    this.videoConfig = JSON.parse(event.data);
                } catch (err) { }
            }
        });

        this.dispatchEvent(new CustomEvent('video-config', {
            detail: {
                videoId: aid
            }
        }));

        setTimeout(() => {
            if (!this.videoConfig) {
                this.dispatchEvent(new CustomEvent('video-config', {
                    detail: {
                        videoId: aid
                    }
                }));
                setTimeout(() => {
                    this.startVideo(aid);
                }, 10);
            } else {
                this.startVideo(aid);
            }
        }, 5);
    }
}

customElements.define('dm-video', DMVideo); 