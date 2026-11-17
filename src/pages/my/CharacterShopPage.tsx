/**
 * 캐릭터 상점: 보유 도토리 + 캐릭터 카드 2열 + 하단 구매(장착) 버튼
 * - 카드 상태: 장착중(주황 · 입체) / 고른 카드(초록 · 눌린 듯 평평) / 기본(회색 · 입체)
 * - 카드를 누르면 고른 카드가 되고, 하단 버튼이 그 캐릭터의 구매(보유 중이면 장착) 버튼이 된다
 * - 구매 버튼을 누르면 팝업: 도토리가 모자라면 안내, 충분하면 구매 확인
 * Figma 975 → 390 (÷2.5)
 */
import clsx from 'clsx'
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { ROUTES } from '@/router/routes'

type Character = {
  id: string
  name: string
  price: number
  owned: boolean
  /** 아직 공개 안 된 캐릭터: 이름 대신 ??? 를 보여준다 */
  secret?: boolean
}

// TODO: 상점 · 사용자 API 연결 후 교체
const MOCK = {
  acornTotal: 30,
  equippedId: 'basic',
  characters: [
    { id: 'basic', name: '기본 다람쥐', price: 0, owned: true },
    { id: 'rich', name: '부자 다람쥐', price: 50, owned: false },
    { id: 'headphone', name: '헤드폰 다람쥐', price: 40, owned: false },
    { id: 'secret', name: '???', price: 80, owned: false, secret: true },
  ] as Character[],
}

type CardState = 'equipped' | 'selected' | 'normal'

/** 카드 상태별 색: 바깥 · 그림자 / 그림 칸 / 이름 / 가격 알약 */
const CARD_STYLE: Record<CardState, { box: string; image: string; name: string; pill: string }> = {
  equipped: {
    box: 'bg-apricot-500 shadow-[0_6px_0_var(--color-apricot-700)]',
    image: 'bg-[#dce5e2]',
    name: 'text-herb',
    pill: 'bg-coconut-200 text-herb',
  },
  // 고른 카드는 그림자 없이 평평하게 (눌린 느낌)
  selected: {
    box: 'bg-avocado-400',
    image: 'bg-avocado-100',
    name: 'text-coconut-500',
    pill: 'bg-[#f0e4d6] text-apricot-700',
  },
  normal: {
    box: 'bg-coconut-600 shadow-[0_6px_0_var(--color-coconut-800)]',
    image: 'bg-[#dce5e2]',
    name: 'text-herb',
    pill: 'bg-avocado-100 text-avocado-400',
  },
}

