class Box {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        if (!width) this.width = 70;
        else this.width = width
        if (!height) this.height = 70;
        else this.height = height
        this.center = undefined;
        this.name = undefined;
    }
}
let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext('2d');
let image = new Image();
let boxes = [];
let currentBox;
let currentSide;
let currentBoxIndex;
let linkForDownload;
let popperInstance = null;
let downloadBtn = document.getElementById("download");
let input = document.getElementsByTagName("input")[0];
input.addEventListener('keyup', () => boxes[currentBoxIndex].name = input.value)
let mainContent = document.getElementById("main-content");
let popOver = document.getElementsByClassName("popover-content")[0];
document.getElementById("closePopUp").addEventListener('click', () => hidePopOver());
document.getElementById("removeBox").addEventListener('click', () => removeBox());
let uploadFile = document.getElementById("upload");
image.src = "./img.jpg";
const imageOnLoad = () => {
    canvas.width = image.width;
    canvas.height = image.height;
    drawImage();
    canvas.addEventListener('click', mouseClick);
    canvas.addEventListener('mousedown', mouseDown);
    canvas.addEventListener('mousemove', mouseMouseForHover);
    downloadBtn.addEventListener('click', () => download());
    uploadFile.addEventListener("change", uploadFileChange);
}
image.addEventListener('load', imageOnLoad);
const drawImage = () => {
    ctx.drawImage(image, 0, 0, image.width, image.height);
}
const mouseDown = (e) => {
    canvas.removeEventListener('mousemove', mouseMouseForHover);
    document.body.style.cursor = "default";
    const {
        x,
        y
    } = calculateXY(e.clientX, e.clientY);
    let index = isHitBy(x, y)
    if (index != -1) {
        currentBox = boxes[index];
        currentBoxIndex = index
        canvas.removeEventListener('click', mouseClick);
        canvas.addEventListener('mousemove', mouseMoveForDrag);
        canvas.addEventListener('mouseup', mouseUpForDrag);
    }
    if (getBorderOfClick(x, y)) {
        canvas.removeEventListener('click', mouseClick);
        canvas.addEventListener('mousemove', mouseMoveForResize);
        canvas.addEventListener('mouseup', mouseUpForResize);
    }
}
const mouseMouseForHover = (e) => {
    const {
        x,
        y
    } = calculateXY(e.clientX, e.clientY);
    if (getBorderOfClick(x, y)) {
        if (currentSide == "left" || currentSide == "right") document.body.style.cursor = "w-resize";
        if (currentSide == "up" || currentSide == "down") document.body.style.cursor = "s-resize";
    } else
        document.body.style.cursor = "default";

    let index = isHitBy(x, y)
    if (index != -1) {
        currentBox = boxes[index];
        currentBoxIndex = index;
        input.value = "";
        if (currentBox.name) input.value = currentBox.name;
        showPopOver();
    }


}
const getBorderOfClick = (x, y) => {
    if (boxes.length == 0) return false;
    return boxes.some(box => {
        let boxHeight = box.y + box.height;
        let boxWidth = box.x + box.width;
        if (x >= box.x && x <= boxWidth && (y == box.y || (y >= box.y - 2 && y <= box.y + 2))) {
            currentSide = "up";
            return true
        }

        if ((x == box.x || (x >= box.x - 2 && x <= box.x + 2)) && y >= box.y && y <= boxHeight) {
            currentSide = "left";
            return true
        }

        if (x >= box.x && x <= boxWidth && (y == boxHeight || (y >= boxHeight - 2 && y <= boxHeight + 2))) {
            currentSide = "down";
            return true
        }

        if ((x == boxWidth || (x <= boxWidth + 2 && x >= boxWidth - 2)) && y >= box.y && y <= boxHeight) {
            currentSide = "right";
            return true
        }
        return false;
    })
}
const isHitBy = (cx, cy) => {
    if (boxes.length == 0) return -1;
    return boxes.findIndex(box => cx > box.x + 2 && cx < (box.x - 2 + box.width) && cy > box.y + 2 && cy < (box.y - 2 + box.height))

}
const mouseMoveForResize = (e) => {
    hidePopOver();
    const {
        x,
        y
    } = calculateXY(e.clientX, e.clientY);
    if (currentSide) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (currentSide == "up" || currentSide == "down") {
            document.body.style.cursor = "s-resize";
            if (currentSide == "up") {
                currentBox.height = Math.abs(-y + currentBox.y + currentBox.height);
                currentBox.y = y
            } else currentBox.height = Math.abs(currentBox.y - y)
        }
        if (currentSide == "left" || currentSide == "right") {
            document.body.style.cursor = "w-resize";
            if (currentSide == "left") {
                currentBox.width = Math.abs(-x + currentBox.x + currentBox.width);
                currentBox.x = x;
            } else currentBox.width = Math.abs(x - currentBox.x);
        }
        drawImage();
        boxes[currentBoxIndex] = currentBox;
        redrawBoxes();
    }
}
const mouseUpForResize = (e) => {
    document.body.style.cursor = 'default';
    canvas.removeEventListener('mousemove', mouseMoveForResize);
    canvas.removeEventListener('mouseup', mouseUpForResize);
    modifyPopover(currentBox);
    canvas.addEventListener('mousemove', mouseMouseForHover);
    setTimeout(() => canvas.addEventListener('click', mouseClick))
}
const mouseMoveForDrag = (e) => {
    hidePopOver();
    document.body.style.cursor = 'all-scroll';
    const {
        x,
        y
    } = calculateXY(e.clientX, e.clientY);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImage();
    currentBox.x = x;
    currentBox.y = y;
    boxes[currentBoxIndex] = currentBox;
    redrawBoxes();
}
const mouseUpForDrag = (e) => {
    document.body.style.cursor = 'default';
    canvas.removeEventListener('mousemove', mouseMoveForDrag);
    canvas.removeEventListener('mouseup', mouseUpForDrag);
    modifyPopover(currentBox);
    canvas.addEventListener('mousemove', mouseMouseForHover);
    setTimeout(() => canvas.addEventListener('click', mouseClick))
}
const mouseClick = (e) => {
    const {
        x,
        y
    } = calculateXY(e.clientX, e.clientY);
    let index = isHitBy(x, y)
    if (index != -1) {
        currentBoxIndex = index;
        currentBox = boxes[index];
    } else {
        let box = new Box(x, y);
        currentBox = box;
        currentBoxIndex = boxes.length;
        draw(box);
        modifyPopover(box)
        boxes.push(box);
    }
    canvas.addEventListener('mousemove', mouseMouseForHover);
}
const calculateXY = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (clientX - rect.left) * canvas.width / rect.width,
        y: (clientY - rect.top) * canvas.height / rect.height
    }
}
const draw = (box) => {
    ctx.beginPath();
    ctx.strokeStyle = '#91a3b0';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
}
const download = () => {
    if (boxes.length == 0) {
        alert("Please at least draw one box to download")
        return;
    }
    document.body.style.cursor = "wait";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImage();
    boxes.forEach(box => {
        let imageData = ctx.getImageData(box.x, box.y, box.width, box.height);
        let canvasForDownload = document.createElement("canvas");
        canvasForDownload.width = box.width;
        canvasForDownload.height = box.height;
        canvasForDownload.getContext('2d').putImageData(imageData, 0, 0);
        if (!linkForDownload) {
            linkForDownload = document.createElement("a");
            document.body.append(linkForDownload);
        }
        linkForDownload.href = canvasForDownload.toDataURL();
        linkForDownload.download = box.name ? box.name : "Unnamed image"
        linkForDownload.click();
    })
    redrawBoxes();
    document.body.style.cursor = "default";
}
const removeBox = () => {
    hidePopOver()
    ctx.clearRect(currentBox.x - 2, currentBox.y - 2, currentBox.width + 4, currentBox.height + 4);
    drawImage();
    boxes.splice(currentBoxIndex, 1);
    redrawBoxes();

}
const redrawBoxes = () => {
    boxes.forEach(box => draw(box));
}
const modifyPopover = (box) => {
    let span = box.center
    if (!span) {
        span = document.createElement("span");
        span.className = "dynamic-center-box"
    }
    const rect = canvas.getBoundingClientRect();
    span.style.left = (box.x + rect.left) + 'px';
    span.style.top = box.y + 'px'
    box.center = span;
    mainContent.insertBefore(span, mainContent.lastChild);
    input.value = "";
    destroyPopOver();
    createPopOver();
}

const createPopOver = () => {
    popperInstance = Popper.createPopper(currentBox.center, popOver, {
        placement: 'top',
        strategy: 'fixed',
        modifiers: [{
            name: 'offset',
            options: {
                offset: [0, 8],
            },
        }, ],
    });
}
const destroyPopOver = () => {
    if (popperInstance) {
        popperInstance.destroy();
        popperInstance = null;
    }
}
const showPopOver = () => {
    popOver.setAttribute('data-show', '');
    createPopOver();
}
const hidePopOver = () => {
    popOver.removeAttribute('data-show');
    destroyPopOver();
}
const uploadFileChange = (e) => {
    hidePopOver();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let file = e.target.files[0];
    image.src = "";
    image.src = window.URL.createObjectURL(file);
    boxes = [];
    currentBox = undefined;
    currentBoxIndex = undefined;
}
