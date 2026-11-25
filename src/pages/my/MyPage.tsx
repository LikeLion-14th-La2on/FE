/**
 * 마이페이지: 프로필 카드 + 요약 3칸(완수 단계 · 도토리 · 연속) + 섹터별 진행도 + 메뉴
 * - 닉네임 수정 · 스트릭 보호권 · 로그아웃/회원탈퇴는 바텀시트, 도토리 내역은 새 페이지
 * - 닉네임 · 캐릭터는 내 정보(GET /users/me), 완수 단계 · 연속 · 섹터별 진행도는 학습 현황(GET /users/me/stats),
 *   도토리 · 가진 보호권 수는 홈(GET /home)에서 함께 불러온다
 * Figma 975 → 390 (÷2.5)
 */
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { logout } from '@/api/auth'
import { ApiError } from '@/api/client'
import { getHome } from '@/api/home'
import { buyShield } from '@/api/streak'
import { toSector } from '@/api/types'
import { checkNickname, getMe, getStats, updateNickname, withdraw } from '@/api/user'
import {
  BottomSheet,
  Button,
  Character,
  LoadError,
  Loading,
  ProgressBar,
} from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { getCharacterImage, hasCharacterImage } from '@/constants/characters'
import { isValidNickname, NICKNAME_MAX_LENGTH, NICKNAME_RULE_TEXT } from '@/constants/nickname'
import { SECTORS, type Sector } from '@/constants/sectors'
import { useApi } from '@/hooks/useApi'
import { resetEquippedCharacter, useEquippedCharacterCode } from '@/hooks/useEquippedCharacter'
import { ROUTES } from '@/router/routes'

/**
 * 내 정보 + 학습 현황 + 홈을 한 번에
 * - 보호권 수 · 도토리 잔액은 홈 응답(끊김 처리 후 값)에서 가져온다 (보호권 수만 따로 조회하는 API는 없음)
 */
const loadMyPage = async (signal: AbortSignal) => {
  const [me, stats, home] = await Promise.all([getMe(signal), getStats(signal), getHome(signal)])
  return { me, stats, home }
}

/**
 * 닉네임 수정 버튼을 보여 줄지
 * TODO: 닉네임 수정 API(PATCH /users/me/nickname)가 실서버에 나오면 true로 (시트 · API 연결은 이미 되어 있음)
 */
const NICKNAME_EDIT_ENABLED = false

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
  const page = useApi(loadMyPage, 'my-page')
  const equippedCode = useEquippedCharacterCode()
  /** 이 화면에서 닉네임을 고친 경우에만 값이 있다 (없으면 서버 값) */
  const [editedNickname, setEditedNickname] = useState<string | null>(null)
  /** 보호권을 산 뒤의 값 (사기 전엔 null → 서버 값 · 목업) */
  const [bought, setBought] = useState<{ shieldCount: number; acornBalance: number } | null>(null)
  const [sheet, setSheet] = useState<Sheet>(null)
  const closeSheet = () => setSheet(null)

  if (page.status === 'loading')
    return (
      <>
        <Header />
        <Loading label="마이페이지를 불러오고 있어요" />
      </>
    )
  if (page.status === 'error')
    return (
      <>
        <Header />
        <LoadError message={page.error.message} onRetry={page.reload} />
      </>
    )

  const { me, stats, home } = page.data
  const nickname = editedNickname ?? me.nickname ?? ''
  // 프로필 그림: FE 옷 그림 → 서버 장착 캐릭터 그림 → 기본 다람쥐
  const profileImage = hasCharacterImage(equippedCode)
    ? getCharacterImage(equippedCode, 'wave')
    : (me.characterImageUrl ?? getCharacterImage(null, 'wave'))
  // 처음엔 홈 응답 값, 보호권을 산 뒤에는 구매 응답 값 (홈을 다시 부르지 않는다)
  const acornBalance = bought?.acornBalance ?? home.acornBalance
  const shieldCount = bought?.shieldCount ?? home.streak.shieldCount
  // 서버 섹터 이름 → 화면 섹터 키 (주식 · 생활 금융 · 금융 기초 순서로 보여 준다)
  const progress = new Map(
    stats.sectors.map((s) => [toSector(s.name), { cleared: s.passedStepNo, total: s.totalSteps }]),
  )

  const summary = [
    {
      label: '완수 단계',
      value: stats.completedStageCount,
      box: 'bg-avocado-400',
      num: 'text-coconut-100',
      sub: 'text-avocado-100',
    },
    {
      label: '도토리',
      value: acornBalance,
      emoji: '🌰',
      box: 'bg-apricot-200',
      num: 'text-apricot-800',
      sub: 'text-apricot-600',
    },
    {
      label: '연속',
      value: stats.streak,
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
      <Header />

      {/* 프로필 */}
      <section className="mt-[18px] flex h-24 items-center gap-4 rounded-card bg-apricot-600 px-4 shadow-[0_4px_12px_rgb(0_0_0/0.05)]">
        {/* 장착한 옷의 인사 자세 (FE 그림이 없으면 서버 그림 → 기본 다람쥐) */}
        <img
          src={profileImage}
          alt="장착한 캐릭터"
          className="size-16 shrink-0 rounded-full bg-coconut-100 object-contain p-1"
        />
        <div>
          <p className="text-[20px] leading-[1.4] font-bold text-coconut-100">{nickname}</p>
          {NICKNAME_EDIT_ENABLED && (
            <button
              type="button"
              onClick={() => setSheet('nickname')}
              className="text-[13px] leading-[1.4] text-herb"
            >
              닉네임 수정 ›
            </button>
          )}
        </div>
      </section>

      {/* 요약 3칸 */}
      <ul className="mt-gap grid grid-cols-3 gap-2">
        {summary.map(({ label, value, emoji, box, num, sub }) => (
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
            const sector = progress.get(key)
            if (!sector) return null
            const { cleared, total } = sector
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
            setEditedNickname(next)
            closeSheet()
          }}
        />
      )}
      {sheet === 'shield' && (
        <ShieldSheet
          shieldCount={shieldCount}
          acornBalance={acornBalance}
          onBought={setBought}
          onClose={closeSheet}
        />
      )}
      {sheet === 'account' && <AccountSheet onClose={closeSheet} />}
    </>
  )
}

