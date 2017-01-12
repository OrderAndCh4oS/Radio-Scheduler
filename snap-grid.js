var gridHolder = document.getElementById("gridHolder"),
    grid = document.getElementById('grid'),
    staging = document.getElementById("staging"),
    showCount = 0,
    currentTarget,
    currentTargetRect,
    offset = grid.getBoundingClientRect(),
    dx, dy,
    intervals = 12,
    blockHeight = 44,
    blockWidth = 144,
    blockIntervalWidth = blockWidth / intervals,
    intervalValue = 60 / intervals,
    monday = new Date(),  // ToDo: set this to the last Monday.
    gridDays = document.createElement('div'),
    gridDaysWidth = 100,
    gridTimes = document.createElement('div'),
    gridTimesHeight = 24,
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

monday.setHours(0, 0, 0, 0);

gridHolder.addEventListener("mousedown", selectBlock);
document.getElementById("addShow").addEventListener("click", addShow);

gridDays.className = "grid-days";
gridDays.style.width = gridDaysWidth;
gridTimes.className = "grid-times";
gridTimes.style.height = gridTimesHeight;

grid.style.marginLeft = gridDaysWidth;

for (var i = 0; i < 7; i++) {
    var dayDiv = document.createElement('div'),
        day = new Date(monday);
    dayDiv.id = "day-" + i + 1;
    dayDiv.className = "grid-day";
    dayDiv.style.height = blockHeight + "px";
    day.setHours(i * 24);
    dayDiv.innerHTML = "<p>" + days[day.getDay()];
    gridDays.appendChild(dayDiv);
}

for (var i = 0; i < 24; i++) {
    var timeDiv = document.createElement('div'),
        time = new Date(monday);
    timeDiv.id = "day-" + i + 1;
    timeDiv.className = "grid-time";
    timeDiv.style.width = blockWidth + "px";
    time.setHours(i);
    timeDiv.innerHTML = "<p>" + formattedTime(time);
    gridTimes.appendChild(timeDiv);
}

gridHolder.insertBefore(gridTimes, grid);
gridHolder.insertBefore(gridDays, grid);

function addShow() {
    showCount++;

    var id = "radioShow-" + showCount, showBar = document.createElement("div");
    showBar.setAttribute("id", id);
    showBar.setAttribute("class", "radio-show color-one");
    staging.appendChild(showBar);
}

function selectBlock(ev) {
    if (!hasClass(ev.target, 'radio-show')) {
        return;
    }
    var x = ev.clientX,
        y = ev.clientY;
    currentTarget = ev.target;
    currentTargetRect = currentTarget.getBoundingClientRect();
    console.log(currentTargetRect.left);
    dx = x - currentTargetRect.left + offset.left - gridDaysWidth;
    dy = y - currentTargetRect.top + offset.top;
    if (!inResizeArea(currentTargetRect.width, ev.offsetX)) {
        document.addEventListener('onscroll', moveBlock);
        document.addEventListener('mousemove', moveBlock);
        document.addEventListener('mouseup', dropBlock);
    } else {
        document.addEventListener('mousemove', resizeBlock);
        document.addEventListener('mouseup', setBlockSize);
    }
}

function inResizeArea(blockWidth, offsetX) {
    return blockWidth - offsetX < blockIntervalWidth;
}

function resizeBlock(ev) {
    var x = ev.clientX;
    currentTarget.style.width = (x - currentTargetRect.left) + "px";
}

function setBlockSize() {
    snapWidth(currentTarget);
    setBlockDateTime();

    document.removeEventListener('mousemove', resizeBlock);
    document.removeEventListener('mouseup', setBlockSize);
}

function moveBlock(ev) {
    var x = ev.clientX,
        y = ev.clientY;
    currentTarget.style.left = (x - dx) + window.scrollX + "px";
    currentTarget.style.top = (y - dy) + "px";
    console.log("move", window.scrollX);
}

function dropBlock(ev) {
    var x = ev.clientX;
    if (isInGridBounds(currentTarget)) {
        console.log("drop", window.scrollX);
        currentTarget.style.left = (x - dx) + window.scrollX + "px";
        grid.appendChild(currentTarget);
        snapBlock(currentTarget);
        blockBounds = currentTarget.getBoundingClientRect();
        setBlockDateTime()
    } else {
        currentTarget.remove();
    }
    document.removeEventListener('onscroll', moveBlock);
    document.removeEventListener('mousemove', moveBlock);
    document.removeEventListener('mouseup', dropBlock);
}

function hasClass(element, className) {
    return element.className.indexOf(className) != -1;
}

function isInGridBounds(element) {
    var bounds = grid.getBoundingClientRect();
    currentTargetBounds = element.getBoundingClientRect();
    return (currentTargetBounds.left > bounds.left
        && currentTargetBounds.top > bounds.top
        && currentTargetBounds.bottom < (bounds.bottom + blockHeight - 1)
        && currentTargetBounds.right < (bounds.right + blockWidth - 1)
    );
}

function snapWidth(element) {
    var left, right,
        snapTo = blockIntervalWidth,
        currentTargetBounds = element.getBoundingClientRect();
    right = currentTargetBounds.right - offset.left;
    left = currentTargetBounds.left - offset.left;
    if ((right - left) % snapTo != 0) {
        var snapPoint = right - left + (snapTo - Math.ceil((right - left) % snapTo));
        element.style.width = snapPoint + "px";
    }
}

function snapBlock(element) {
    var left, top,
        snapToLeft = blockIntervalWidth,
        snapToTop = blockHeight;
    currentTargetBounds = element.getBoundingClientRect();
    console.log("bounds", currentTargetBounds);

    left = currentTargetBounds.left - offset.left + window.scrollX;
    top = currentTargetBounds.top - offset.top;
    if (left % snapToLeft != 0) {
        element.style.left = Math.floor(left - (left % snapToLeft)) + gridDaysWidth + "px";
    }
    if (top % snapToTop != 0) {
        element.style.top = Math.floor(top - (top % snapToTop)) + gridTimesHeight + "px";
    }
}

function setBlockDateTime() {
    var blockBounds;
    blockBounds = currentTarget.getBoundingClientRect();
    leftDateTime = pixelsToTime(blockBounds.left);
    rightDateTime = pixelsToTime(blockBounds.right);
    date = pixelsToDate(blockBounds.top);

    currentTarget.innerHTML = "<p>" + date + "<p>" + leftDateTime + '–' + rightDateTime;
}

function pixelsToTime(sidePosition) {
    var minutes,
        dateTime = new Date(monday);

    minutes = Math.round((sidePosition - offset.left + window.scrollX) / blockIntervalWidth) * intervalValue;
    dateTime.setMinutes(minutes);

    return formattedTime(dateTime);
}

function pixelsToDate(top) {
    var day = blockHeight,
        dateTime = new Date(monday),
        formattedDate;
    day = Math.round((top - offset.top) / day);
    hoursInDay = 24;
    dateTime.setHours(day * hoursInDay);

    formattedDate = dateTime.getFullYear() + "-" + padZeroes(dateTime.getMonth() + 1) + "-" + padZeroes(dateTime.getDate());
    return formattedDate;
}

function formattedTime(date) {
    return padZeroes(date.getHours()) + ':' + padZeroes(date.getMinutes());
}

function padZeroes(n) {
    return (n < 10) ? ("0" + n) : n;
}