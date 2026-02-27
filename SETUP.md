# 후쿠오카 여행 지도 - 프로젝트 설정 가이드

## 기술 스택

| 구분 | 기술 | 용도 |
|------|------|------|
| 지도 | [Leaflet.js](https://leafletjs.com/) 1.9.4 | 인터랙티브 지도 렌더링 |
| 타일 | [CartoDB Voyager](https://carto.com/basemaps/) | 지도 배경 타일 |
| DB | [Firebase Realtime Database](https://firebase.google.com/) | 실시간 데이터 동기화 |
| 호스팅 | [GitHub Pages](https://pages.github.com/) | 정적 사이트 배포 |
| PWA | Service Worker + manifest.json | 오프라인 지원, 홈 화면 추가 |
| 좌표변환 | [Google Apps Script](https://script.google.com/) | 단축 URL → 좌표/이름/지역 자동 추출 |
| 폰트 | Noto Sans KR (Google Fonts) | 한국어 UI |

## 프로젝트 구조

```
travel-map/
├── index.html              # 메인 HTML
├── css/style.css           # 전체 스타일
├── js/
│   ├── data.js             # 장소 데이터 (DEFAULT_DATA 배열)
│   ├── subway.js           # 지하철 노선 + 역 + 경로 좌표
│   ├── firebase-sync.js    # Firebase 초기화 및 동기화
│   └── app.js              # 메인 앱 로직
├── sw.js                   # Service Worker (오프라인 캐시)
├── manifest.json           # PWA 매니페스트
├── icons/                  # 앱 아이콘 (192, 512)
└── SETUP.md                # 이 파일
```

## 주요 기능

- 장소 마커 표시 (카테고리별 색상, 필수 장소 강조 애니메이션)
- 카테고리 필터 (맛집/카페/관광/쇼핑/온천/숙소)
- 장소 추가/수정/삭제 (Google Maps 링크에서 좌표 자동 추출, 단축 URL도 지원)
- 리스트 뷰 (카테고리순/거리순/이름순 정렬, 검색)
- GPS 실시간 추적
- 지하철 노선도 (공항선/하코자키선/나나쿠마선, OSM 실제 경로)
- Firebase 실시간 동기화 (다른 기기에서 변경 시 자동 반영)
- PWA 오프라인 지원

---

## 초기 설정 방법

### 1. GitHub 저장소 생성

```bash
# 저장소 생성 (public)
git init
git remote add origin https://github.com/<username>/travel-map.git
git add -A
git commit -m "initial commit"
git push -u origin main
```

### 2. GitHub Pages 배포

1. GitHub 저장소 → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **(root)**
4. Save
5. 배포 URL: `https://<username>.github.io/travel-map/`

### 3. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **프로젝트 추가** → 이름 입력 → Google Analytics **해제** → 생성
3. **Build → Realtime Database → Create Database**
   - 위치: **Singapore (asia-southeast1)** (한국/일본 가까움)
   - 보안 규칙: **test mode**로 시작
4. 프로젝트 설정(⚙️) → **일반** → 하단 **웹 앱 추가** (`</>`)
5. 앱 이름 입력 → 등록 → `firebaseConfig` 값 복사

### 4. Firebase 설정값 적용

`js/firebase-sync.js`에서 config 수정:

```javascript
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 5. Firebase 보안 규칙 (선택)

Firebase Console → Realtime Database → **Rules** 탭:

```json
{
  "rules": {
    "places": {
      ".read": true,
      ".write": true
    }
  }
}
```

> Firebase 웹 API 키는 클라이언트 식별용이며 비밀이 아닙니다.
> 보안은 Database Rules에서 제어합니다.

### 6. Google Apps Script 배포 (단축 URL 좌표 변환)

Google Maps 단축 URL(`maps.app.goo.gl/...`)에서 좌표, 이름, 지역을 자동 추출하는 서버리스 함수입니다.

1. [Google Apps Script](https://script.google.com/) → **새 프로젝트**
2. 아래 코드 붙여넣기:

```javascript
function doGet(e) {
  var result = { lat: null, lng: null, name: null, address: null, error: null };
  try {
    var shortUrl = e.parameter.url;
    if (!shortUrl) { result.error = 'Missing url'; return jsonResponse(result); }
    var response = UrlFetchApp.fetch(shortUrl, {
      followRedirects: false, muteHttpExceptions: true
    });
    var redirectUrl = response.getHeaders()['Location'] || '';
    var m = redirectUrl.match(/\/place\/([^\/]+)\//);
    if (!m) { result.error = 'No address found'; return jsonResponse(result); }
    var fullText = decodeURIComponent(m[1].replace(/\+/g, ' '));
    var parts = fullText.match(/^(.+?)\s+(\d.+)$/);
    if (parts) {
      result.name = parts[1].trim();
      result.address = parts[2]
        .replace(/,?\s*\d{3}-?\d{4}\s*/g, '')
        .replace(/,?\s*(일본|Japan|日本)\s*$/i, '')
        .trim();
    } else { result.name = fullText; }
    var geo = Maps.newGeocoder().geocode(fullText);
    if (geo.results && geo.results.length > 0) {
      var loc = geo.results[0].geometry.location;
      result.lat = loc.lat; result.lng = loc.lng;
    }
  } catch (err) { result.error = err.toString(); }
  return jsonResponse(result);
}
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **배포** → **새 배포** → 유형: **웹 앱** → 액세스: **모든 사용자** → 배포
4. 복사한 URL을 `js/app.js` 상단의 `GEOCODE_API` 변수에 설정:

```javascript
var GEOCODE_API = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

> 코드 수정 시 반드시 **새 배포**를 해야 변경사항이 반영됩니다 (기존 배포 수정 불가).

---

## 데이터 관리

### 장소 추가 (data.js)

`js/data.js`의 `DEFAULT_DATA` 배열에 항목 추가:

```javascript
{ id: 'd54', name: '장소이름', jp: '日本語名',
  cat: 'food', must: true,
  area: '지역정보', note: '메모',
  lat: 33.5900, lng: 130.4050,
  maps: 'https://www.google.com/maps/...', rating: '3.50' }
```

카테고리: `food`, `cafe`, `sight`, `shop`, `onsen`, `place`

### Firebase에 직접 데이터 push (CLI)

```bash
# 전체 데이터 push
curl -X PUT \
  "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app/places.json" \
  -H "Content-Type: application/json" \
  -d @firebase_data.json

# 단일 장소 추가/수정
curl -X PUT \
  "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app/places/d54.json" \
  -H "Content-Type: application/json" \
  -d '{"id":"d54","name":"새 장소","cat":"food","lat":33.59,"lng":130.40}'

# 데이터 읽기
curl "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app/places.json?shallow=true"
```

---

## 지하철 경로 데이터

`js/subway.js`의 `routeGeometry` 배열은 OpenStreetMap Overpass API에서 추출한 실제 노선 좌표입니다.

| 노선 | 색상 | 경유점 수 |
|------|------|-----------|
| 공항선 (空港線) | #F58220 | 302 |
| 하코자키선 (箱崎線) | #0072BC | 77 |
| 나나쿠마선 (七隈線) | #00A650 | 245 |

---

## 캐시 갱신

코드 수정 후 배포 시 `sw.js`의 `CACHE_NAME` 버전을 올려야 합니다:

```javascript
const CACHE_NAME = 'fukuoka-map-v3'; // 버전 증가
```

브라우저에서 즉시 반영하려면:
- **Ctrl+Shift+R** (강력 새로고침)
- 또는 DevTools → Application → Service Workers → **Unregister**
