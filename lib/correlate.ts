import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export type EntityType = 'iban' | 'telefon' | 'website' | 'facebook' | 'email'

export interface RelatedEntity {
  entityType: EntityType
  entityValue: string
  reportCount: number
}

export interface CorrelationResult {
  totalReports: number
  relatedEntities: RelatedEntity[]
  summary: string
}

const TYPE_LABELS: Record<EntityType, string> = {
  iban: 'IBAN-uri',
  telefon: 'numere de telefon',
  website: 'website-uri',
  facebook: 'pagini Facebook',
  email: 'adrese email',
}

export async function getCorrelations(
  entityType: EntityType,
  entityValue: string
): Promise<CorrelationResult> {
  const { data: matches, error } = await supabase
    .from('report_entities')
    .select('report_id')
    .eq('entity_type', entityType)
    .eq('entity_value', entityValue)

  if (error || !matches?.length) {
    return { totalReports: 0, relatedEntities: [], summary: 'Nicio raportare găsită.' }
  }

  const reportIds = [...new Set(matches.map((e: { report_id: string }) => e.report_id))]

  const { data: related, error: relErr } = await supabase
    .from('report_entities')
    .select('entity_type, entity_value, report_id')
    .in('report_id', reportIds)
    .neq('entity_value', entityValue)

  if (relErr || !related) {
    return {
      totalReports: reportIds.length,
      relatedEntities: [],
      summary: `Apare în ${reportIds.length} raportări.`,
    }
  }

  // Agregare: câte raportări unice conțin fiecare entitate corelată
  const entityMap = new Map<string, { entityType: EntityType; entityValue: string; reportIds: Set<string> }>()

  for (const e of related as { entity_type: string; entity_value: string; report_id: string }[]) {
    const key = `${e.entity_type}:${e.entity_value}`
    if (!entityMap.has(key)) {
      entityMap.set(key, {
        entityType: e.entity_type as EntityType,
        entityValue: e.entity_value,
        reportIds: new Set(),
      })
    }
    entityMap.get(key)!.reportIds.add(e.report_id)
  }

  const relatedEntities: RelatedEntity[] = Array.from(entityMap.values())
    .map(({ entityType, entityValue, reportIds }) => ({
      entityType,
      entityValue,
      reportCount: reportIds.size,
    }))
    .sort((a, b) => b.reportCount - a.reportCount)

  // Rezumat: câte entități distincte per tip
  const countByType: Partial<Record<EntityType, number>> = {}
  for (const e of relatedEntities) {
    countByType[e.entityType] = (countByType[e.entityType] ?? 0) + 1
  }

  const parts = (Object.entries(countByType) as [EntityType, number][])
    .map(([type, count]) => `${count} ${TYPE_LABELS[type]}`)

  const summary = `Apare în ${reportIds.length} raportări${parts.length ? ', asociat cu ' + parts.join(' și ') : ''}.`

  return { totalReports: reportIds.length, relatedEntities, summary }
}
