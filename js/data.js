// ═══════════════════════════════════════════════════════════
// 후쿠오카 여행 장소 데이터
// 장소 추가/수정은 이 파일만 편집하면 됩니다!
// ═══════════════════════════════════════════════════════════
//
// 카테고리:  food=맛집, cafe=카페, sight=관광, shop=쇼핑, onsen=온천, place=숙소
// 필수 여부:  must: true 로 설정하면 강조 표시 (펄스 애니메이션 + 필수 뱃지)
//
// 장소 형식:
// {
//   id: "d1",               ← 고유 ID
//   name: "한국어 이름",
//   jp: "일본어 이름",
//   cat: "food",             ← 카테고리
//   must: true,              ← 필수 여부 (생략하면 false)
//   area: "지역/위치",
//   note: "메모",
//   lat: 33.5888, lng: 130.4047,
//   maps: "https://...",
//   rating: "3.60"           ← 타베로그 (선택)
// }

const DEFAULT_DATA = [
  // ──────────────────────────────────
  // 🍴 맛집 (food)
  // ──────────────────────────────────
  { id: "d1", name: "로바타 산코바시", jp: "炉ばた 三光橋", cat: "food", must: true, area: "텐진남/하루요시", note: "로바타야키 해산물·닭. 예약 필수", lat: 33.5888, lng: 130.4047, maps: "https://www.google.com/maps/search/?api=1&query=炉ばた+三光橋+福岡" },
  { id: "d2", name: "5엔 (고엔)", jp: "喫茶五圓", cat: "food", must: true, area: "하카타역 도보5분", note: "1979년 昭和레트로. 비프카레 750엔. 8:00~일몰. 일요 휴무!", lat: 33.5894, lng: 130.4184, maps: "https://www.google.com/maps/search/?api=1&query=5Yen+福岡+博多" },
  { id: "d3", name: "멘야 이시이", jp: "麺屋 いしヰ", cat: "food", must: true, area: "하카타역 도보5분", note: "명란카마타마버터우동 1,100엔. 오전만(~14:30). 대행렬!", lat: 33.5880, lng: 130.4200, maps: "https://www.google.com/maps/search/?api=1&query=麺屋いしヰ+博多" },
  { id: "d4", name: "탄야 하카타", jp: "たんやHAKATA", cat: "food", must: true, area: "하카타역 직결", note: "우설전문. 아침7시~! 아침정식 780엔. 맥밥리필·커피 무료", lat: 33.5898, lng: 130.4207, maps: "https://www.google.com/maps/search/?api=1&query=たんやHAKATA+博多1番街" },
  { id: "d5", name: "우오덴", jp: "博多シーフード うお田", cat: "food", must: true, area: "니시나카스", note: "명란덮밥·이쿠라계란말이덮밥. 아침7시~. 예약 가능", lat: 33.5924, lng: 130.4030, maps: "https://www.google.com/maps/search/?api=1&query=博多シーフード+うお田+西中洲" },
  { id: "d6", name: "도론파 히가시히에", jp: "高級和牛焼肉 ドロンパ", cat: "food", must: true, area: "히가시히에역 도보5분", note: "3,960엔 흑모와규 암소 원세트. 선착순. 1시간제. 화15~23시/토·일11~14시", lat: 33.5867, lng: 130.4320, maps: "https://www.google.com/maps/search/?api=1&query=高級和牛焼肉+ドロンパ+東比恵", rating: "3.06" },
  { id: "d7", name: "하카타 잇소우", jp: "博多一双", cat: "food", area: "하카타역", note: "거품 돈코츠 라멘. 대기20~30분", lat: 33.5907, lng: 130.4250, maps: "https://www.google.com/maps/search/?api=1&query=博多一双+博多駅東本店" },
  { id: "d8", name: "신신라멘", jp: "ShinShin 天神本店", cat: "food", area: "텐진", note: "크리미한 돈코츠+교자. 대기30~45분", lat: 33.5919, lng: 130.3985, maps: "https://www.google.com/maps/search/?api=1&query=博多らーめんShinShin+天神本店" },
  { id: "d9", name: "모츠나베 라쿠텐치", jp: "楽天地 博多駅前店", cat: "food", area: "하카타역", note: "간장 모츠나베 명가! 예약 강추. 3,000엔~", lat: 33.5893, lng: 130.4172, maps: "https://www.google.com/maps/search/?api=1&query=もつ鍋楽天地+博多駅前店" },
  { id: "d10", name: "케고야키톤", jp: "警固ヤキトン", cat: "food", area: "텐진/케고", note: "규슈산 뼈붙이 돼지 강불 야키톤", lat: 33.5872, lng: 130.3950, maps: "https://www.google.com/maps/search/?api=1&query=警固ヤキトン+福岡" },
  { id: "d11", name: "키스이마루", jp: "喜水丸 KITTE博多店", cat: "food", area: "KITTE博多", note: "이카멘타이 무한리필! 아침7:30~", lat: 33.5903, lng: 130.4194, maps: "https://www.google.com/maps/search/?api=1&query=喜水丸+KITTE博多店" },
  { id: "d12", name: "산미 토마토라멘", jp: "三味 333", cat: "food", area: "하카타역", note: "토마토 라멘! 24시간", lat: 33.5890, lng: 130.4216, maps: "https://www.google.com/maps/search/?api=1&query=三味+333+福岡" },
  { id: "d13", name: "바쿠로 야키니쿠", jp: "やきにくのバクロ", cat: "food", area: "캐널시티 근처", note: "자사목장 흑모와규. 유케·사시미. 런치900엔~", lat: 33.5872, lng: 130.4109, maps: "https://www.google.com/maps/search/?api=1&query=やきにくのバクロ+博多店", rating: "3.60" },
  { id: "d14", name: "키타로스시", jp: "博多 喜多郎寿し", cat: "food", area: "우라텐진", note: "샤리코마. 17~24시. 예약필수!", lat: 33.5888, lng: 130.3980, maps: "https://www.google.com/maps/search/?api=1&query=博多+喜多郎寿し+渡辺通" },
  { id: "d15", name: "쿠로다한", jp: "黒田飯", cat: "food", area: "다이묘", note: "마구로 도매직영! 네기토로동. 11~20:30", lat: 33.5905, lng: 130.3935, maps: "https://www.google.com/maps/search/?api=1&query=まぐろとご飯+黒田飯+大名" },
  { id: "d16", name: "야키니쿠 아카탄", jp: "焼肉 アカタン", cat: "food", area: "텐진남역", note: "적신·우설 전문. 카운터15석", lat: 33.5890, lng: 130.3998, maps: "https://www.google.com/maps/search/?api=1&query=焼肉+アカタン+天神" },
  { id: "d17", name: "야스베 오뎅", jp: "名代おでん やすべ", cat: "food", area: "나카스/텐진", note: "오뎅 명가", lat: 33.5907, lng: 130.4048, maps: "https://www.google.com/maps/search/?api=1&query=名代おでん+やすべ+福岡" },
  { id: "d18", name: "하츠야 하카타로우", jp: "初屋はかたろう", cat: "food", area: "하카타역 동쪽", note: "계란산도 880엔", lat: 33.5912, lng: 130.4230, maps: "https://www.google.com/maps/search/?api=1&query=初屋はかたろう+福岡" },
  { id: "d19", name: "마부시 무사시", jp: "博多牛まぶし 武蔵", cat: "food", area: "하카타역 치쿠시구치", note: "A4+ 흑모와규 마부시 2,000엔. 화휴무", lat: 33.5885, lng: 130.4230, maps: "https://www.google.com/maps/search/?api=1&query=黒毛和牛+博多牛まぶし+武蔵+博多駅" },
  { id: "d20", name: "이케폰 타키교자", jp: "池ぽん", cat: "food", area: "하카타역 치쿠시구치", note: "타키교자 전문. 시메로 짬뽕·오지야", lat: 33.5882, lng: 130.4228, maps: "https://www.google.com/maps/search/?api=1&query=博多炊き餃子+池ぽん+博多駅東" },
  { id: "d21", name: "에비스야 우동", jp: "えびすやうどん", cat: "food", area: "스미요시", note: "카르비붓카케 690엔. 수휴무", lat: 33.5862, lng: 130.4095, maps: "https://www.google.com/maps/search/?api=1&query=えびすやうどん+博多+住吉" },
  { id: "d22", name: "왕교자", jp: "王餃子", cat: "food", area: "나카스", note: "1964년 노포 중화. 17:30~01:30. 일휴무", lat: 33.5938, lng: 130.4058, maps: "https://www.google.com/maps/search/?api=1&query=王餃子+中洲+福岡" },
  { id: "d23", name: "교자유신", jp: "博多餃子 維新", cat: "food", area: "하카타 스미요시", note: "하카타 교자 전문", lat: 33.5872, lng: 130.4134, maps: "https://www.google.com/maps/search/?api=1&query=博多餃子+維新+福岡" },
  { id: "d24", name: "우나토토x몬자", jp: "宇奈とと 大名店", cat: "food", area: "다이묘", note: "우나동590엔~, 몬자콜라보. 11~24시", lat: 33.5912, lng: 130.3920, maps: "https://www.google.com/maps/search/?api=1&query=名代+宇奈とと+大名店+福岡" },
  { id: "d25", name: "쿠시쇼", jp: "串匠 筑紫口店", cat: "food", area: "하카타역 치쿠시구치", note: "쿠시아게. 런치1,000엔~. 연중무휴", lat: 33.5883, lng: 130.4225, maps: "https://www.google.com/maps/search/?api=1&query=串匠+博多駅筑紫口店" },
  { id: "d26", name: "스시 사시스", jp: "さしす KITTE博多", cat: "food", area: "KITTE博多 B1F", note: "2관165엔~ 가성비초밥. 예약불가", lat: 33.5901, lng: 130.4190, maps: "https://www.google.com/maps/search/?api=1&query=すし酒場+さしす+KITTE博多", rating: "3.23" },
  { id: "d27", name: "소후렌 야키소바", jp: "想夫恋 本店", cat: "food", area: "히타", note: "히타 철판 야키소바", lat: 33.3210, lng: 130.9405, maps: "https://www.google.com/maps/search/?api=1&query=想夫恋+本店+日田" },

  // ──────────────────────────────────
  // ☕ 카페 (cafe)
  // ──────────────────────────────────
  { id: "d28", name: "불랑제", jp: "BOUL'ANGE", cat: "cafe", area: "기온역 도보1분", note: "크로아상 소프트크림~380엔! 평일7:30~21:00", lat: 33.5926, lng: 130.4157, maps: "https://www.google.com/maps/search/?api=1&query=BOUL'ANGE+福岡大博多ビル店" },
  { id: "d29", name: "JAB 재즈카페", jp: "JAB", cat: "cafe", area: "텐진남", note: "1969년~ 재즈킷사. JBL, LP컬렉션", lat: 33.5875, lng: 130.4000, maps: "https://www.google.com/maps/search/?api=1&query=JAB+ジャズ喫茶+渡辺通+福岡" },
  { id: "d30", name: "커넥트 커피", jp: "CONNECT COFFEE", cat: "cafe", area: "텐진", note: "카페", lat: 33.5952, lng: 130.3982, maps: "https://www.google.com/maps/search/?api=1&query=CONNECT+COFFEE+天神" },
  { id: "d31", name: "하나후루", jp: "hanafru", cat: "cafe", area: "하루요시", note: "과일 페이스트리", lat: 33.5887, lng: 130.3998, maps: "https://www.google.com/maps/search/?api=1&query=hanafru+福岡" },
  { id: "d32", name: "이시무라 만세이도", jp: "石村萬盛堂", cat: "cafe", area: "하카타", note: "1905년 노포. 츠루노코 마시멜로", lat: 33.5916, lng: 130.4105, maps: "https://www.google.com/maps/search/?api=1&query=石村萬盛堂+本店+福岡" },

  // ──────────────────────────────────
  // 📍 관광 (sight)
  // ──────────────────────────────────
  { id: "d33", name: "나카스 야타이", jp: "中洲屋台街", cat: "sight", must: true, area: "나카스", note: "100개+ 포장마차. 18시~새벽. 현금필수!", lat: 33.5935, lng: 130.4060, maps: "https://www.google.com/maps/search/?api=1&query=中洲屋台+福岡" },
  { id: "d34", name: "다자이후 텐만구", jp: "太宰府天満宮", cat: "sight", must: true, area: "다자이후(40분)", note: "학문의 신. 소동상 만지기! 우메가에모치", lat: 33.5192, lng: 130.5350, maps: "https://www.google.com/maps/search/?api=1&query=太宰府天満宮" },
  { id: "d35", name: "쿠시다 신사", jp: "櫛田神社", cat: "sight", area: "하카타", note: "야간등불. 야마카사. 무료", lat: 33.5910, lng: 130.4098, maps: "https://www.google.com/maps/search/?api=1&query=櫛田神社+福岡" },
  { id: "d36", name: "도초지", jp: "東長寺", cat: "sight", area: "하카타", note: "최대 목조 좌불상. 100엔", lat: 33.5920, lng: 130.4138, maps: "https://www.google.com/maps/search/?api=1&query=東長寺+福岡" },
  { id: "d37", name: "마치야 향토관", jp: "博多町家ふるさと館", cat: "sight", area: "하카타", note: "200엔. QR한국어", lat: 33.5913, lng: 130.4105, maps: "https://www.google.com/maps/search/?api=1&query=博多町家ふるさと館" },
  { id: "d38", name: "오호리 공원", jp: "大濠公園", cat: "sight", area: "오호리", note: "호수2km 산책. 무료", lat: 33.5862, lng: 130.3779, maps: "https://www.google.com/maps/search/?api=1&query=大濠公園+福岡" },
  { id: "d39", name: "마이즈루 공원", jp: "舞鶴公園", cat: "sight", area: "오호리 옆", note: "100대명성. 벚꽃라이트업. 무료", lat: 33.5846, lng: 130.3825, maps: "https://www.google.com/maps/search/?api=1&query=舞鶴公園+福岡城跡" },
  { id: "d40", name: "후쿠오카 타워", jp: "福岡タワー", cat: "sight", area: "시사이드", note: "234m 전망대. 800엔", lat: 33.5935, lng: 130.3516, maps: "https://www.google.com/maps/search/?api=1&query=福岡タワー" },
  { id: "d41", name: "스미요시 신사", jp: "住吉神社", cat: "sight", area: "하카타역 도보10분", note: "3대 스미요시. 스모동상!", lat: 33.5860, lng: 130.4138, maps: "https://www.google.com/maps/search/?api=1&query=住吉神社+福岡" },
  { id: "d42", name: "teamLab", jp: "チームラボ", cat: "sight", area: "PayPay돔 옆", note: "디지털아트~2,400엔. 사전예약", lat: 33.5952, lng: 130.3615, maps: "https://www.google.com/maps/search/?api=1&query=チームラボフォレスト+福岡" },
  { id: "d43", name: "모모치 해변", jp: "シーサイドももち", cat: "sight", area: "시사이드", note: "인공해변. 석양·야경", lat: 33.5924, lng: 130.3540, maps: "https://www.google.com/maps/search/?api=1&query=シーサイドももち海浜公園" },
  { id: "d44", name: "카와바타 상점가", jp: "川端通商店街", cat: "sight", area: "나카스", note: "400m 아케이드", lat: 33.5925, lng: 130.4085, maps: "https://www.google.com/maps/search/?api=1&query=川端通商店街+福岡" },

  // ──────────────────────────────────
  // 🛍️ 쇼핑 (shop)
  // ──────────────────────────────────
  { id: "d45", name: "캐널시티", jp: "キャナルシティ博多", cat: "shop", area: "하카타", note: "건담·지브리. 분수쇼! 면세", lat: 33.5896, lng: 130.4108, maps: "https://www.google.com/maps/search/?api=1&query=キャナルシティ博多" },
  { id: "d46", name: "캐널시티 오파", jp: "OPA", cat: "shop", area: "나카스", note: "B1F 짱구 시네마!", lat: 33.5897, lng: 130.4086, maps: "https://www.google.com/maps/search/?api=1&query=キャナルシティOPA" },
  { id: "d47", name: "텐진 지하상가", jp: "天神地下街", cat: "shop", area: "텐진", note: "150개+ 매장", lat: 33.5924, lng: 130.3995, maps: "https://www.google.com/maps/search/?api=1&query=天神地下街+福岡" },
  { id: "d48", name: "미나 텐진", jp: "ミーナ天神", cat: "shop", area: "텐진", note: "GU·유니클로. 면세", lat: 33.5928, lng: 130.3980, maps: "https://www.google.com/maps/search/?api=1&query=ミーナ天神" },
  { id: "d49", name: "돈키호테", jp: "ドンキ 中洲店", cat: "shop", area: "나카스", note: "24시간! 면세", lat: 33.5941, lng: 130.4068, maps: "https://www.google.com/maps/search/?api=1&query=ドンキホーテ+中洲店" },
  { id: "d50", name: "하카타 데이토스", jp: "博多デイトス", cat: "shop", area: "하카타역", note: "멘타이코·히요코만주 선물", lat: 33.5895, lng: 130.4210, maps: "https://www.google.com/maps/search/?api=1&query=博多デイトス" },

  // ──────────────────────────────────
  // ♨️ 온천 (onsen)
  // ──────────────────────────────────
  { id: "d51", name: "마메다마치 히나마쓰리", jp: "豆田町商店街", cat: "onsen", area: "히타", note: "에도보존지구. 3/6~8 히나인형!", lat: 33.3230, lng: 130.9350, maps: "https://www.google.com/maps/search/?api=1&query=豆田町商店街+日田" },
  { id: "d52", name: "코토히라 온천", jp: "かやうさぎ", cat: "onsen", area: "히타", note: "130년 료칸. 당일입욕. 노천탕", lat: 33.3400, lng: 130.9200, maps: "https://www.google.com/maps/search/?api=1&query=琴ひら温泉+かやうさぎ+日田" },

  // ──────────────────────────────────
  // 🏨 숙소 (place)
  // ──────────────────────────────────
  { id: "d53", name: "하카타 에어비앤비", jp: "博多駅徒歩4分 サタのベッド", cat: "place", area: "하카타역 도보4분", note: "1K 원룸, 2인, 세르타 매트리스, 주방·세탁기·와이파이. 평점 4.69/5.0", lat: 33.58949, lng: 130.41524, maps: "https://www.airbnb.co.kr/rooms/1442514959659971618" },
];
