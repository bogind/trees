const OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let treeLocation;
let newPointClicked = 0;
let trees;
let appsscriptUrl = "https://script.google.com/macros/s/AKfycbxlTZW-A2FfIeVdLEWS5pKcOEWcu1O7fAEsMUiOE-db5omVTbM0saW5bmkV8hL4Q_g/exec"

const map = L.map('map',{
    layers:OpenStreetMap_Mapnik,
    center: [ 31.983617, 34.7703552 ],
    zoom: 11,
});
reloadLayer()



L.Control.LastClick = L.Control.extend({
    onAdd: function(map) {
        var container = L.DomUtil.create('div','leaflet-bar');
        container.id = "addtreecontrol"
        container.style.width = '300px';
        container.style.height = '100px';
        container.style.padding = "5px";
        container.style.backgroundColor = 'white';

        var placeholder = L.DomUtil.create('p');
        placeholder.id = "placeholder"
        placeholder.innerText = "Click on the map to start mapping trees"

        var treeType = L.DomUtil.create('input');
        treeType.id = "treeType"
        treeType.placeholder = "Tree type"
        treeType.type = "text"

        var button = L.DomUtil.create('button');
        button.innerText = "Add New Tree"
        button.onclick = sendLocation

        container.append(placeholder,treeType,button)
        return container;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.lastClick = function(opts) {
    return new L.Control.LastClick(opts);
}

L.control.lastClick({ position: 'bottomright' }).addTo(map);
map.on('click',function(e){
    if(newPointClicked === 0){
        newPointClicked = 1;        
    }
    if(document.getElementById("placeholder")){
        document.getElementById("placeholder").innerText = `Last Clicked:\n Latitude: ${e.latlng.lat.toFixed(6)}, Longitude: ${e.latlng.lng.toFixed(6)}`
        
    }
    treeLocation = e.latlng;
})

function sendLocation(){
    if(newPointClicked === 1){
        textInput = document.getElementById("treeType");
        treeType = textInput.value;
        postData = {
            "lat": treeLocation.lat,
            "lon": treeLocation.lng,
        };
        if(treeType.length > 0){
            postData.type = treeType;
        }
        fetch(appsscriptUrl, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
            })
        newPointClicked = 0
        document.getElementById("placeholder").innerText = "Tree Added,\nClick the map again to add another"
    }
}

function reloadLayer(){
    fetch(appsscriptUrl)
    .then(response => response.json())
    .then(data => {
        if(map.hasLayer(trees)){
            map.removeLayer(trees)
        }
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

