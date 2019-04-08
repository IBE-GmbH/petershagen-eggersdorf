var mymap;
var lyrOSM;
var lyrTopo;
var lyrImagery;
var lyrOutdoors;
var lyrGrenzePE;
var lyrBodenPE;
var lyrClientLines;
var lyrGwFlurAbstPE;
var lyrSearch;
var lyrMarkerCluster;
var mrkCurrentLocation;
var fgpDrawnItems;
var ctlAttribute;
var ctlScale;
var ctlMouseposition;
var ctlMeasure;
var ctlEasybutton;
var ctlSidebar;
var ctlLayers;
var ctlDraw;
var ctlStyle;
var objBasemaps;
var objOverlays;
var arProjectIDs = [];
var arHabitatIDs = [];
var arEagleIDs = [];
var arRaptorIDs = [];
var vectorGw;
var vectorBoden;
var vectorGemeinde;

$(document).ready(function(){

	
	//  ********* Map Initialization ****************
	
	mymap = L.map('mapdiv', {center:[52.53734, 12.80891], zoom:13, attributionControl:false});
	
	ctlSidebar = L.control.sidebar('side-bar').addTo(mymap);
	ctlSidebar.show();
	
	ctlEasyTransfer = L.easyButton('glyphicon-transfer', function(){
	   ctlSidebar.toggle();
	}).addTo(mymap);
	
	ctlAttribute = L.control.attribution().addTo(mymap);
	ctlAttribute.addAttribution('OSM');
	ctlAttribute.addAttribution('&copy; 2019 <a href="http://www.eckhof.de/">IBE - Ingenieurbüro Dr. Eckhof GmbH</a>');
	
	ctlScale = L.control.scale({position:'bottomright', metric:true,imperial:false, maxWidth:200}).addTo(mymap);

	ctlMouseposition = L.control.mousePosition().addTo(mymap);
	
	ctlMeasure = L.control.polylineMeasure().addTo(mymap);
	
	ctlEasyLocate = L.easyButton('glyphicon glyphicon-cd', function(){
		mymap.locate();
	}).addTo(mymap);
	
	ctlEasyHome = L.easyButton('glyphicon glyphicon-home', function(){
		 mymap.fitBounds(geojson.getBounds(), {
	paddingTopLeft:[300,0]
	});
	}).addTo(mymap);
	
	ctlSearch = L.Control.openCageSearch({position:'topleft', key: '3c38d15e76c02545181b07d3f8cfccf0',limit: 10}).addTo(mymap);
	
	popPeter = L.popup({maxWidth:200,keepInView:true});
	popPeter.setLatLng([52.523215, 13.779217]);
	popPeter.setContent("<h4>Gemeinde Petershagen</h4>");
	
	popEgg = L.popup({maxWidth:200,keepInView:true});
	popEgg.setLatLng([52.538560, 13.816903]);
	popEgg.setContent("<h4>Gemeinde Eggersdorf</h4>");
	
	//   *********** Layer Initialization **********
	
	lyrOSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
	lyrTopo = L.tileLayer.provider('OpenTopoMap');
	lyrImagery = L.tileLayer.provider('Esri.WorldImagery');
	lyrOutdoors = L.tileLayer.provider('Thunderforest.Outdoors');
	mymap.addLayer(lyrOSM);
	
	fgpDrawnItems = new L.FeatureGroup();
	fgpDrawnItems.addTo(mymap);
	
	/*lyrGrenzePE = L.geoJSON(vectorGemeinde, {color:'brown'}).addTo(mymap);
	
	lyrBodenPE = L.geoJSON(vectorBoden, {color: 'black'}).addTo(mymap);
	
	lyrGwFlurAbstPE = L.geoJSON(vectorGw,{
		style: function(feature) {
			switch (feature.properties.GwFlurAbst) {
				case '10 - 20': return {color: "red"};
				case '5 - 10': return {color: "yellow"};
				case '2 - 5': return {color: "green"};
				case '> 10': return {color: "orange"};
				}
			}
		}).addTo(mymap);*/
		
	/*Style for layers*/
	var stylelayer = {
		shapeColor: {
			color: "red",
			opacity: 1,
			fillcolor: "red",
			fillOpacity: 0.1,
			weight: 0.5
		},
		highlight: {
			weight: 5,
			color: '#629b1d',
			dashArray: '',
			fillOpacity: 0.7
		}
	}
	
	var geojson = L.geoJson(StTypen, {
		style: stylelayer.shapeColor,
		onEachFeature: onEachFeature
	}).addTo(mymap);
	
	// ********* Setup Layer Control  ***************
	
	objBasemaps = {
		"Open Street Maps": lyrOSM,
		"Topo Karte":lyrTopo,
		"Satellit":lyrImagery,
		"Outdoors":lyrOutdoors
	};
	
	objOverlays = {
		"Info-Karte":geojson
	};
	
	ctlLayers = L.control.layers(objBasemaps, objOverlays).addTo(mymap);
	
	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: function(e){
						$('#StTyp').html(e.target.feature.properties.StTyp);
						
						var getStTyp = document.getElementById('StTyp').innerHTML;
						
						var showText = StOrtTypen.filter(function(typ) {
							return typ.StOrtTyp == getStTyp;
						});
						document.getElementById('Standorttyp').innerHTML = showText[0].Standorttyp;
						
						var baumGeeignet = Standorttyp.filter(function(typ) {
							return typ.StOrtTyp.indexOf(getStTyp) > -1 && typ.Eignung == 'gut geeignet';
						});
						document.querySelector('#geeignet').innerHTML = ''
						baumGeeignet.forEach(function (typ,n) {
							const p = document.createElement('p')
							p.textContent = baumGeeignet[n].Baumart + ' (' + baumGeeignet[n].latName + ')'
							document.querySelector('#geeignet').appendChild(p);
						});
						
						var baumMoeglich = Standorttyp.filter(function(typ) {
							return typ.StOrtTyp.indexOf(getStTyp) > -1 && typ.Eignung == 'mäßig geeignet';
						});
						document.querySelector('#moeglich').innerHTML = ''
						baumMoeglich.forEach(function (typ,n) {
							const p = document.createElement('p')
							p.textContent = baumMoeglich[n].Baumart  + ' (' + baumMoeglich[n].latName + ')'
							document.querySelector('#moeglich').appendChild(p);
						});
						
						var baumUngeeignet = Standorttyp.filter(function(typ) {
							return typ.StOrtTyp.indexOf(getStTyp) > -1 && typ.Eignung == 'nicht geeignet';
						});
						document.querySelector('#ungeeignet').innerHTML = ''
						baumUngeeignet.forEach(function (typ,n) {
							const p = document.createElement('p')
							p.textContent = baumUngeeignet[n].Baumart  + ' (' + baumUngeeignet[n].latName + ')'
							document.querySelector('#ungeeignet').appendChild(p);
						});
						/*document.getElementById('geeignet').innerHTML = baumGeeignet[0].Baumart;*/
					}
		//dblclick : selectFeature
		});
	}

	var popupLayer;
	function highlightFeature(e) {
	var layer = e.target;
		layer.setStyle(stylelayer.highlight);
		info.update(layer.feature.properties);
	}

	function resetHighlight(e) {
		var layer = e.target;
		var feature = e.target.feature;
		if (checkExistsLayers(feature)) {
			setStyleLayer(layer, stylelayer.highlight)
		} else {
			setStyleLayer(layer, stylelayer.shapeColor)
		}
		/* popupLayer.on('mouseout', function(e) {
					this.closePopup();
				})*/
	}
	
	var featuresSelected = []

	function setStyleLayer(layer, styleSelected) {
		layer.setStyle(styleSelected)
	}

	function checkExistsLayers(feature) {
		var result = false
		for (var i = 0; i < featuresSelected.length; i++) {
			if (featuresSelected[i].FID == feature.properties.FID) {
				result = true;
				break;
			}
		};
		return result
	}
	

	/*show info layers*/
	var info = L.control({
		position: 'bottomleft'
	});

	info.onAdd = function(mymap) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function(properties) {
		this._div.innerHTML =

			'<h4>Standort-Informationen</h4>' + (properties ?
				`
					<b>Ortsteil:</b> ${properties.Ort}<br>
					<b>Bodentyp:</b> ${properties.Bodentyp}<br>
					<b>Wasserhaushaltstyp:</b> ${properties.WasserHHT}<br>
					
						` : 'Bewege die Maus über die Karte');
	};

	info.addTo(mymap);
	
	mymap.on('click', function(e){
		$("#mouse-location").html(LatLngToArrayString(e.latlng));
	});
	
	// ************ Location Events **************
	
	mymap.on('locationfound', function(e) {
		console.log(e);
		if (mrkCurrentLocation) {
			mrkCurrentLocation.remove();
		}
		mrkCurrentLocation = L.circle(e.latlng, {radius:e.accuracy/2}).addTo(mymap);
		mymap.setView(e.latlng, 14);
	});
	
	mymap.on('locationerror', function(e) {
		console.log(e);
		alert("Location was not found");
	});

