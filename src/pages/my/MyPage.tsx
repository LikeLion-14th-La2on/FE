/**
 * 마이페이지: 프로필 카드 + 요약 3칸(완수 단계 · 도토리 · 연속) + 섹터별 진행도 + 메뉴
 * - 닉네임 수정 · 스트릭 보호권 · 로그아웃/회원탈퇴는 바텀시트, 도토리 내역은 새 페이지
 * Figma 975 → 390 (÷2.5)
 */
import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { BottomSheet, Button, ProgressBar } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { SECTORS, type Sector } from '@/constants/sectors'
import { ROUTES } from '@/router/routes'

// TODO: 사용자 정보 · 학습 진행 API 연결 후 교체
const MOCK = {
  nickname: '도토리부자',
  clearedStages: 4,
  acornTotal: 30,
  streakDays: 5,
  shieldCount: 0, // 가진 스트릭 보호권 수
  progress: {
    stock: { cleared: 2, total: 3 },
    life: { cleared: 1, total: 3 },
    basic: { cleared: 3, total: 3 },
  } as Record<Sector, { cleared: number; total: number }>,
}

const NICKNAME_MAX_LENGTH = 10

/** 스트릭 보호권: 도토리 5개에 1개, 최대 2개까지 가질 수 있다 */
const SHIELD_PRICE = 5
const SHIELD_MAX = 2

type Sheet = 'nickname' | 'shield' | 'account' | null

const SECTOR_ORDER: Sector[] = ['stock', 'life', 'basic']

/** 섹터별 진행 바 색: 채움 500 · 바탕 100 */
const BAR_COLOR: Record<Sector, { track: string; fill: string }> = {
  stock: { track: 'bg-apricot-100', fill: 'bg-apricot-500' },
  life: { track: 'bg-avocado-100', fill: 'bg-avocado-500' },
  basic: { track: 'bg-burnt-orange-100', fill: 'bg-burnt-orange-500' },
}

