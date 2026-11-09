/** /learn/:sector/:stage/... 경로의 섹터·단계를 읽는다. 잘못된 값이면 오늘의 섹터로 대신한다. */
import { useParams } from 'react-router'

import { SECTORS, type Sector } from '@/constants/sectors'
import { STAGE_COUNT, TODAY } from '@/mocks/learn'

export function useStageParams(): { sector: Sector; stage: number } {
  const params = useParams()
  const sector = (
    params.sector && params.sector in SECTORS ? params.sector : TODAY.sector
  ) as Sector
  const n = Number(params.stage)
  const stage = Number.isInteger(n) && n >= 1 && n <= STAGE_COUNT ? n : TODAY.stage
  return { sector, stage }
}
