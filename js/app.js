// ═══ STORAGE ═══
const SK = 'fukuoka_trip_2025';
function load() {
  try {
    const r = localStorage.getItem(SK);
    if (r) {
      var saved = JSON.parse(r);
      // 새로 추가된 DEFAULT_DATA 항목을 자동 병합
      var ids = new Set(saved.map(function (l) { return l.id; }));
      DEFAULT_DATA.forEach(function (d) {
        if (!ids.has(d.id)) saved.push(JSON.parse(JSON.stringify(d)));
      });
      return saved;
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}
var _lastSyncJSON = '';
function save(d) {
  var json = JSON.stringify(d);
  localStorage.setItem(SK, json);
  if (window.firebaseSync) {
    _lastSyncJSON = json;
    firebaseSync.push(JSON.parse(json));
  }
}
function gid() { return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
let locs = load();

// ═══ MAP ═══
const map = L.map('map', { center: [33.590, 130.405], zoom: 14, zoomControl: false, attributionControl: false });
L.control.zoom({ position: 'topright' }).addTo(map);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

// ═══ CATEGORIES (simplified - no more -must variants) ═══
const CC = {
  'food':  { c: '#E53935', e: '🍴', l: '맛집' },
  'cafe':  { c: '#6D4C41', e: '☕', l: '카페' },
  'sight': { c: '#1565C0', e: '📍', l: '관광' },
  'shop':  { c: '#7B1FA2', e: '🛍️', l: '쇼핑' },
  'onsen': { c: '#00897B', e: '♨️', l: '온천' },
  'place': { c: '#FF6F00', e: '🏨', l: '숙소' }
};
const CATORDER = ['food', 'cafe', 'sight', 'shop', 'onsen', 'place'];

function mkIcon(loc) {
  var g = CC[loc.cat] || CC.food;
  var s = loc.must ? 32 : 26;
  var m = loc.must ? ' must-ring' : '';
  return L.divIcon({
    className: '', iconSize: [s, s], iconAnchor: [s / 2, s / 2], popupAnchor: [0, -s / 2 - 4],
    html: '<div class="custom-marker' + m + '" style="width:' + s + 'px;height:' + s + 'px;background:' + g.c + ';font-size:' + (s > 28 ? 15 : 12) + 'px;">' + g.e + '</div>'
  });
}

function mkPop(loc) {
  var g = CC[loc.cat] || CC.food;
  var mu = loc.must ? '<span class="popup-must">필수</span>' : '';
  var ra = loc.rating ? '<span class="popup-rating">' + loc.rating + '</span>' : '';
  var ml = loc.maps ? '<a href="' + loc.maps + '" target="_blank" class="popup-btn popup-btn-maps">🗺️ Maps</a>' : '';
  return '<div class="popup-inner">'
    + '<span class="popup-cat" style="background:' + g.c + '22;color:' + g.c + ';">' + g.e + ' ' + g.l + '</span>'
    + '<div class="popup-name">' + loc.name + ' ' + mu + ' ' + ra + '</div>'
    + (loc.jp ? '<div class="popup-name-jp">' + loc.jp + '</div>' : '')
    + (loc.area ? '<div class="popup-area">📍 ' + loc.area + '</div>' : '')
    + (loc.note ? '<div class="popup-note">' + loc.note + '</div>' : '')
    + '<div class="popup-btns">' + ml
    + '<button class="popup-btn popup-btn-edit" onclick="openEdit(\'' + loc.id + '\')">✏️</button>'
    + '<button class="popup-btn popup-btn-del" onclick="delLoc(\'' + loc.id + '\')">🗑️</button>'
    + '</div></div>';
}

let mLayer = L.layerGroup().addTo(map);
const activeCats = new Set(CATORDER);
let mustOnly = false;

function render() {
  mLayer.clearLayers();
  var c = 0;
  locs.forEach(function (loc) {
    if (!activeCats.has(loc.cat)) return;
    if (mustOnly && !loc.must) return;
    L.marker([loc.lat, loc.lng], { icon: mkIcon(loc) }).bindPopup(mkPop(loc), { maxWidth: 300 }).addTo(mLayer);
    c++;
  });
  document.getElementById('visible-count').textContent = c;
}

// ═══ LAYER PANEL ═══
function toggleLayerPanel() {
  var panel = document.getElementById('layerPanel');
  var btn = document.getElementById('layerBtn');
  panel.classList.toggle('open');
  btn.classList.toggle('open');
}
// 패널 밖 클릭 시 닫기
document.addEventListener('click', function (e) {
  var ctrl = document.getElementById('layerControl');
  if (!ctrl.contains(e.target)) {
    document.getElementById('layerPanel').classList.remove('open');
    document.getElementById('layerBtn').classList.remove('open');
  }
});

// ═══ FILTERS ═══
function syncFilterUI() {
  var allOn = activeCats.size === CATORDER.length;
  document.querySelector('[data-filter="all"]').classList.toggle('active', allOn);
  document.querySelectorAll('.layer-item[data-filter]').forEach(function (x) {
    var f = x.dataset.filter;
    if (f !== 'all' && f !== 'must') x.classList.toggle('active', activeCats.has(f));
  });
}
document.querySelectorAll('.layer-item').forEach(function (b) {
  b.addEventListener('click', function () {
    var f = b.dataset.filter;
    if (f === 'all') {
      // 전체: 모두 켜기
      activeCats.clear();
      CATORDER.forEach(function (cat) { activeCats.add(cat); });
    } else if (f === 'must') {
      mustOnly = !mustOnly;
      b.classList.toggle('active', mustOnly);
    } else {
      // 개별 카테고리: 해당 카테고리만 단독 선택
      activeCats.clear();
      activeCats.add(f);
    }
    if (f !== 'must') syncFilterUI();
    render();
  });
});

// ═══ GPS TRACKING ═══
let gpsMarker = null, gpsCircle = null, gpsWatchId = null, myLat = null, myLng = null;

function trackGPS() {
  if (gpsWatchId !== null) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
    if (gpsMarker) { map.removeLayer(gpsMarker); map.removeLayer(gpsCircle); gpsMarker = null; gpsCircle = null; }
    myLat = null; myLng = null;
    document.getElementById('gpsBtn').style.opacity = '0.5';
    toast('GPS 꺼짐', 'delete');
    renderList();
    return;
  }
  document.getElementById('gpsBtn').style.opacity = '1';
  if (!navigator.geolocation) { alert('GPS를 지원하지 않는 브라우저입니다'); return; }
  toast('GPS 연결 중...', 'success');
  gpsWatchId = navigator.geolocation.watchPosition(
    function (pos) {
      var lat = pos.coords.latitude, lng = pos.coords.longitude, acc = pos.coords.accuracy;
      myLat = lat; myLng = lng;
      if (!gpsMarker) {
        gpsMarker = L.marker([lat, lng], {
          icon: L.divIcon({ className: '', html: '<div class="gps-dot"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })
        }).addTo(map);
        gpsCircle = L.circle([lat, lng], { radius: acc, className: 'gps-accuracy', fillOpacity: 0.15, stroke: true, weight: 1 }).addTo(map);
        map.setView([lat, lng], 16);
      } else {
        gpsMarker.setLatLng([lat, lng]);
        gpsCircle.setLatLng([lat, lng]).setRadius(acc);
      }
      if (document.getElementById('listView').classList.contains('open') && listSort === 'dist') renderList();
    },
    function (err) { toast('GPS 오류: ' + err.message, 'delete'); },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );
}

// ═══ DISTANCE CALC ═══
function getDist(lat1, lng1, lat2, lng2) {
  var R = 6371e3, r = Math.PI / 180;
  var a = Math.sin((lat2 - lat1) * r / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lng2 - lng1) * r / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function fmtDist(m) { return m < 1000 ? Math.round(m) + 'm' : (m / 1000).toFixed(1) + 'km'; }

// ═══ LIST VIEW ═══
var listSort = 'cat';
function setSort(s) {
  listSort = s;
  document.querySelectorAll('.sort-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.sort === s); });
  renderList();
}

function openList() { document.getElementById('listView').classList.add('open'); renderList(); }
function closeList() { document.getElementById('listView').classList.remove('open'); }

function renderList() {
  var q = document.getElementById('listSearch').value.toLowerCase();
  var items = locs.filter(function (l) {
    if (!q) return true;
    return (l.name + ' ' + (l.jp || '') + ' ' + (l.area || '') + ' ' + (l.note || '')).toLowerCase().includes(q);
  });

  if (listSort === 'dist' && myLat !== null) {
    items.forEach(function (l) { l._dist = getDist(myLat, myLng, l.lat, l.lng); });
    items.sort(function (a, b) { return a._dist - b._dist; });
  } else if (listSort === 'name') {
    items.sort(function (a, b) { return a.name.localeCompare(b.name); });
  } else {
    items.sort(function (a, b) {
      var ai = CATORDER.indexOf(a.cat), bi = CATORDER.indexOf(b.cat);
      if (ai !== bi) return ai - bi;
      if (a.must && !b.must) return -1;
      if (!a.must && b.must) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  var body = document.getElementById('listBody');
  if (!items.length) { body.innerHTML = '<div class="list-empty">검색 결과가 없습니다</div>'; return; }

  var html = '', lastCat = '';
  items.forEach(function (loc) {
    var g = CC[loc.cat] || CC.food;
    if (listSort === 'cat' && loc.cat !== lastCat) {
      lastCat = loc.cat;
      html += '<div style="padding:8px 4px 4px;font-size:12px;font-weight:700;color:' + g.c + ';">' + g.e + ' ' + g.l + ' (' + items.filter(function (x) { return x.cat === loc.cat; }).length + ')</div>';
    }
    var mu = loc.must ? '<span class="li-must">필수</span>' : '';
    var ra = loc.rating ? '<span class="li-rating">' + loc.rating + '</span>' : '';
    var dist = (listSort === 'dist' && loc._dist !== undefined) ? '<span class="li-dist">' + fmtDist(loc._dist) + '</span>' : '';
    var mapsBtn = loc.maps ? '<a href="' + loc.maps + '" target="_blank" class="li-btn" style="background:rgba(26,115,232,.15);color:#4285f4;" onclick="event.stopPropagation()">🗺️ Maps</a>' : '';
    html += '<div class="list-item" onclick="goToLoc(\'' + loc.id + '\')">'
      + '<div class="li-top"><span class="li-emoji" style="background:' + g.c + ';">' + g.e + '</span><span class="li-name">' + loc.name + ' ' + mu + ' ' + ra + '</span>' + dist + '</div>'
      + (loc.jp ? '<div class="li-sub">' + loc.jp + '</div>' : '')
      + (loc.area ? '<div class="li-sub">📍 ' + loc.area + '</div>' : '')
      + (loc.note ? '<div class="li-note">' + loc.note + '</div>' : '')
      + '<div class="li-btns">' + mapsBtn
      + '<button class="li-btn" style="background:rgba(255,255,255,.06);color:#aab;" onclick="event.stopPropagation();openEdit(\'' + loc.id + '\')">✏️ 수정</button>'
      + '<button class="li-btn" style="background:rgba(229,57,53,.1);color:#E53935;" onclick="event.stopPropagation();delLoc(\'' + loc.id + '\')">🗑️</button>'
      + '</div></div>';
  });
  body.innerHTML = html;
}

function goToLoc(id) {
  var loc = locs.find(function (l) { return l.id === id; });
  if (!loc) return;
  closeList();
  map.setView([loc.lat, loc.lng], 17);
  setTimeout(function () {
    mLayer.eachLayer(function (m) {
      if (m.getLatLng && Math.abs(m.getLatLng().lat - loc.lat) < 0.0001 && Math.abs(m.getLatLng().lng - loc.lng) < 0.0001) m.openPopup();
    });
  }, 300);
}

// ═══ FORM ═══
function openAddModal() {
  document.getElementById('editId').value = '';
  document.getElementById('modalTitle').textContent = '📌 장소 추가';
  document.getElementById('submitBtn').textContent = '✅ 등록하기';
  document.getElementById('locForm').reset();
  document.getElementById('fMust').checked = false;
  document.getElementById('coordResult').style.display = 'none';
  document.getElementById('formModal').classList.add('open');
}

function openEdit(id) {
  map.closePopup();
  var loc = locs.find(function (l) { return l.id === id; });
  if (!loc) return;
  document.getElementById('editId').value = id;
  document.getElementById('modalTitle').textContent = '✏️ 수정';
  document.getElementById('submitBtn').textContent = '💾 저장';
  document.getElementById('fName').value = loc.name || '';
  document.getElementById('fNameJp').value = loc.jp || '';
  document.getElementById('fCat').value = loc.cat || 'food';
  document.getElementById('fMust').checked = !!loc.must;
  document.getElementById('fRating').value = loc.rating || '';
  document.getElementById('fArea').value = loc.area || '';
  document.getElementById('fNote').value = loc.note || '';
  document.getElementById('fLat').value = loc.lat || '';
  document.getElementById('fLng').value = loc.lng || '';
  document.getElementById('fMaps').value = loc.maps || '';
  document.getElementById('coordResult').style.display = 'none';
  document.getElementById('formModal').classList.add('open');
}

function closeFormModal() {
  document.getElementById('formModal').classList.remove('open');
  stopPick();
}

function submitForm(e) {
  e.preventDefault();
  var id = document.getElementById('editId').value;
  extractCoords();
  var lat = parseFloat(document.getElementById('fLat').value);
  var lng = parseFloat(document.getElementById('fLng').value);
  if (isNaN(lat) || isNaN(lng)) {
    alert('위치 정보가 필요해요!\nGoogle Maps 링크를 붙여넣거나\n지도에서 위치를 선택해주세요.');
    return;
  }
  var d = {
    id: id || gid(),
    name: document.getElementById('fName').value.trim(),
    jp: document.getElementById('fNameJp').value.trim(),
    cat: document.getElementById('fCat').value,
    must: document.getElementById('fMust').checked || undefined,
    rating: document.getElementById('fRating').value.trim() || undefined,
    area: document.getElementById('fArea').value.trim(),
    note: document.getElementById('fNote').value.trim(),
    lat: lat, lng: lng,
    maps: document.getElementById('fMaps').value.trim() || undefined
  };
  if (id) {
    var i = locs.findIndex(function (l) { return l.id === id; });
    if (i >= 0) locs[i] = d;
  } else {
    locs.push(d);
  }
  save(locs);
  render();
  closeFormModal();
  map.setView([d.lat, d.lng], 16);
  toast(id ? '수정 완료!' : '등록 완료!', 'success');
}

function extractCoords() {
  var url = document.getElementById('fMaps').value;
  if (!url) return;
  var lat, lng;
  var m1 = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (m1) { lat = parseFloat(m1[1]); lng = parseFloat(m1[2]); }
  if (!lat) { var m2 = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/); if (m2) { lat = parseFloat(m2[1]); lng = parseFloat(m2[2]); } }
  if (!lat) { var m3 = url.match(/place\/[^/]+\/(-?\d+\.?\d*),(-?\d+\.?\d*)/); if (m3) { lat = parseFloat(m3[1]); lng = parseFloat(m3[2]); } }
  if (!lat) { var m4 = url.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/); if (m4) { lat = parseFloat(m4[1]); lng = parseFloat(m4[2]); } }
  if (!lat) { var m5 = url.match(/query=(-?\d+\.?\d*),(-?\d+\.?\d*)/); if (m5) { lat = parseFloat(m5[1]); lng = parseFloat(m5[2]); } }
  if (lat && lng && lat > 30 && lat < 40 && lng > 125 && lng < 140) {
    document.getElementById('fLat').value = lat.toFixed(6);
    document.getElementById('fLng').value = lng.toFixed(6);
    document.getElementById('coordResult').style.display = 'block';
    document.getElementById('coordResult').textContent = '✅ 위치 자동 입력! (' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')';
  } else {
    document.getElementById('coordResult').style.display = 'none';
  }
}

function delLoc(id) {
  var loc = locs.find(function (l) { return l.id === id; });
  if (!loc || !confirm('"' + loc.name + '" 삭제?')) return;
  locs = locs.filter(function (l) { return l.id !== id; });
  save(locs);
  map.closePopup();
  render();
  renderList();
  toast('삭제됨', 'delete');
}

var ph = null;
function startPick() {
  document.getElementById('formModal').classList.remove('open');
  document.getElementById('pickBanner').classList.add('show');
  ph = function (e) {
    document.getElementById('fLat').value = e.latlng.lat.toFixed(6);
    document.getElementById('fLng').value = e.latlng.lng.toFixed(6);
    stopPick();
    document.getElementById('formModal').classList.add('open');
  };
  map.once('click', ph);
}
function stopPick() {
  document.getElementById('pickBanner').classList.remove('show');
  if (ph) map.off('click', ph);
  ph = null;
}

function toast(m, t) {
  var e = document.createElement('div');
  e.className = 'toast toast-' + t;
  e.textContent = m;
  document.body.appendChild(e);
  setTimeout(function () { e.remove(); }, 2000);
}

// ═══ SUBWAY LAYER ═══
var subwayLayer = L.layerGroup();
var subwayLines = L.layerGroup();
var subwayVisible = true;

function toggleSubway() {
  subwayVisible = !subwayVisible;
  var btn = document.getElementById('subwayBtn');
  if (subwayVisible) {
    subwayLayer.addTo(map);
    subwayLines.addTo(map);
    btn.classList.add('active');
    renderSubway();
  } else {
    map.removeLayer(subwayLayer);
    map.removeLayer(subwayLines);
    btn.classList.remove('active');
  }
}

function renderSubway() {
  subwayLayer.clearLayers();
  subwayLines.clearLayers();
  Object.keys(SUBWAY_DATA).forEach(function (key) {
    var line = SUBWAY_DATA[key];
    // Use actual route geometry if available, otherwise fall back to station coordinates
    var coords = line.routeGeometry ? line.routeGeometry.slice() : [];
    line.stations.forEach(function (st) {
      if (!line.routeGeometry) coords.push([st.lat, st.lng]);
      var icon = L.divIcon({
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -12],
        html: '<div class="subway-marker" style="border-color:' + line.color + ';"><div class="subway-inner" style="background:' + line.color + ';"></div></div>'
      });
      L.marker([st.lat, st.lng], { icon: icon })
        .bindPopup('<div style="text-align:center;padding:4px;"><div style="font-size:13px;font-weight:700;">' + st.name + '</div><div style="font-size:11px;color:#888;">' + st.jp + '</div><div style="font-size:10px;color:' + line.color + ';font-weight:600;margin-top:2px;">' + line.name + '</div></div>', { maxWidth: 200 })
        .addTo(subwayLayer);
    });
    L.polyline(coords, { color: line.color, weight: 3, opacity: 0.7, dashArray: '8 4' }).addTo(subwayLines);
  });
}

// ═══ SERVICE WORKER 등록 + 자동 업데이트 ═══
if ('serviceWorker' in navigator) {
  // SW가 업데이트되면 자동 새로고침
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      window.location.reload();
    });
  }
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  });
}

// ═══ INIT ═══
render();
// 지하철 기본 표시
subwayLayer.addTo(map);
subwayLines.addTo(map);
document.getElementById('subwayBtn').classList.add('active');
renderSubway();

var fk = locs.filter(function (l) { return l.lat > 33.5; });
if (fk.length) map.fitBounds(L.latLngBounds(fk.map(function (l) { return [l.lat, l.lng]; })), { padding: [50, 50], maxZoom: 14 });

// ═══ FIREBASE REAL-TIME SYNC ═══
if (window.firebaseSync) {
  // Connection indicator (UI only, no data push)
  firebaseSync.onConnection(function (connected) {
    var el = document.getElementById('syncStatus');
    if (el) {
      el.classList.toggle('connected', connected);
      el.title = connected ? '클라우드 연동됨' : '오프라인';
    }
  });

  // Initialize: Firebase is source of truth
  firebaseSync.read().then(function (fbData) {
    if (fbData && fbData.length > 0) {
      locs = fbData;
      localStorage.setItem(SK, JSON.stringify(locs));
      render();
    } else {
      // Firebase empty (first time) - push local data
      firebaseSync.push(locs);
    }
  });

  // Listen for remote changes (from other devices)
  firebaseSync.listen(function (data) {
    var json = JSON.stringify(data);
    if (json === _lastSyncJSON) return;
    _lastSyncJSON = json;
    locs = data;
    localStorage.setItem(SK, JSON.stringify(data));
    render();
    if (document.getElementById('listView').classList.contains('open')) renderList();
  });
}
