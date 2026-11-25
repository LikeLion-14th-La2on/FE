/**
 * 문제 신고: 해설 아래 작은 '문제 신고' 버튼 → 바텀시트에 내용을 적어 보낸다 (POST /questions/{id}/reports)
 * - 학습 해설 · 카드뉴스 복습 · 오답노트 · 레벨 테스트 결과에서 같이 쓴다
 * - 시트는 열 때마다 새로 그려서 입력 · 결과가 처음 상태로 돌아간다
 */
import { useState } from 'react'

import { ApiError } from '@/api/client'
import { REPORT_MAX_LENGTH, reportQuestion } from '@/api/learn'
import { BottomSheet, Button } from '@/components/common'

export default function ReportQuestion({ questionId }: { questionId: number }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-end text-[12px] leading-[1.4] font-medium text-avocado-400 underline underline-offset-2"
      >
        문제 신고
      </button>
      {open && <ReportSheet questionId={questionId} onClose={() => setOpen(false)} />}
    </>
  )
}

function ReportSheet({ questionId, onClose }: { questionId: number; onClose: () => void }) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const trimmed = content.trim()

  const send = () => {
    if (!trimmed || sending) return
    setSending(true)
    setError(null)
    reportQuestion(questionId, trimmed).then(
      () => setDone(true),
      (e: unknown) => {
        setError(e instanceof ApiError ? e.message : '잠시 후 다시 시도해 주세요')
        setSending(false)
      },
    )
  }

  return (
    <BottomSheet open onClose={onClose} labelledBy="report-sheet-title">
      {done ? (
        <>
          <h2 id="report-sheet-title" className="text-[20px] leading-[1.4] font-black text-herb">
            신고해 주셔서 고마워요
          </h2>
          <p className="text-[14px] leading-[1.5] text-herb">확인한 뒤 문제를 고칠게요.</p>
          <Button onClick={onClose}>확인</Button>
        </>
      ) : (
        <>
          <h2 id="report-sheet-title" className="text-[20px] leading-[1.4] font-black text-herb">
            문제 신고
          </h2>
          <p className="text-[14px] leading-[1.5] text-herb">
            오타나 잘못된 내용이 있으면 알려 주세요.
          </p>
          <label className="flex flex-col gap-1 rounded-[16px] border-2 border-herb-500 bg-coconut-100 px-4 py-3">
            <span className="sr-only">신고 내용</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={REPORT_MAX_LENGTH}
              rows={4}
              placeholder="예) 2번 보기에 오타가 있어요"
              className="resize-none bg-transparent text-[15px] leading-[1.5] text-herb outline-none placeholder:text-herb-300"
            />
            <span className="self-end text-[12px] text-apricot-500">
              {content.length}/{REPORT_MAX_LENGTH}
            </span>
          </label>
          {error && (
            <p role="alert" className="text-center text-[13px] leading-[1.4] text-burnt-orange-600">
              {error}
            </p>
          )}
          <Button disabled={!trimmed || sending} onClick={send}>
            {sending ? '보내고 있어요' : '보내기'}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="h-btn text-[16px] leading-[1.4] font-bold text-avocado-400"
          >
            닫기
          </button>
        </>
      )}
    </BottomSheet>
  )
}
