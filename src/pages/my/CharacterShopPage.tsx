/**
 * 캐릭터 상점: 보유 도토리 + 캐릭터 카드 2열 + 하단 구매(장착) 버튼
 * - 카드 상태: 장착중(주황 · 입체) / 고른 카드(초록 · 눌린 듯 평평) / 기본(회색 · 입체)
 * - 카드를 누르면 고른 카드가 되고, 하단 버튼이 그 캐릭터의 구매(보유 중이면 장착) 버튼이 된다
 * - 구매 버튼을 누르면 팝업: 도토리가 모자라면 안내, 충분하면 구매 확인
 * - 캐릭터 목록(GET /characters)과 보유 도토리(GET /users/me)를 함께 불러온다
 * - 구매(POST /characters/{id}/purchase): 성공하면 보유로 바뀌고 도토리가 줄어든다 (다시 불러오지 않고 응답으로 갱신)
 * - 장착(PATCH /users/me/character): 성공하면 그 카드가 '장착중'이 되고 고른 카드는 풀린다
 * Figma 975 → 390 (÷2.5)
 */
import clsx from 'clsx'
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'

import { ApiError } from '@/api/client'
import {
  equipCharacter,
  getCharacters,
  purchaseCharacter,
  type CharacterItem,
} from '@/api/character'
import { getMe } from '@/api/user'
import { Button, LoadError, Loading } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { useApi } from '@/hooks/useApi'
import { ROUTES } from '@/router/routes'

