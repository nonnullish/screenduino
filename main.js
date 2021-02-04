/*
to add:
 - lcd.setCursor(0, 0); (not immediately after createChar)
 - lcd.write(byte(0));

*/

let width = 16;
let height = 2;

let panelWidth = 80;

let activeSegments = [];

let updateCanvasSize = (w, h) => {
    width = w;
    height = h;
    generateSegments();
}

let replaceAt = (string, index, replace) => {
    return string.substring(0, index) + replace + string.substring(index + 1);
}

let setCursorAndWrite = (i, j) => {

}

let generateSegmentCode = (i, j, pixel) => {
    if (document.getElementById(`imageByteText${i}`) === null) {
        // BUGGY!
        let emptySegmentCode;
        if (i < (10 - 1)) {
            emptySegmentCode = `byte image0${i + 1}[8] = {B00000, B00000, B00000, B00000, B00000, B00000, B00000, B00000};
            lcd.createChar(${activeSegments.indexOf(i)}, image0${i + 1})
            `
        } else {
            emptySegmentCode = `byte image${i + 1}[8] = {B00000, B00000, B00000, B00000, B00000, B00000, B00000, B00000};
            lcd.createChar(${activeSegments.indexOf(i)}, image${i + 1})
            `
        }
        
        const text = document.createElement("span");
        text.setAttribute("id", `imageByteText${i}`);
        text.innerText = emptySegmentCode;
        bytes.appendChild(text);
    }

    let workingLine = document.getElementById(`imageByteText${i}`);
    workingLine = workingLine.innerText.substr(19, 62);
    workingLine = workingLine.split(', ').join('');
    workingLine = workingLine.split('B').join('');
    if (workingLine[j] == '0') {
        workingLine = replaceAt(workingLine, j, '1');
        pixel.style.backgroundColor = "#133700";
    }
    else if (workingLine[j] == '1') {
        workingLine = replaceAt(workingLine, j, '0');
        pixel.style.backgroundColor = "#5DC700";
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
    canvas.style.padding = `${panelWidth / 10}px`;
    canvas.innerHTML = "";
    bytes.innerHTML = "";

    document.getElementById("canvas").style.width = `${width * panelWidth + width * (panelWidth / 5)}px`;

    for (let i = 0; i < width * height; i++) {
        const segment = document.createElement("div");
        segment.setAttribute("id", "panel");
        segment.style.width = `${panelWidth}px`;
        segment.style.height = `${8 * panelWidth / 5}px`;
        segment.style.margin = `${panelWidth / 10}px`;

        for (let j = 0; j < 5 * 8; j++) {
            const pixel = document.createElement("pixel");
            pixel.setAttribute("id", "pixel");
            pixel.style.width = `${panelWidth / 5}px`;
            pixel.style.height = `${panelWidth / 5}px`;
            pixel.onclick = () => {
                if (activeSegments.includes(i) || activeSegments.length < 8) {
                    activeSegments.includes(i) ? null : activeSegments.push(i);
                    generateSegmentCode(i, j, pixel);
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
};