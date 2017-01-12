/**
 * Created by sarcoma on 12/01/17.
 */

/**
 * Set up Radio Show Data
 */
var res = new XMLHttpRequest(),
    url = "http://localhost:63342/snap-grid/data.json";
res.addEventListener('load', setRadioShowSelectData);
res.open("GET", url, true);
res.send();

function setRadioShowSelectData() {
    console.log("has select data");
    var radioShows = JSON.parse(res.response),
        select = document.getElementById("radioShows");

    console.log(radioShows);
    for (var i = 0; i < radioShows.data.length; i++) {
        console.log(i);
        var option = document.createElement("option");
        option.value = radioShows.data[i].id;
        option.innerHTML = radioShows.data[i].name;
        select.appendChild(option);
    }
}