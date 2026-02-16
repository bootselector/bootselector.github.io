function HomeControl(controlDiv, map) {
	controlDiv.style.padding = '5px';

	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = 'white';
	controlUI.style.borderStyle = 'solid';
	controlUI.style.borderWidth = '2px';
	controlUI.style.cursor = 'pointer';
	controlUI.style.textAlign = 'center';
	controlUI.title = 'Homeに戻る';
	controlDiv.appendChild(controlUI);

	var controlText = document.createElement('div');
	controlText.style.fontFamily = 'Arial,sans-serif';
	controlText.style.color = 'blue';
	controlText.style.fontSize = '12px';
	controlText.style.paddingLeft = '4px';
	controlText.style.paddingRight = '4px';
	controlText.innerHTML = '<b>Home</b>';
	controlUI.appendChild(controlText);

	google.maps.event.addDomListener(controlUI, 'click', function() {
		location.href = "index.html";
	});
}

function SpaceControl(controlDiv, map) {
	controlDiv.style.padding = '9px';
	var controlUI = document.createElement('div');
	controlDiv.appendChild(controlUI);
}

function position(x, y)
{
	this.x = x;
	this.y = y;
}

function getMarkerPosition()
{
	var n = 0;
	var markerPosition = new Array();
	var params = location.search.substring(1).split('&');

	for (i = 0; i < params.length; i++) {
		var val = params[i].match(/^pos[0-9]+=([0-9\.-]+),([0-9\.-]+)$/);
		if (val != null) {
			markerPosition[n] = new position(parseFloat(val[1]), parseFloat(val[2]));
			n++;
		}
	}

	return markerPosition;
}

function getCenterPosition()
{
	var n = 0;
	var pos = null;
	var params = location.search.substring(1).split('&');

	for (i = 0; i < params.length; i++) {
		var val = params[i].match(/^pos=([0-9\.-]+),([0-9\.-]+)$/);
		if (val != null) {
			pos = new position(parseFloat(val[1]), parseFloat(val[2]));
		}
	}

	return pos;
}

function getZoom()
{
	var params = location.search.substring(1).split('&');
	var zoom = 0;

	for (i = 0; i < params.length; i++) {
		var val = params[i].match(/^zoom=([0-9]+)$/);
		if (val != null) {
			zoom = parseInt(val[1]);
			break;
		}
	}

	return zoom;
}

function getPath()
{
	var params = location.search.substring(1).split('&');
	var path = "";

	for (i = 0; i < params.length; i++) {
		var val = params[i].match(/^path=([a-zA-Z0-9_]+)$/);
		if (val != null) {
			path = val[1];
			break;
		}
	}

	return path;
}

function initialize() {
	var pathValue = getPath();

	// マップ中央値取得
	var pos = getMarkerPosition();
	var centerPosition = getCenterPosition();
	var x = 0;
	var y = 0;
	if (centerPosition != null) {
		y = centerPosition.x;
		x = centerPosition.y;
	}
	else if (pos.length != 0) {
		var maxx = 0;
		var maxy = 0;
		var minx = 1000;
		var miny = 1000;
		for (i = 0; i < pos.length; i++) {
			maxx = Math.max(maxx, pos[i].x);
			maxy = Math.max(maxy, pos[i].y);
			minx = Math.min(minx, pos[i].x);
			miny = Math.min(miny, pos[i].y);
		}
		x = (maxx + minx) / 2;
		y = (maxy + miny) / 2;
	}
	else {
		x = 35.454082;
		y = 139.163215;
	}

	// ズーム値取得
	var zoomValue = getZoom();
	if (zoomValue == 0) {
		if (pathValue == "") {
			zoomValue = 12;
		}
		else {
			zoomValue = 13;
		}
	}

	// 地図作成
	var middle = new google.maps.LatLng(x, y);
	var mapOptions = {
		zoom: zoomValue,
		center: middle,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		mapTypeControlOptions: {
			position: google.maps.ControlPosition.RIGHT_TOP
		}
	}
	var map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

	// Homeリンク
	var homeControlDiv = document.createElement('div');
	var homeControl = new HomeControl(homeControlDiv, map);
	homeControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(homeControlDiv);

	// 広告用スペース
	var spaceControlDiv = document.createElement('div');
	var spaceControl = new SpaceControl(spaceControlDiv, map);
	spaceControlDiv.index = 2;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(spaceControlDiv);

	// 点滅マーカー
	var blinkIcon = new google.maps.MarkerImage (
		"icon/blink.gif",
		new google.maps.Size(32, 32),
		new google.maps.Point(0, 0),
		new google.maps.Point(16, 16)
	);
	for (i = 0; i < pos.length; i++) {
		new google.maps.Marker({
			position: new google.maps.LatLng(pos[i].x, pos[i].y),
			map: map,
			icon: blinkIcon,
			clickable:false,
			optimized:false
		});
	}

	// パス
	if (pathValue != "") {
		var pathLayer = new google.maps.KmlLayer('https://bootselector.github.io/kml/' + pathValue + '.kml?ver=132',
			{
			suppressInfoWindows: true,
			map: map,
			preserveViewport: true
			}
		);
		pathLayer.setMap(map);

		// ウィンドウオープン解除
		var iconDescriptionWindow = new google.maps.InfoWindow();
		google.maps.event.addListener(pathLayer, 'click', function(kmlMouseEvent) {
			var name = kmlMouseEvent.featureData.name;
			if (name == "SE") {
				iconDescriptionWindow.setContent("開始・終了");
			}
			else if (name == "S") {
				iconDescriptionWindow.setContent("開始");
			}
			else if (name == "E") {
				iconDescriptionWindow.setContent("終了");
			}
			else if (name == "B") {
				iconDescriptionWindow.setContent("泊");
			}
			else {
				return;
			}
			iconDescriptionWindow.setPosition(kmlMouseEvent.latLng);
			iconDescriptionWindow.open(map);
		});
	}

	// 山アイコン
	var kmlLayer = new google.maps.KmlLayer('https://bootselector.github.io/kml/mountain.kml?ver=333',
		{
		suppressInfoWindows: true,
		map: map,
		preserveViewport: true
		}
	);
	kmlLayer.setMap(map);

	// ウィンドウオープン解除
	var infoWindow = new google.maps.InfoWindow();
	google.maps.event.addListener(kmlLayer, 'click', function(kmlMouseEvent) {
		var name = kmlMouseEvent.featureData.name;
		var descr = kmlMouseEvent.featureData.description.replace(/ target="_blank"/ig, '');
		var dom = '<div style="font-family: Arial, sans-serif; font-size: small">' +
			'<div style="font-weight: bold; font-size: medium; margin-bottom: 0em">' +
			name +
			'</div>' +
			'<div>' +
			descr +
			'</div>' +
			'</div>';
		infoWindow.setContent(dom);
		infoWindow.setPosition(kmlMouseEvent.latLng);
		infoWindow.open(map);
	});
}

google.maps.event.addDomListener(window, 'load', initialize);