export default function MyPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState(MOCK.nickname)
  const [sheet, setSheet] = useState<Sheet>(null)
  const closeSheet = () => setSheet(null)

  const stats = [
    {
      label: '완수 단계',
      value: MOCK.clearedStages,
      box: 'bg-avocado-400',
      num: 'text-coconut-100',
      sub: 'text-avocado-100',
    },
    {
      label: '도토리',
      value: MOCK.acornTotal,
      emoji: '🌰',
      box: 'bg-apricot-200',
      num: 'text-apricot-800',
      sub: 'text-apricot-600',
    },
    {
      label: '연속',
      value: MOCK.streakDays,
      emoji: '🔥',
      box: 'bg-herb-100',
      num: 'text-herb',
      sub: 'text-herb-300',
    },
  ]

  const menus: { label: string; emoji?: string; onClick: () => void }[] = [
    { label: '캐릭터 상점', emoji: '🐿️', onClick: () => navigate(ROUTES.characterShop) },
    { label: '스트릭 보호권', emoji: '🛡️', onClick: () => setSheet('shield') },
    { label: '도토리 내역', emoji: '🌰', onClick: () => navigate(ROUTES.acornHistory) },
    { label: '로그아웃 · 회원탈퇴', onClick: () => setSheet('account') },
  ]

  return (
    <>
      <header className="flex items-center">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(ROUTES.home)}
          className="flex h-10 w-8 items-center text-herb"
        >
          <BackIcon className="w-[19px]" />
        </button>
        <h1 className="text-[18px] font-bold text-herb">마이페이지</h1>
      </header>

      {/* 프로필 */}
      <section className="mt-[18px] flex h-24 items-center gap-4 rounded-card bg-apricot-600 px-4 shadow-[0_4px_12px_rgb(0_0_0/0.05)]">
        {/* TODO: 캐릭터 이미지가 정해지면 교체 (지금은 디자인의 자리 표시) */}
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-dashed border-[#8aa39e] bg-[#dce5e2] text-center text-[9px] leading-tight text-[#5f7a75]">
          다람쥐
          <br />
          캐릭터
        </div>
        <div>
          <p className="text-[20px] leading-[1.4] font-bold text-coconut-100">{nickname}</p>
          <button
            type="button"
            onClick={() => setSheet('nickname')}
            className="text-[13px] leading-[1.4] text-herb"
          >
            닉네임 수정 ›
          </button>
        </div>
      </section>

      {/* 요약 3칸 */}
      <ul className="mt-gap grid grid-cols-3 gap-2">
        {stats.map(({ label, value, emoji, box, num, sub }) => (
          <li
            key={label}
            className={clsx('flex h-[66px] flex-col items-center rounded-2xl pt-[13px]', box)}
          >
            <p className={clsx('flex items-center gap-[5px] text-[20px] leading-6 font-bold', num)}>
              {emoji && (
                <span aria-hidden className="text-[18px]">
                  {emoji}
                </span>
              )}
              {value}
            </p>
            <p className={clsx('mt-[2px] text-[12px] leading-[1.4] font-bold', sub)}>{label}</p>
          </li>
        ))}
      </ul>

      {/* 섹터별 진행도 */}
      <section className="mt-gap rounded-card bg-coconut-100 p-4 shadow-[0_6px_0_var(--color-coconut-600)]">
        <h2 className="text-[17px] leading-[1.4] font-black text-herb">섹터별 진행도</h2>
        <ul className="mt-2 flex flex-col gap-[10px]">
          {SECTOR_ORDER.map((key) => {
            const { label, emoji } = SECTORS[key]
            const { cleared, total } = MOCK.progress[key]
            return (
              <li key={key}>
                <p className="text-[13px] leading-[1.4] font-medium text-herb">
                  <span aria-hidden>{emoji}</span> {label} {cleared}/{total}
                </p>
                <ProgressBar
                  value={cleared}
                  max={total}
                  trackClass={BAR_COLOR[key].track}
                  fillClass={BAR_COLOR[key].fill}
                  className="mt-[9px]"
                />
              </li>
            )
          })}
        </ul>
      </section>

      {/* 메뉴 */}
      <nav className="mt-gap rounded-card bg-avocado-100 py-[6px]">
        <ul>
          {menus.map(({ label, emoji, onClick }) => (
            <li key={label}>
              <button
                type="button"
                onClick={onClick}
                className="flex h-[42px] w-full items-center justify-between px-4 text-left text-[15px] font-bold text-herb"
              >
                <span>
                  {emoji && (
                    <span aria-hidden className="mr-1 text-[14px]">
                      {emoji}
                    </span>
                  )}
                  {label}
                </span>
                <span aria-hidden>›</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 시트는 열릴 때마다 새로 그려서 입력값 · 단계가 처음 상태로 돌아간다 */}
      {sheet === 'nickname' && (
        <NicknameSheet
          current={nickname}
          onClose={closeSheet}
          onSave={(next) => {
            setNickname(next)
            closeSheet()
          }}
        />
      )}
      {sheet === 'shield' && <ShieldSheet onClose={closeSheet} />}
      {sheet === 'account' && <AccountSheet onClose={closeSheet} />}
    </>
  )
}

/** 닉네임 수정: 닉네임 설정 화면과 같은 규칙 (최대 10자, 빈칸 불가) */
function NicknameSheet({
  current,
  onClose,
  onSave,
}: {
  current: string
  onClose: () => void
  onSave: (nickname: string) => void
}) {
  const [value, setValue] = useState(current)
  const trimmed = value.trim()
  // TODO: 닉네임 중복 확인 API 연결 후 결과로 교체
  const canSave = trimmed.length > 0 && trimmed.length <= NICKNAME_MAX_LENGTH && trimmed !== current

  const handleSave = () => {
    // TODO: 닉네임 저장 API 연결 (성공하면 onSave)
    onSave(trimmed)
  }

  return (
    <BottomSheet open onClose={onClose} labelledBy="nickname-sheet-title">
      <h2 id="nickname-sheet-title" className="text-title text-coconut-100">
        닉네임 수정
      </h2>
      <label className="flex h-[60px] items-center gap-2 rounded-btn border-2 border-herb-500 bg-coconut-100 px-gutter">
        <span className="sr-only">닉네임</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={NICKNAME_MAX_LENGTH}
          placeholder="닉네임을 입력해 주세요"
          className="min-w-0 flex-1 bg-transparent text-card-title text-burnt-orange-500 outline-none placeholder:font-medium placeholder:text-herb-300"
        />
        <span className="text-sub text-apricot-500">
          {value.length}/{NICKNAME_MAX_LENGTH}
        </span>
      </label>
      <Button className="mt-2 w-full" disabled={!canSave} onClick={handleSave}>
        저장
      </Button>
    </BottomSheet>
  )
}

/**
 * 스트릭 보호권: 도토리로 1개씩 산다 (최대 2개)
 * 서버가 홈 조회 때 끊김을 판정하면서, 빠진 날 수만큼 보호권이 있으면 자동으로 쓴다 (1개당 하루).
 * 보호권이 빠진 날보다 적으면 쓰지 않고 남겨 두고, 연속 학습은 끊긴다.
 */
function ShieldSheet({ onClose }: { onClose: () => void }) {
  const { shieldCount, acornTotal } = MOCK
  const isFull = shieldCount >= SHIELD_MAX
  const hasAcorns = acornTotal >= SHIELD_PRICE

  const handleBuy = () => {
    // TODO: 보호권 구매 API 연결 (성공하면 보유 수 · 도토리 갱신)
    onClose()
  }

  return (
    <BottomSheet open onClose={onClose} labelledBy="shield-sheet-title">
      <h2 id="shield-sheet-title" className="text-title text-herb">
        🛡️ 스트릭 보호권
      </h2>
      <p className="text-body break-keep text-herb-400">
        학습을 쉰 날, 보호권 1개가 하루를 대신 지켜줘요. 따로 쓸 필요 없이 홈에 들어오면 쉰 날
        수만큼 자동으로 써요.
        <br />쉰 날보다 보호권이 적으면 쓰지 않고 남겨 두고, 연속 학습은 끊겨요.
      </p>
      <ul className="grid grid-cols-2 gap-2 text-center">
        <li className="rounded-2xl bg-avocado-100 py-3">
          <p className="text-sub text-herb-300">가진 보호권</p>
          <p className="text-title text-herb">
            {shieldCount}
            <span className="text-body text-herb-300"> / {SHIELD_MAX}개</span>
          </p>
        </li>
        <li className="rounded-2xl bg-apricot-100 py-3">
          <p className="text-sub text-apricot-600">내 도토리</p>
          <p className="text-title text-apricot-800">🌰 {acornTotal}</p>
        </li>
      </ul>
      <Button className="mt-2 w-full" disabled={isFull || !hasAcorns} onClick={handleBuy}>
        {isFull
          ? `보호권은 최대 ${SHIELD_MAX}개까지 가질 수 있어요`
          : hasAcorns
            ? `🌰 ${SHIELD_PRICE}개로 1개 사기`
            : `도토리가 부족해요 (🌰 ${SHIELD_PRICE}개 필요)`}
      </Button>
    </BottomSheet>
  )
}

/** 로그아웃 · 회원탈퇴: 고른 뒤 한 번 더 확인한다 */
function AccountSheet({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [step, setStep] = useState<'menu' | 'logout' | 'withdraw'>('menu')

  /** 저장된 토큰을 지우고 로그인 화면으로 (뒤로 가기로 돌아오지 못하게 replace) */
  const leave = () => {
    try {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } catch {
      // 저장소를 못 쓰는 환경이면 지울 것도 없다
    }
    navigate(ROUTES.login, { replace: true })
  }

  const handleWithdraw = () => {
    // TODO: 회원탈퇴 API 연결 (성공하면 leave)
    leave()
  }

  return (
    <BottomSheet open onClose={onClose} labelledBy="account-sheet-title">
      {step === 'menu' && (
        <>
          <h2 id="account-sheet-title" className="text-title text-herb">
            계정
          </h2>
          <Button className="w-full" onClick={() => setStep('logout')}>
            로그아웃
          </Button>
          <button
            type="button"
            onClick={() => setStep('withdraw')}
            className="h-10 text-sub text-herb-300 underline"
          >
            회원탈퇴
          </button>
        </>
      )}

      {step === 'logout' && (
        <>
          <h2 id="account-sheet-title" className="text-title text-herb">
            로그아웃할까요?
          </h2>
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              취소
            </Button>
            <Button className="flex-1" onClick={leave}>
              로그아웃
            </Button>
          </div>
        </>
      )}

      {step === 'withdraw' && (
        <>
          <h2 id="account-sheet-title" className="text-title text-herb">
            정말 탈퇴할까요?
          </h2>
          <p className="text-body text-herb-400">탈퇴하면 되돌릴 수 없어요.</p>
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              취소
            </Button>
            <Button
              className="flex-1 enabled:bg-burnt-orange-500 enabled:shadow-[0_4px_0_var(--color-burnt-orange-700)]"
              onClick={handleWithdraw}
            >
              탈퇴하기
            </Button>
          </div>
        </>
      )}
    </BottomSheet>
  )
}
