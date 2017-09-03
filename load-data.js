var selectData = jsonRequest(baseUrl + '/data/select-data.json', 'GET',
  setSelectData)
var radioShowData = jsonRequest(baseUrl + '/data/radio-show-data.json', 'GET',
  setRadioShowData)

function setRadioShowData() {
    var data = JSON.parse(radioShowData.response);

    for (var i = 0; i < data.radio_shows.length; i++) {
        var radioShow = data.radio_shows[i],
            startTime = convertedDate(radioShow.start_time),
            endTime = convertedDate(radioShow.end_time),
            startTimeMinutes = startTime.getHours() * 60 + startTime.getMinutes(),
            endTimeMinutes = endTime.getHours() * 60 + endTime.getMinutes(),
            startTimePosition = (startTimeMinutes/5) * intervals,
            endTimePosition = (endTimeMinutes/5) * intervals,
            top = (startTime.getDay() - 1) * blockHeight;

        showBar = createBlock(radioShow.name, radioShow.id);
        setTimeAndDateOnBlock(showBar, formattedTime(startTime), formattedTime(endTime), formattedDate(startTime));
        showBar.style.left = startTimePosition + "px";
        showBar.style.top = top + "px";
        showBar.style.width = endTimePosition - startTimePosition + "px";
        grid.appendChild(showBar);
    }
}

function setSelectData() {
    var data = JSON.parse(selectData.response),
        select = document.getElementById("radioShows");

    for (var i = 0; i < data.radio_shows.length; i++) {
        var option = document.createElement("option"),
            radioShow = data.radio_shows[i];
        option.value = radioShow.id;
        option.innerHTML = radioShow.name;
        select.appendChild(option);
    }
}

function convertedDate(dateTime) {
    return new Date((dateTime).replace(/-/g, "/").replace(/[TZ]/g, " ").replace("/+0000/g", ""));
}

function jsonRequest(url, method, callback) {
    var res = new XMLHttpRequest();
    res.addEventListener('load', callback);
    res.open(method, url, true);
    res.send();
    return res;
}
