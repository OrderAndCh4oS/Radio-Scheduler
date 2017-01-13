var gridHolder = document.getElementById("gridHolder"),
    gridAnchor = document.getElementById("gridAnchor"),
    grid = document.getElementById('grid'),
    staging = document.getElementById("staging"),
    showCount = 0,
    currentTarget,
    currentTargetRect,
    origin = gridAnchor.getBoundingClientRect(),
    dx, dy,
    intervals = 12,
    blockHeight = 44,
    blockWidth = 144,
    blockIntervalWidth = blockWidth / intervals,
    intervalValue = 60 / intervals,
    monday = new Date(),
    gridDays = document.createElement('div'),
    gridDaysWidth = 100,
    gridTimes = document.createElement('div'),
    gridTimesHeight = 24,
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

gridHolder.addEventListener("mousedown", selectBlock);
document.getElementById("addShow").addEventListener("click", addShow);

monday.setHours(-((monday.getDay() - 1) * 24), 0, 0, 0);

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

gridHolder.insertBefore(gridTimes, gridAnchor);
gridHolder.insertBefore(gridDays, gridAnchor);

function addShow() {
    var select = document.getElementById("radioShows"),
        option = select.options[select.selectedIndex];
    if (option.text == "Select Show") {
        return;
    }
    showBar = createBlock(option.text, option.value);
    staging.appendChild(showBar);
}

function createBlock(showTitle, showID) {
    showCount++;

    var id = "radioShow-" + showCount,
        showBar = document.createElement("div"),
        title = document.createElement('p'),
        date = document.createElement('p');

    showBar.setAttribute("id", id);
    showBar.setAttribute("class", "radio-show color-one");

    showBar.dataset.title = showTitle;
    showBar.dataset.id = showID;

    title.innerHTML = showTitle;
    date.setAttribute('class', 'date meta');

    showBar.appendChild(title);
    showBar.appendChild(date);

    return showBar;
}

function selectBlock(ev) {
    if (!hasClass(ev.target, 'radio-show')) {
        return;
    }
    currentTarget = ev.target;
    currentTargetRect = currentTarget.getBoundingClientRect();

    dx = ev.offsetX + origin.left;
    dy = ev.offsetY + origin.top;
    if (!inResizeArea(currentTargetRect.width, ev.offsetX)) {
        document.addEventListener('onscroll', moveBlock);
        document.addEventListener('mousemove', moveBlock);
        document.addEventListener('mouseup', dropBlock);
    } else {
        document.addEventListener('mousemove', resizeBlock);
        document.addEventListener('mouseup', setBlockSize);
    }
}

function hasClass(element, className) {
    return element.className.indexOf(className) != -1;
}


function inResizeArea(blockWidth, offsetX) {
    return blockWidth - offsetX < blockIntervalWidth;
}

function moveBlock(ev) {
    var x = ev.pageX,
        y = ev.pageY;
    currentTarget.style.left = (x - dx) - gridDaysWidth + "px";
    currentTarget.style.top = (y - dy) - gridTimesHeight + "px";
}

function dropBlock() {
    if (isInGridBounds(currentTarget)) {
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

function resizeBlock(ev) {
    var x = ev.pageX;
    currentTarget.style.width = (x - currentTargetRect.left - window.scrollX) + "px";
}

function setBlockSize() {
    snapWidth(currentTarget);
    setBlockDateTime();
    document.removeEventListener('mousemove', resizeBlock);
    document.removeEventListener('mouseup', setBlockSize);
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
    right = currentTargetBounds.right;
    left = currentTargetBounds.left;
    if ((right - left) % snapTo != 0) {
        var snapPoint = right - left + (snapTo - Math.ceil((right - left) % snapTo));
        element.style.width = snapPoint + "px";
    }
}

function snapBlock(element) {
    var left, top,
        snapToLeft = blockIntervalWidth,
        snapToTop = blockHeight;
    currentTargetBounds = element.style.left;

    left = parseInt(element.offsetLeft);
    top = parseInt(element.offsetTop);

    if (left % snapToLeft != 0) {
        element.style.left = Math.floor(left - (left % snapToLeft)) + "px";
    }
    if (top % snapToTop != 0) {
        element.style.top = Math.floor(top - (top % snapToTop)) + "px";
    }
}

function setBlockDateTime() {
    var left = parseInt(currentTarget.offsetLeft),
        right = currentTarget.getBoundingClientRect().width + left,
        top = parseInt(currentTarget.offsetTop);

    startTime = pixelsToTime(left);
    endTime = pixelsToTime(right);
    date = pixelsToDate(top);

    setTimeAndDateOnBlock(currentTarget, startTime, endTime, date)
}

function setTimeAndDateOnBlock(element, startTime, endTime, date) {
    element.lastChild.innerHTML = startTime + '–' + endTime;
    element.dataset.date = date;
}

function pixelsToTime(sidePosition) {
    var minutes,
        dateTime = new Date(monday);

    minutes = Math.round(sidePosition / blockIntervalWidth) * intervalValue;
    dateTime.setMinutes(minutes);

    return formattedTime(dateTime);
}

function pixelsToDate(top) {
    var day = blockHeight,
        dateTime = new Date(monday);

    day = Math.round(top / day);
    hoursInDay = 24;
    dateTime.setHours((day - 1) * hoursInDay);

    return formattedDate(dateTime);
}

function formattedDate(date) {
    return date.getFullYear() + "-" + padZeroes(date.getMonth() + 1) + "-" + padZeroes(date.getDate());
}

function formattedTime(date) {
    return padZeroes(date.getHours()) + ':' + padZeroes(date.getMinutes());
}

function padZeroes(n) {
    return (n < 10) ? ("0" + n) : n;
}