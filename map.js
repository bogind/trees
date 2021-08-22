// Define a basemap
const OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
// Create a map object with the basemap, center and zoom.
const map = L.map('map',{
    layers: OpenStreetMap_Mapnik,
    center: [ 31.983617, 34.7703552 ],
    zoom: 11,
});
// Define variable for later use.
let treeLocation;
let newPointClicked = 0;
let trees;
let appsscriptUrl = "https://script.google.com/macros/s/AKfycbwaXZv50yFgJ3HVUp2cdK0hTySWzfSIe6f6HTCZ4CHUI7RZ0rZ56laqSvxvaBeXLGzzrA/exec"

// Load the layer for the first time
reloadLayer()


// Create a class for the control that will show the users where they clicked 
// and allow them to add a tree type and send the results.
L.Control.LastClick = L.Control.extend({
    onAdd: function(map) {
        // basic container for the placeholder text, the text input and the send button
        var container = L.DomUtil.create('div','leaflet-bar');
        container.id = "addtreecontrol"
        container.style.width = '300px';
        container.style.height = '100px';
        container.style.padding = "5px";
        container.style.backgroundColor = 'white';
        // Don't count clicks on the container as map clicks.
        L.DomEvent.disableClickPropagation(container);

        // placeholder text with instructions, will later be used to update the users where they clicked
        var placeholder = L.DomUtil.create('p');
        placeholder.id = "placeholder"
        placeholder.innerText = "Click on the map to start mapping trees"

        // text input to allow users to add a tree type, can be used for text of any length
        var treeType = L.DomUtil.create('input');
        treeType.id = "treeType"
        treeType.placeholder = "Tree type"
        treeType.type = "text"

        // button to send the user clicked data to the apps script "API"
        var button = L.DomUtil.create('button');
        button.innerText = "Add New Tree"
        button.onclick = sendLocation

        // add all the secondary components to the container (our control)
        container.append(placeholder,treeType,button)
        // return the control with all of its functionality
        return container;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});
// create and add the control to the map.
L.control.lastClick = function(opts) {
    return new L.Control.LastClick(opts);
}
L.control.lastClick({ position: 'bottomright' }).addTo(map);

// define what happens when the map is clicked,
// mainly the treeLocation is updated and the placeholder text changes
map.on('click',function(e){
    if(newPointClicked === 0){
        newPointClicked = 1;        
    }
    if(document.getElementById("placeholder")){
        document.getElementById("placeholder").innerText = `Last Clicked:\n Latitude: ${e.latlng.lat.toFixed(6)}, Longitude: ${e.latlng.lng.toFixed(6)}`
        
    }
    treeLocation = e.latlng;
})

// function to run when the send button is clicked
function sendLocation(){
    // if there was a new click on the map
    // this prevents users from sending the same location mutiple times
    if(newPointClicked === 1){
        // get the type text input
        textInput = document.getElementById("treeType");
        treeType = textInput.value;
        // cerate an object to send to the server
        postData = {
            "lat": treeLocation.lat,
            "lon": treeLocation.lng,
        };
        // if the user added a type, add it to the data object
        if(treeType.length > 0){
            postData.type = treeType;
        }
        // Post the data object to the server with a HTTP POST request
        fetch(appsscriptUrl, {
            method: 'POST', 
            body: JSON.stringify(postData),
            })
        // reset new point clicked and prompt user to select anothe point
        newPointClicked = 0
        document.getElementById("placeholder").innerText = "Tree Added,\nClick the map again to add another"
    }
}

function reloadLayer(){
    // Perform a HTTP GET request, which should return our GeoJson.
    fetch(appsscriptUrl)
    .then(response => response.json())
    .then(data => {
        // If the map has the trees layer, remove it.
        if(map.hasLayer(trees)){
            map.removeLayer(trees)
        }
        // Redefine the trees layer, and add to the map.
        trees = L.geoJson(data,{
            onEachFeature: function(feature, layer){
                if (feature.properties && feature.properties.type) {
                    layer.bindPopup("Tree Type: " +feature.properties.type);
                }
            }
        })
        map.addLayer(trees)
    })
    
}