/** 캐릭터 목록 + 보유 도토리를 한 번에 */
const loadShop = async (signal: AbortSignal) => {
  const [characters, me] = await Promise.all([getCharacters(signal), getMe(signal)])
  return { characters, acornTotal: me.acornBalance }
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
  const shop = useApi(loadShop, 'character-shop')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [popupOpen, setPopupOpen] = useState(false)
  const closePopup = () => setPopupOpen(false)
  /** 이 화면에서 산 캐릭터 · 산 뒤 남은 도토리 (서버 목록을 다시 받지 않고 덮어쓴다) */
  const [purchasedIds, setPurchasedIds] = useState<number[]>([])
  const [acornAfter, setAcornAfter] = useState<number | null>(null)
  const [buying, setBuying] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)
  /** 이 화면에서 장착한 캐릭터 (없으면 서버 목록의 equipped) */
  const [equippedId, setEquippedId] = useState<number | null>(null)
  const [equipping, setEquipping] = useState(false)
  const [equipError, setEquipError] = useState<string | null>(null)

  if (shop.status === 'loading')
    return (
      <>
        <Header />
        <Loading label="캐릭터를 불러오고 있어요" />
      </>
    )
  if (shop.status === 'error')
    return (
      <>
        <Header />
        <LoadError message={shop.error.message} onRetry={shop.reload} />
      </>
    )

  const characters = shop.data.characters.map((c) => ({
    ...c,
    owned: c.owned || purchasedIds.includes(c.characterId),
    equipped: equippedId === null ? c.equipped : c.characterId === equippedId,
  }))
  const acornTotal = acornAfter ?? shop.data.acornTotal
  const selected = characters.find(({ characterId }) => characterId === selectedId)

  // 보유 중이면 바로 장착, 아니면 팝업으로 확인
  const handleConfirm = () => {
    if (!selected) return
    if (selected.owned) {
      handleEquip(selected.characterId)
      return
    }
    setBuyError(null)
    setPopupOpen(true)
  }

  const handleEquip = (id: number) => {
    if (equipping) return
    setEquipping(true)
    setEquipError(null)
    equipCharacter(id)
      .then(({ equippedCharacterId }) => {
        setEquippedId(equippedCharacterId)
        // 장착중 카드는 고를 수 없어서, 고른 상태를 풀고 하단 버튼을 숨긴다
        setSelectedId(null)
      })
      .catch((e: unknown) =>
        setEquipError(e instanceof ApiError ? e.message : '잠시 후 다시 시도해 주세요'),
      )
      .finally(() => setEquipping(false))
  }

  /** 구매: 성공하면 팝업을 닫고 하단 버튼이 '장착하기'로 바뀐다. 이미 보유 중(E409)이어도 보유로 표시 */
  const handleBuy = () => {
    if (!selected || buying) return
    const id = selected.characterId
    setBuying(true)
    setBuyError(null)
    purchaseCharacter(id)
      .then(({ acornBalance }) => {
        setPurchasedIds((ids) => [...ids, id])
        setAcornAfter(acornBalance)
        closePopup()
      })
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.code === 'E409') {
          setPurchasedIds((ids) => [...ids, id])
          closePopup()
          return
        }
        setBuyError(e instanceof ApiError ? e.message : '잠시 후 다시 시도해 주세요')
      })
      .finally(() => setBuying(false))
  }

  return (
    <>
      <Header />

      {/* 보유 도토리 */}
      <p className="mt-[18px] flex h-7 items-center gap-1 self-start rounded-full bg-apricot-200 px-3 text-[13px] font-bold text-apricot-700">
        보유
        <span aria-hidden className="text-[13px]">
          🌰
        </span>
        {acornTotal}
      </p>

      {/* 캐릭터 카드 */}
      <ul className="mt-gap grid grid-cols-2 gap-x-3 gap-y-6">
        {characters.map((character) => {
          const { characterId: id, name, imageUrl, price, owned, equipped } = character
          const state: CardState = equipped ? 'equipped' : id === selectedId ? 'selected' : 'normal'
          const style = CARD_STYLE[state]
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={state === 'selected'}
                // 장착중인 캐릭터는 고를 필요가 없어서 누를 수 없게
                disabled={equipped}
                onClick={() => {
                  setSelectedId(id)
                  setEquipError(null)
                }}
                className={clsx(
                  'flex h-[186px] w-full flex-col items-center rounded-card p-3',
                  style.box,
                )}
              >
                <span
                  className={clsx(
                    'flex h-[100px] w-full items-center justify-center rounded-2xl',
                    style.image,
                  )}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="h-[88px] w-auto object-contain" />
                  ) : (
                    // 이미지가 없는 캐릭터는 디자인의 자리 표시
                    <span className="flex size-[84px] items-center justify-center rounded-full border border-dashed border-[#8aa39e] bg-[#dce5e2] text-center text-[10px] leading-[1.15] text-[#5f7a75]">
                      다람쥐
                      <br />
                      캐릭터
                    </span>
                  )}
                </span>

                <span className={clsx('mt-[7px] text-card-title', style.name)}>{name}</span>

                <span
                  className={clsx(
                    'mt-[6px] flex h-7 items-center gap-1 rounded-full px-3 text-[13px] font-bold',
                    style.pill,
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
        <div className="sticky bottom-[calc(var(--spacing-gutter)+env(safe-area-inset-bottom))] mt-auto flex flex-col items-center gap-2 pt-6">
          {equipError && (
            <p role="alert" className="text-sub text-burnt-orange-600">
              {equipError}
            </p>
          )}
          <Button disabled={equipping} onClick={handleConfirm}>
            {selected.owned ? (
              equipping ? (
                '장착하는 중'
              ) : (
                `${selected.name} 장착하기`
              )
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
          acornTotal={acornTotal}
          buying={buying}
          error={buyError}
          onClose={closePopup}
          onBuy={handleBuy}
        />
      )}
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
        onClick={() => navigate(ROUTES.my)}
        className="flex h-10 w-8 items-center text-herb"
      >
        <BackIcon className="w-[19px]" />
      </button>
      <h1 className="text-[18px] font-bold text-herb">캐릭터 상점</h1>
    </header>
  )
}

/** 구매 팝업: 도토리가 모자라면 안내(확인), 충분하면 구매 확인(취소 · 구매하기) */
function PurchasePopup({
  open,
  character,
  acornTotal,
  buying,
  error,
  onClose,
  onBuy,
}: {
  open: boolean
  character: CharacterItem
  acornTotal: number
  buying: boolean
  error: string | null
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
          {error && (
            <p role="alert" className="mt-3 text-sub text-burnt-orange-600">
              {error}
            </p>
          )}
          <div className="mt-6 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              취소
            </Button>
            <Button className="flex-1" disabled={buying} onClick={onBuy}>
              {buying ? '사는 중이에요' : '구매하기'}
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
