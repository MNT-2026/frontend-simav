import { useState } from 'react'
import { GeoDensity, GroupedBars, Legend, RankBars, SeverityBar, TrendChart } from '../components/charts'
import { Button, Card, CardHead } from '../components/ui'
import { useFakeExport } from '../components/Toasts'
import { criticalTrend, hotspots, severityBreakdown, typeByMonth, weeklyTrend } from '../data/mock'

const GRAIN = ['Día', 'Semana', 'Mes']

export default function Statistics() {
  const exportFile = useFakeExport()
  const [grain, setGrain] = useState('Semana')

  return (
    <main className="content">
      <div className="row-between">
        <div className="chips" role="tablist" aria-label="Granularidad">
          {GRAIN.map((g) => (
            <button key={g} role="tab" aria-selected={g === grain} className={g === grain ? 'on' : ''} onClick={() => setGrain(g)}>
              {g}
            </button>
          ))}
        </div>
        <span className="filter">
          Ruta: <b>Todas</b>
        </span>
        <span className="filter">01 mar – 02 sep 2026</span>
        <span className="spacer" />
        <Button>Ver como tabla</Button>
        <Button variant="primary" icon="download" onClick={() => exportFile('la exportación en Excel', 'Series de estadísticas')}>
          Exportar Excel
        </Button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 300 }}>
        <Card style={{ flex: 1.85, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <CardHead title="Evolución de incidentes" question="¿Estamos detectando más deterioro que hace un mes?">
            <span className="spacer" />
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>
                147
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--high-ink)' }}>
                ↑ 12.4% vs. periodo anterior
              </div>
            </div>
          </CardHead>
          <div style={{ flex: 1, minHeight: 0, padding: '4px 8px 8px' }}>
            <TrendChart data={weeklyTrend} highlight={weeklyTrend.length - 2} />
          </div>
        </Card>

        <Card style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <CardHead title="Severidad detectada" question="¿Qué proporción exige intervención urgente?" />
          <div style={{ padding: '4px 15px 0' }}>
            <SeverityBar items={severityBreakdown} />
          </div>
          <div style={{ flex: 1, padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {severityBreakdown.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: s.color, display: 'block' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>{s.label}</div>
                  <div className="sub-text" style={{ fontSize: 11 }}>
                    {s.sla}
                  </div>
                </div>
                <div className="mono" style={{ fontWeight: 800, fontSize: 16 }}>
                  {s.count}
                </div>
                <div className="mono sub-text" style={{ width: 40, textAlign: 'right' }}>
                  {s.pct}%
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 13, marginTop: 2 }}>
              <div className="card-q" style={{ margin: '0 0 9px' }}>
                Severidad alta por semana
              </div>
              <svg viewBox="0 0 320 76" style={{ width: '100%', height: 76 }} aria-hidden="true">
                <path d="M0 70h320" stroke="var(--line)" />
                <g fill="var(--high)">
                  {criticalTrend.map((v, i) => {
                    const h = (v / Math.max(...criticalTrend)) * 60
                    return <rect key={i} x={i * 36 + 4} y={70 - h} width="26" height={h} rx="4" />
                  })}
                </g>
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 280 }}>
        <Card style={{ flex: 1.15, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <CardHead title="Baches y grietas" question="¿Qué tipo de daño está creciendo más rápido?">
            <span className="spacer" />
            <Legend
              items={[
                { label: 'Baches', color: 'var(--s1)' },
                { label: 'Grietas', color: 'var(--s2)' },
              ]}
            />
          </CardHead>
          <div style={{ flex: 1, minHeight: 0, padding: '4px 8px 8px' }}>
            <GroupedBars data={typeByMonth} />
          </div>
        </Card>

        <Card style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <CardHead title="Zonas con mayor concentración" question="¿Dónde debe intervenir primero la cuadrilla?" />
          <div style={{ flex: 1, minHeight: 0, padding: '6px 15px 12px' }}>
            <RankBars data={hotspots} />
          </div>
        </Card>

        <Card style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CardHead title="Distribución geográfica" question="¿El deterioro está agrupado o disperso?" />
          <div style={{ flex: 1, minHeight: 0, position: 'relative', borderTop: '1px solid var(--line)' }}>
            <GeoDensity />
            <div
              style={{
                position: 'absolute',
                left: 12,
                bottom: 12,
                background: 'var(--surf)',
                border: '1px solid var(--line)',
                borderRadius: 9,
                padding: '8px 10px',
                fontSize: 10.5,
                fontWeight: 700,
                color: 'var(--mut)',
                lineHeight: 1.7,
              }}
            >
              El 44% de los incidentes se concentra
              <br />
              en el 12% de los kilómetros analizados.
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