/** 위쪽 제목 줄 (불러오는 중 · 오류 화면에도 보여 준다) */
function Header() {
  const navigate = useNavigate()
  return (
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
  )
}

/** 입력이 멈춘 뒤 중복 확인까지 기다리는 시간 (닉네임 설정 화면과 같음) */
const CHECK_DELAY = 300

type CheckStatus = 'available' | 'taken' | 'error'
/** 어떤 닉네임을 확인한 결과인지 같이 기억한다 (입력이 바뀌면 이전 결과는 안 쓴다) */
type Check = { nickname: string; status: CheckStatus; message?: string }

const CHECK_TEXT: Record<
  CheckStatus | 'checking' | 'invalid',
  { text: string; className: string }
> = {
  invalid: { text: NICKNAME_RULE_TEXT, className: 'text-burnt-orange-600' },
  checking: { text: '확인하고 있어요', className: 'text-herb-300' },
  available: { text: '✓ 사용 가능한 닉네임이에요', className: 'text-avocado-500' },
  taken: { text: '이미 사용 중인 닉네임이에요', className: 'text-burnt-orange-600' },
  error: { text: '잠시 후 다시 시도해 주세요', className: 'text-burnt-orange-600' },
}

/** 실패한 요청을 화면에 보여 줄 결과로 (E409는 '이미 사용 중', 그 밖은 서버 메시지) */
function toCheck(nickname: string, e: unknown): Check {
  if (e instanceof ApiError && e.code === 'E409') return { nickname, status: 'taken' }
  return { nickname, status: 'error', message: e instanceof ApiError ? e.message : undefined }
}

/**
 * 닉네임 수정: 닉네임 설정 화면과 같은 규칙 (최대 10자, 빈칸 불가)
 * - 형식(한글 · 영문 · 숫자 2~10자)부터 검사하고, 맞을 때만 입력이 멈추고 0.3초 뒤 중복 확인(GET /users/check-nickname)
 * - 지금 닉네임과 같으면 확인하지 않는다
 * - 사용 가능할 때만 저장 → 닉네임 수정(PATCH /users/me/nickname) 성공하면 시트를 닫고 새 닉네임 표시
 * - 확인 뒤 그 사이 다른 사람이 먼저 쓰면(E409) '이미 사용 중'으로 바꿔 보여 준다
 */
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
  const [check, setCheck] = useState<Check | null>(null)
  const [sending, setSending] = useState(false)
  const changed = trimmed.length > 0 && trimmed !== current
  const valid = isValidNickname(trimmed)

  useEffect(() => {
    if (!changed || !valid) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      checkNickname(trimmed, controller.signal)
        .then(({ available }) =>
          setCheck({ nickname: trimmed, status: available ? 'available' : 'taken' }),
        )
        .catch((e: unknown) => {
          if (!controller.signal.aborted) setCheck(toCheck(trimmed, e))
        })
    }, CHECK_DELAY)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed, changed, valid])

  // 빈칸이거나 지금 닉네임 그대로면 안내 없음 → 형식이 틀리면 규칙 안내 → 결과가 아직 없으면 '확인 중'
  const status = !changed
    ? null
    : !valid
      ? 'invalid'
      : check?.nickname === trimmed
        ? check.status
        : 'checking'
  const canSave = status === 'available' && !sending

  const handleSave = () => {
    if (!canSave) return
    setSending(true)
    updateNickname(trimmed)
      .then(({ nickname }) => onSave(nickname))
      .catch((e: unknown) => {
        setCheck(toCheck(trimmed, e))
        setSending(false)
      })
  }

  return (
    <BottomSheet open onClose={onClose} labelledBy="nickname-sheet-title">
      <h2 id="nickname-sheet-title" className="text-title text-herb">
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
      {status && (
        <p
          role={status === 'checking' ? 'status' : 'alert'}
          className={clsx('text-sub', CHECK_TEXT[status].className)}
        >
          {status === 'error' && check?.message ? check.message : CHECK_TEXT[status].text}
        </p>
      )}
      <Button className="mt-2 w-full" disabled={!canSave} onClick={handleSave}>
        {sending ? '저장하고 있어요' : '저장'}
      </Button>
    </BottomSheet>
  )
}