export default function CharacterShopPage() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [popupOpen, setPopupOpen] = useState(false)
  const selected = MOCK.characters.find(({ id }) => id === selectedId)
  const closePopup = () => setPopupOpen(false)

  // 보유 중이면 바로 장착, 아니면 팝업으로 확인
  const handleConfirm = () => {
    if (!selected) return
    if (selected.owned) {
      // TODO: 장착 API 연결
      return
    }
    setPopupOpen(true)
  }

  // TODO: 구매 API 연결 후, 성공하면 도토리 · 보유 목록 갱신
  const handleBuy = () => {
    closePopup()
  }

  return (
    <>
      <header className="flex items-center">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(ROUTES.my)}
          className="flex h-10 w-8 items-center text-herb"
        >
          <BackIcon className="w-[19px]" />
        </button>
        <h1 className="text-[18px] font-bold text-herb">캐릭터 상점</h1>
      </header>

      {/* 보유 도토리 */}
      <p className="mt-[18px] flex h-7 items-center gap-1 self-start rounded-full bg-apricot-200 px-3 text-[13px] font-bold text-apricot-700">
        보유
        <span aria-hidden className="text-[13px]">
          🌰
        </span>
        {MOCK.acornTotal}
      </p>

      {/* 캐릭터 카드 */}
      <ul className="mt-gap grid grid-cols-2 gap-x-3 gap-y-6">
        {MOCK.characters.map((character) => {
          const { id, name, price, owned, secret } = character
          const equipped = id === MOCK.equippedId
          const state: CardState = equipped ? 'equipped' : id === selectedId ? 'selected' : 'normal'
          const style = CARD_STYLE[state]
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={state === 'selected'}
                // 장착중인 캐릭터는 고를 필요가 없어서 누를 수 없게
                disabled={equipped}
                onClick={() => setSelectedId(id)}
                className={clsx(
                  'flex h-[186px] w-full flex-col items-center rounded-card p-3',
                  style.box,
                )}
              >
                {/* TODO: 캐릭터 이미지가 정해지면 교체 (지금은 디자인의 자리 표시) */}
                <span
                  className={clsx(
                    'flex h-[100px] w-full items-center justify-center rounded-2xl',
                    secret ? 'bg-[#efeae2]' : style.image,
                  )}
                >
                  <span className="flex size-[84px] items-center justify-center rounded-full border border-dashed border-[#8aa39e] bg-[#dce5e2] text-center text-[10px] leading-[1.15] text-[#5f7a75]">
                    다람쥐
                    <br />
                    캐릭터
                  </span>
                </span>

                <span className={clsx('mt-[7px] text-card-title', style.name)}>{name}</span>

                <span
                  className={clsx(
                    'mt-[6px] flex h-7 items-center gap-1 rounded-full px-3 text-[13px] font-bold',
                    // 비밀 캐릭터 가격은 주황 알약 (고른 상태가 아닐 때)
                    secret && state === 'normal'
                      ? 'bg-burnt-orange-100 text-apricot-700'
                      : style.pill,
                  )}
                >
                  {equipped ? (
                    '장착중'
                  ) : owned ? (
                    '보유'
                  ) : (
                    <>
                      <span aria-hidden>🌰</span>
                      {price}
                    </>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* 하단 버튼: 카드를 골랐을 때만 */}
      {selected && (
        <div className="sticky bottom-[calc(var(--spacing-gutter)+env(safe-area-inset-bottom))] mt-auto flex justify-center pt-6">
          <Button onClick={handleConfirm}>
            {selected.owned ? (
              `${selected.name} 장착하기`
            ) : (
              <>
                {selected.name} 구매하기 · <span aria-hidden>🌰</span> {selected.price}
              </>
            )}
          </Button>
        </div>
      )}

      {selected && (
        <PurchasePopup
          open={popupOpen}
          character={selected}
          acornTotal={MOCK.acornTotal}
          onClose={closePopup}
          onBuy={handleBuy}
        />
      )}
    </>
  )
}

/** 구매 팝업: 도토리가 모자라면 안내(확인), 충분하면 구매 확인(취소 · 구매하기) */
function PurchasePopup({
  open,
  character,
  acornTotal,
  onClose,
  onBuy,
}: {
  open: boolean
  character: Character
  acornTotal: number
  onClose: () => void
  onBuy: () => void
}) {
  const { name, price } = character
  const lack = price - acornTotal

  return (
    <Popup open={open} onClose={onClose} labelledBy="purchase-popup-title">
      {lack > 0 ? (
        <>
          <h2 id="purchase-popup-title" className="text-title text-herb">
            도토리가 부족해요
          </h2>
          <p className="mt-2 text-body text-herb-400">
            {name}는 🌰 {price}개가 필요해요.
            <br />
            🌰 {lack}개만 더 모아봐요!
          </p>
          <div className="mt-6 flex">
            <Button className="flex-1" onClick={onClose}>
              확인
            </Button>
          </div>
        </>
      ) : (
        <>
          <h2 id="purchase-popup-title" className="text-title text-herb">
            {name}를 살까요?
          </h2>
          <p className="mt-2 text-body text-herb-400">
            🌰 {price}개를 쓰면 🌰 {acornTotal - price}개가 남아요.
          </p>
          <div className="mt-6 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              취소
            </Button>
            <Button className="flex-1" onClick={onBuy}>
              구매하기
            </Button>
          </div>
        </>
      )}
    </Popup>
  )
}

/**
 * 가운데 팝업: 화면을 herb-900 45%로 어둡게 하고 가운데에 카드를 띄운다 (BottomSheet와 같은 규칙)
 * - 바깥(딤)을 누르거나 Esc를 누르면 onClose
 */
function Popup({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean
  onClose: () => void
  labelledBy?: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex max-w-app items-center justify-center px-gutter">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-herb-900/45"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative w-full rounded-card bg-coconut-100 px-gutter pt-7 pb-gutter text-center"
      >
        {children}
      </section>
    </div>
  )
}
