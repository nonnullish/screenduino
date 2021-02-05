let width = 16;
let height = 2;

let panelWidth = 5;

let activeSegments = [];

let updateCanvasSize = (w, h) => {
    width = w;
    height = h;
    panelWidth = w > 16 ? 4 : 5;
    generateSegments();
}

let replaceAt = (string, index, replace) => {
    return string.substring(0, index) + replace + string.substring(index + 1);
}

let setCursorAndWrite = (i, j) => {
    document.getElementById("createChar").innerText = "";
    document.getElementById("setCursor").innerText = "";

    let bytes = document.getElementById("bytes").innerText;
    let images = bytes.match(/(image\d\d)/gm);

    // createChar
    for (let i = 0; i < images.length; i++) {
        document.getElementById("createChar").innerText += `lcd.createChar(${i}, ${images[i]});
        `
    }

    // setCursorAndWrite
    for (i in images) {
        let segmentIndex = images[i].match(/\d\d/)[0] - 1;
        console.log(segmentIndex)
        let column = segmentIndex < width ? segmentIndex : segmentIndex - Math.floor(segmentIndex / width) * width;
        let row = Math.floor(segmentIndex / width);
        document.getElementById("setCursor").innerText += `lcd.setCursor(${column}, ${row});
        lcd.write(byte(${i}));
        `
    }

}

let generateSegmentCode = (i, j, pixel) => {

    if (document.getElementById(`imageByteText${i}`) === null) {
        let emptySegmentCode;
        if (i < (10 - 1)) {
            emptySegmentCode = `byte image0${i + 1}[8] = {B00000, B00000, B00000, B00000, B00000, B00000, B00000, B00000};
            `
        } else {
            emptySegmentCode = `byte image${i + 1}[8] = {B00000, B00000, B00000, B00000, B00000, B00000, B00000, B00000};
            `
        }

        const text = document.createElement("span");
        text.setAttribute("id", `imageByteText${i}`);
        text.innerText = emptySegmentCode;
        let bytes = document.getElementById("bytes");
        bytes.appendChild(text);
    }

    let workingLine = document.getElementById(`imageByteText${i}`);
    workingLine = workingLine.innerText.substr(19, 62);
    workingLine = workingLine.split(', ').join('');
    workingLine = workingLine.split('B').join('');
    if (workingLine[j] == '0') {
        workingLine = replaceAt(workingLine, j, '1');
        pixel.style.backgroundColor = "var(--activePixel)";
    }
    else if (workingLine[j] == '1') {
        workingLine = replaceAt(workingLine, j, '0');
        pixel.style.backgroundColor = "var(--inactivePixel)";
    }
    workingLine = workingLine.match(/.{1,5}/g).join(', B');
    workingLine = 'B' + workingLine;

    let oldLine = document.getElementById(`imageByteText${i}`).innerText;
    document.getElementById(`imageByteText${i}`).innerText = oldLine.replace(oldLine.substr(19, 62), workingLine);
    checkForEmptySegments(i);
}

let checkForEmptySegments = (i) => {
    emptyString = document.getElementById(`imageByteText${i}`).innerText.includes(`B00000, B00000, B00000, B00000, B00000, B00000, B00000, B00000`);
    if (emptyString === true) {
        document.getElementById(`imageByteText${i}`).remove();
        activeSegments = activeSegments.filter(item => item !== i);
    }
}

let generateSegments = () => {
    let canvas = document.getElementById("canvas");
    let bytes = document.getElementById("bytes");
    canvas.style.padding = `${panelWidth / 10}vw`;
    document.getElementById("createChar").innerHTML = "";
    document.getElementById("setCursor").innerHTML = "";
    canvas.innerHTML = "";
    bytes.innerHTML = "";

    document.getElementById("canvas").style.width = `${width * panelWidth + width * (panelWidth / 5)}vw`;

    for (let i = 0; i < width * height; i++) {
        const segment = document.createElement("div");
        segment.setAttribute("id", "panel");
        segment.style.width = `${panelWidth}vw`;
        segment.style.height = `${8 * panelWidth / 5}vw`;
        segment.style.margin = `${panelWidth / 10}vw`;

        for (let j = 0; j < 5 * 8; j++) {
            const pixel = document.createElement("pixel");
            pixel.setAttribute("id", "pixel");
            pixel.style.width = `${panelWidth / 5}vw`;
            pixel.style.height = `${panelWidth / 5}vw`;
            pixel.onclick = () => {
                if (activeSegments.includes(i) || activeSegments.length < 8) {
                    activeSegments.includes(i) ? null : activeSegments.push(i);
                    generateSegmentCode(i, j, pixel);
                    setCursorAndWrite(i, j);
                    checkForEmptySegments(i);
                    activeSegments.includes(i) ? null : activeSegments.push(i);
                }
            }
            segment.appendChild(pixel);
        }
        canvas.appendChild(segment);
    }
}

window.onload = () => {
    updateCanvasSize(width, height);
    document.getElementById("bitmap").style.width = `calc(${(width * 5 + width) / 2}vw - 20px)`;
    document.getElementById("bitmap").style.height = `${document.getElementById("canvas").offsetHeight}px`;
};