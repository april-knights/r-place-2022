// ==UserScript==
// @name         April Knights & Alliance overlay
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  try to take over the canvas!
// @author       oralekin, LittleEndu, ekgame, iratekalypso, LeoVerto
// @match        https://hot-potato.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @downloadURL  https://github.com/april-knights/r-place-2022/raw/main/overlay.user.js
// @grant        GM_xmlhttpRequest
// @connect      april-knights.github.io
// ==/UserScript==

function addWarpSelect(structures) {
    let topControls = document.querySelector("mona-lisa-embed").shadowRoot.querySelector("mona-lisa-share-container").getElementsByClassName("top-controls")[0];
    let warpSelect = document.createElement("select");
    warpSelect.setAttribute("id", "warp-select");
    warpSelect.setAttribute("style", "pointer-events: all;");
    warpSelect.innerHTML = '<option value=""">Warp to structure</option>';

    Object.keys(structures).forEach(name => {
        let option = document.createElement("option");
        option.value = name;
        option.innerText = name;
        let x = structures[name].start_x;
        let y = structures[name].start_y;
        option.onclick = function() {
            window.top.location.replace("https://www.reddit.com/r/place/?cx=" + x + "&cy=" + y + "&px=20");
        };
        warpSelect.append(option);
    });

    topControls.append(warpSelect);
}

function addWarp() {
    try {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://april-knights.github.io/pixel/pixel.json",
            responseType: "json",
            onload: resp => {
                addWarpSelect(resp.response.structures);
            }
        });
    }
    catch (err) {
        console.log(err);
    }

}

function setup() {
    // Load the image
    let image = document.createElement("img");
    image.setAttribute("id", "mona-lisa-helper-overlay");
    image.src = "https://april-knights.github.io/pixel/overlay.png?cachebuster=" + new Date().getTime();
    image.onload = () => {
        image.style = `position: absolute; left: 0; top: 0; width: ${image.width/3}px; height: ${image.height/3}px; image-rendering: pixelated; z-index: 2`;
    };

    // Add the image as overlay
    let camera = document.querySelector("mona-lisa-embed").shadowRoot.querySelector("mona-lisa-camera");
    let canvas = camera.querySelector("mona-lisa-canvas");
    canvas.shadowRoot.querySelector('.container').appendChild(image);
    
    // Add a style to put a hole in the pixel preview (to see the current or desired color)
    const waitForPreview = setInterval(() => {
        const preview = camera.querySelector("mona-lisa-pixel-preview");
        if (preview) {
            clearInterval(waitForPreview);
            const style = document.createElement('style')
            style.innerHTML = '.pixel { clip-path: polygon(-20% -20%, -20% 120%, 37% 120%, 37% 37%, 62% 37%, 62% 62%, 37% 62%, 37% 120%, 120% 120%, 120% -20%); }'
            preview.shadowRoot.appendChild(style);
        }
    }, 100);

    setTimeout(addWarp, 5000);
}

function reload() {
    // TODO: Replace this shitty hack with something decent
    let camera = document.querySelector("mona-lisa-embed").shadowRoot.querySelector("mona-lisa-camera");
    let canvas = camera.querySelector("mona-lisa-canvas");
    let image = canvas.shadowRoot.getElementById("mona-lisa-helper-overlay");
    image.parentNode.removeChild(image);
    setup();
    console.log("Reloaded overlay");
}

function auto_reload() {
    reload();
    // Reload outline every five to six minutes
    setTimeout( auto_reload, (5 * 60 + Math.random() * 60) * 1000);
}

if (window.top !== window.self) {
    window.addEventListener('load', () => {
        setup();
        // First reload in five minutes
        setTimeout( auto_reload, (5 * 60) * 1000);
    }, false);
}
