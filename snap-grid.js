
var body = document.getElementById('body'),
    gridHolder = document.getElementById("gridHolder"),
    grid = document.getElementById('grid'),
    staging = document.getElementById("staging"),
    showCount = 0,
    currentTarget,
    currentTargetRect,
    offset = gridHolder.getBoundingClientRect(),
    dx,
    dy;

gridHolder.addEventListener("mousedown", selectBlock);
document.getElementById("addShow").addEventListener("click", addShow);

function addShow() {
    showCount++;

    var id = "radioShow-" + showCount, showBar = document.createElement("div");
    showBar.setAttribute("id", id);
    showBar.setAttribute("class", "radio-show color-one");

    staging.appendChild(showBar);

}

function selectBlock(event) {
    if (!hasClass(event.target, 'radio-show')) {
        return;
    }
    var x = event.pageX,
        y = event.pageY;
    currentTarget = event.target;
    currentTargetRect = currentTarget.getBoundingClientRect();
    dx = x - currentTargetRect.left + offset.left;
    dy = y - currentTargetRect.top + offset.top;
    body.addEventListener('mousemove', moveBlock);
    body.addEventListener('mouseup', dropBlock);
}

function moveBlock() {
    var x = event.pageX,
        y = event.pageY;
    currentTarget.style.left = (x - dx) + "px";
    currentTarget.style.top = (y - dy) + "px";
}

function dropBlock() {
    if(isInGridBounds(currentTarget)) {
        grid.appendChild(currentTarget);
    } else {
        currentTarget.remove();
    }
    body.removeEventListener('mousemove', moveBlock);
    body.removeEventListener('mouseup', dropBlock);
}

function hasClass(element, className) {
    return element.className.indexOf(className) != -1;
}

function isInGridBounds(element) {
    var bounds = grid.getBoundingClientRect();
    currentTargetBounds = element.getBoundingClientRect();
    return !(currentTargetBounds.left <= bounds.left || currentTargetBounds.top <= bounds.top || currentTargetBounds.right >= bounds.right || currentTargetBounds.bottom >= bounds.bottom);
}