//  *********  jQuery Event Handlers  ************

$("#btnLocate").click(function(){
	mymap.locate();
});

$("#btnPeter").click(function(){
		mymap.setView([52.523215, 13.779217], 17);
		mymap.openPopup(popPeter);
	});
	
$("#btnEgg").click(function(){
	mymap.setView([52.538560, 13.816903], 17);
	mymap.openPopup(popEgg);
});

//  ***********  General Functions *********

function LatLngToArrayString(ll) {
	return "["+ll.lat.toFixed(5)+", "+ll.lng.toFixed(5)+"]";
}

function returnLayerByAttribute(lyr,att,val) {
	var arLayers = lyr.getLayers();
	for (i=0;i<arLayers.length-1;i++) {
		var ftrVal = arLayers[i].feature.properties[att];
		if (ftrVal==val) {
			return arLayers[i];
		};
	};
	return false;
}

function testLayerAttribute(ar, val, att, fg, err, btn) {
	if (ar.indexOf(val)<0) {
		$(fg).addClass("has-error");
		$(err).html("**** "+att+" NOT FOUND ****");
		$(btn).attr("disabled", true);
	} else {
		$(fg).removeClass("has-error");
		$(err).html("");
		$(btn).attr("disabled", false);
	}
}

mymap.fitBounds(geojson.getBounds(), {
  paddingTopLeft:[300,0]
});


});