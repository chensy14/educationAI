# 교육 소스 공개접근 점검 보고서

## 1. 목표
공개 웹과 공개 다운로드만 사용하여 초등 교육용 MVP에 활용 가능한 데이터/자산 소스를 확인하고, 로그인·권한 요청 없이 수집 가능한 범위와 금지/보류 범위를 구분합니다.

## 2. 실행 환경
- 작업 폴더: `/home/tjdgus/Downloads/edu_source_check_20260327_113100`
- 실행 시각 기준 산출물 검증: 파일 실제 존재 여부와 타임스탬프 기준
- 사용 경로: 공개 웹 페이지, 공개 다운로드 파일, 기존 존재 스크린샷, HTML/메타데이터 추출
- 제한: 로그인/결제/회원가입/권한 요청 없음

## 3. 사이트별 확인 결과
### NCIC
- 공개 접근 가능
- 홈 화면의 원문 인벤토리 카드에서 초등 `국어/수학/영어/사회 성취기준` 노출 확인
- 인벤토리 목록 페이지에서 `초등학교(2008.09) 간략정보` 노출 확인
- 이번 확인 범위에서는 성취기준 **코드**가 직접 노출되지 않았고, 일괄 다운로드 링크도 명확히 확보하지 못함
- 결과: 공개 메타데이터/인벤토리 수준은 활용 가능, 기준 코드 DB 구축은 추가 탐색 또는 제휴/다른 공개 경로 필요

### 에듀넷
- `https://www.edunet.net/clssFlTbl/list/18` 공개 접근 확인
- 2022 개정 교육과정 연수자료 목록/과목 자료 페이지 확인
- `downloads/edunet_math_ppt_actual.zip` 실제 존재 → 초등 수학 PPT 공개 다운로드 가능으로 판단
- 초등 국어 PPT는 기존 스크린샷에서 목록 노출 확인, 이번 작업에서는 별도 파일 저장 미실시
- 결과: 공개 연수자료 일부는 바로 확보 가능

### data.go
- `교육부_교과서 관련정보_20191231` 파일데이터 페이지 확인
- 형식: CSV
- 이용허락범위: `제한 없음`
- 페이지 문구상 파일데이터는 로그인 없이 다운로드 가능하며, 실제 `downloads/datago_textbook_catalog.csv` 존재
- 결과: 교과서 메타데이터 시드 구축에 매우 적합

### KOGL
- 공개 검색/상세 확인 가능
- KOGL 1유형 자산: `보통학교 산술서`, `시그래프아시아1`, `시그래프아시아2`
- 차단 예시: KOGL 2유형 `서문시장 제1지구`, KOGL 4유형 `서초음악문화지구 안내지도 (2)`
- 결과: KOGL 0/1만 MVP 후보, 2/3/4는 차단 필요

### 공유마당
- 공개 검색/상세 확인 가능
- 허용 예시(CC BY): `수학`, `과학수학`, `서울지도`
- 차단 예시(CC BY-NC): `태국 (667)`
- 결과: CC BY는 후보, CC BY-SA는 보류, NC/ND 포함은 차단

### STAS
- 공개 HTML에서 초등학교 메뉴 구조 노출 확인
  - 성취기준(평가기준) 검색
  - 수행평가 도구
  - 서·논술형 평가 도구
  - 학생평가 유형별 채점기준
- 도구/자료 이용 흐름에서 로그인 안내와 로그인 버튼 노출 확인
- 결과: 메뉴 구조는 참고 가능하지만 실제 도구/자료 활용은 로그인 또는 권한이 필요함

## 4. 실제로 수집 가능한 것
- NCIC 공개 인벤토리/카드 수준 메타데이터
- 에듀넷 공개 연수자료(실제 다운로드 가능한 파일에 한함)
- data.go 교과서 CSV 메타데이터
- KOGL 0/1 유형 공개 자산 메타데이터와 링크
- 공유마당 CC BY 자산 메타데이터와 링크
- 각 사이트 공개 접근 여부 및 라이선스 판정 로그

## 5. 실제로 수집하면 안 되는 것
- 로그인 뒤에만 보이는 자료
- 권한 요청이 필요한 STAS 내부 도구/콘텐츠
- 저작권/약관상 대량 복제 위험이 있는 교재 원문 전체
- KOGL 2/3/4, 공유마당 NC/ND 포함 자산의 MVP 상업/변형 활용
- 공개 허용이 명확하지 않은 대량 원문 복사본

## 6. 공개 자료만으로 MVP 가능한지
**부분 가능**합니다.
- 가능한 범위: 교과서 메타데이터 카탈로그, 공개 연수자료 샘플, 오픈 라이선스 이미지/삽화/지도 후보 수집, 공개 교육과정 인벤토리 연결
- 어려운 범위: 정교한 성취기준 코드 DB, 평가도구/채점기준 본문 활용, 폐쇄형 교재/평가 자료의 실제 콘텐츠 수집

## 7. 권한/제휴가 있어야 가능한 영역
- STAS 평가도구/자료 원문 접근
- NCIC에서 코드 기반의 완전한 성취기준 구조화가 필요할 경우 추가 공개 API/다운로드 또는 협의 경로
- 교과서 원문/지도서 원문 대량 활용
- 라이선스가 제한적인 KOGL/공유마당 자산의 상업적 서비스 반영

## 8. 생성된 파일 목록(절대경로)
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/report.md`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/summary.txt`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/seeds/curriculum_standard_seed.csv`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/seeds/textbook_catalog_seed.csv`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/seeds/open_asset_seed.csv`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/seeds/site_access_log.json`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/01_ncic_home.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/02_ncic_inventory.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/03_ncic_subject_standard.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/04_edunet_curriculum_list.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/05_edunet_subject_ppt.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/06_edunet_download_or_login.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/07_datago_dataset_page.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/08_datago_license_and_download.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/09_datago_download_result.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/10_kogl_search_results.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/11_kogl_asset_detail_allowed.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/12_kogl_asset_detail_blocked.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/13_gongu_search_results.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/14_gongu_asset_detail_allowed.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/15_gongu_asset_detail_blocked.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/16_stas_home_or_menu.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/17_stas_menu_structure.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/screenshots/18_stas_access_result.png`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/downloads/datago_textbook_catalog.csv`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/downloads/edunet_math_ppt.zip`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/downloads/edunet_math_ppt_actual.zip`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/seeds/curriculum_standard_seed.csv`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/seeds/open_asset_seed.csv`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/seeds/site_access_log.json`
- `/home/tjdgus/Downloads/edu_source_check_20260327_113100/seeds/textbook_catalog_seed.csv`

## 9. 다음 단계 제안
1. `textbook_catalog_seed.csv` 전체 컬럼 매핑 규칙을 정하고 정규화 파이프라인 작성
2. NCIC는 성취기준 코드가 보이는 상세 페이지/API/비교검색 경로를 별도 재탐색
3. KOGL/공유마당은 `allow_for_mvp=yes`만 자동 수집 대상으로 필터링
4. 에듀넷 공개 연수자료는 과목별 다운로드 가능 파일만 별도 인덱싱
5. STAS는 로그인 가능한 공식 계정/권한이 있을 때만 후속 조사
