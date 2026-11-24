/** 닉네임 규칙: 한글 · 영문 · 숫자만 2~10자 (닉네임 설정 · 마이페이지 닉네임 수정 공통) */
export const NICKNAME_MIN_LENGTH = 2
export const NICKNAME_MAX_LENGTH = 10
export const NICKNAME_RULE_TEXT = '한글, 영문, 숫자 2~10자로 입력해 주세요'

/** 완성형 한글(가~힣) · 영문 · 숫자만 (자음 · 모음만 있는 'ㄱ', 띄어쓰기, 특수문자는 안 된다) */
const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{2,10}$/

/** 서버에 중복 확인을 보내기 전에 형식부터 검사한다 (형식이 틀려도 서버는 available: false를 줘서 '이미 사용 중'으로 보이기 때문) */
export const isValidNickname = (nickname: string) => NICKNAME_PATTERN.test(nickname)