/**
 * 스트릭 보호권: 도토리로 1개씩 산다 (최대 2개)
 * 서버가 홈 조회 때 끊김을 판정하면서, 빠진 날 수만큼 보호권이 있으면 자동으로 쓴다 (1개당 하루).
 * 보호권이 빠진 날보다 적으면 쓰지 않고 남겨 두고, 연속 학습은 끊긴다.
 * - 사기(POST /streak/shields): 성공하면 시트를 닫지 않고 늘어난 보호권 · 줄어든 도토리를 바로 보여 준다
 * - 실패하면(최대 개수 · 도토리 부족 등) 버튼 위에 서버 메시지
 */
function ShieldSheet({
  shieldCount,
  acornBalance,
  onBought,
  onClose,
}: {
  shieldCount: number
  acornBalance: number
  onBought: (result: { shieldCount: number; acornBalance: number }) => void
  onClose: () => void
}) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const acornTotal = acornBalance
  const isFull = shieldCount >= SHIELD_MAX
  const hasAcorns = acornTotal >= SHIELD_PRICE

  const handleBuy = () => {
    if (sending) return
    setSending(true)
    setError(null)
    buyShield()
      .then(onBought)
      .catch((e: unknown) =>
        setError(e instanceof ApiError ? e.message : '잠시 후 다시 시도해 주세요'),
      )
      .finally(() => setSending(false))
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
      {error && (
        <p role="alert" className="text-center text-sub text-burnt-orange-600">
          {error}
        </p>
      )}
      <Button
        className="mt-2 w-full"
        disabled={isFull || !hasAcorns || sending}
        onClick={handleBuy}
      >
        {sending
          ? '사는 중이에요'
          : isFull
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

  const [leaving, setLeaving] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

  /** 저장된 토큰을 지우고 로그인 화면으로 (뒤로 가기로 돌아오지 못하게 replace) */
  const leave = () => {
    try {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } catch {
      // 저장소를 못 쓰는 환경이면 지울 것도 없다
    }
    // 다른 계정으로 로그인할 수 있으니 장착 캐릭터도 비운다
    resetEquippedCharacter()
    navigate(ROUTES.login, { replace: true })
  }

  /**
   * 로그아웃(POST /auth/logout) 후 기기의 토큰을 지우고 로그인 화면으로.
   * 서버 요청이 실패해도(네트워크 등) 사용자는 로그아웃되어야 하니 결과와 상관없이 나간다
   */
  const handleLogout = () => {
    if (leaving) return
    setLeaving(true)
    logout()
      .catch(() => {})
      .finally(leave)
  }

  /**
   * 회원탈퇴(DELETE /users/me): 로그아웃과 달리 성공했을 때만 나간다.
   * 실패했는데 나가 버리면 탈퇴된 줄 알게 되니, 서버 메시지를 보여 주고 다시 누를 수 있게 한다
   */
  const handleWithdraw = () => {
    if (leaving) return
    setLeaving(true)
    setWithdrawError(null)
    withdraw()
      .then(leave)
      .catch((e: unknown) => {
        setWithdrawError(e instanceof ApiError ? e.message : '잠시 후 다시 시도해 주세요')
        setLeaving(false)
      })
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
            <Button className="flex-1" disabled={leaving} onClick={handleLogout}>
              {leaving ? '로그아웃 중' : '로그아웃'}
            </Button>
          </div>
        </>
      )}

      {step === 'withdraw' && (
        <>
          {/* 떠나려는 순간이라 우는 다람쥐 */}
          <div className="flex justify-center">
            <Character width={88} pose="sad" />
          </div>
          <h2 id="account-sheet-title" className="text-title text-herb">
            정말 탈퇴할까요?
          </h2>
          <p className="text-body text-herb-400">탈퇴하면 되돌릴 수 없어요.</p>
          {withdrawError && (
            <p role="alert" className="text-center text-sub text-burnt-orange-600">
              {withdrawError}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              취소
            </Button>
            <Button
              className="flex-1 enabled:bg-burnt-orange-500 enabled:shadow-[0_4px_0_var(--color-burnt-orange-700)]"
              disabled={leaving}
              onClick={handleWithdraw}
            >
              {leaving ? '탈퇴하는 중' : '탈퇴하기'}
            </Button>
          </div>
        </>
      )}
    </BottomSheet>
  )
}
