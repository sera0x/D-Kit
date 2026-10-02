import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const WEEKS = 26, DAYS = 7;

const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fmtDay = (d) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

export default function ActivityHeatmap() {
  const { token } = useAuth();
  const [raw, setRaw] = useState(null);
  const [err, setErr] = useState(false);
  const [cur, setCur] = useState({ w: WEEKS - 1, d: new Date().getDay() });
  const [hover, setHover] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.getActivityDaily(token).then((d) => { if (!cancelled) setRaw(d); }).catch(() => { if (!cancelled) setErr(true); });
    return () => { cancelled = true; };
  }, [token]);

  const { cells } = useMemo(() => {
    const counts = {};
    let mx = 1;
    if (raw) raw.forEach((r) => {
      counts[r.day] = r.n; if (r.n > mx) mx = r.n;
    });
    const out = [];
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - (WEEKS * 7 - 1));
    start.setDate(start.getDate() - start.getDay());
    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < DAYS; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        if (date > today) continue;
        const key = dayKey(date);
        const count = counts[key] || 0;
        const f = count / mx;
        const level = count === 0 ? 0 : f < 0.25 ? 1 : f < 0.5 ? 2 : f < 0.75 ? 3 : 4;
        out.push({ w, d, date, level, count });
      }
    }
    return { cells: out };
  }, [raw]);

  const move = useCallback((dw, dd) => {
    setCur((c) => ({
      w: Math.max(0, Math.min(WEEKS - 1, c.w + dw)),
      d: Math.max(0, Math.min(DAYS - 1, c.d + dd)),
    }));
    setHover(null);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') move(-1, 0);
      else if (e.key === 'ArrowRight') move(1, 0);
      else if (e.key === 'ArrowUp') move(0, -1);
      else if (e.key === 'ArrowDown') move(0, 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  const total = cells.reduce((a, c) => a + c.count, 0);
  const monthLabels = useMemo(() => {
    const out = []; let last = '';
    cells.forEach((c) => {
      const m = c.date.toLocaleDateString(undefined, { month: 'short' });
      if (m !== last && c.d === 0) { out.push({ w: c.w, m }); last = m; }
    });
    return out;
  }, [cells]);

  const tipCell = hover ?? cells.find((c) => c.w === cur.w && c.d === cur.d);

  if (err) return null;

  if (!raw) {
    return (
      <div className="dash-card heatmap-card">
        <div className="hm-head"><h2>Secret writes</h2></div>
        <p className="hm-total">Loading…</p>
      </div>
    );
  }

  return (
    <div className="dash-card heatmap-card">
      <div className="hm-head">
        <h2>Secret writes</h2>
        <span className="hm-total">{total.toLocaleString()} sets · last {WEEKS} weeks</span>
      </div>

      <div className="hm-grid-wrap">
        <div className="hm-days" aria-hidden="true">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => <span key={d}>{i % 2 === 1 ? d : ''}</span>)}
        </div>
        <div className="hm-cols">
          <div className="hm-months">
            {Array.from({ length: WEEKS }).map((_, w) => (
              <span key={w}>{monthLabels.find((m) => m.w === w)?.m ?? ''}</span>
            ))}
          </div>
          <div className="hm-grid" role="grid" aria-label="Activity heatmap" onMouseLeave={() => setHover(null)}>
            {cells.map((c) => (
              <button key={`${c.w}-${c.d}`} role="gridcell"
                aria-label={`${fmtDay(c.date)}: ${c.count} sets`}
                className={'hm-cell l' + c.level + (c.w === cur.w && c.d === cur.d ? ' cursor' : '')}
                onMouseEnter={() => setHover(c)}
                onFocus={() => { setCur({ w: c.w, d: c.d }); setHover(c); }}
                onClick={() => setCur({ w: c.w, d: c.d })} />
            ))}
          </div>
        </div>
      </div>

      <div className="hm-foot">
        <span className="hm-legend-label">less</span>
        {[0, 1, 2, 3, 4].map((l) => <span key={l} className={'hm-cell l' + l} aria-hidden="true" />)}
        <span className="hm-legend-label">more</span>
        <span className="hm-hint">arrow keys to move · click a day</span>
      </div>

      {tipCell && (
        <div className="hm-tip">
          <strong>{tipCell.count}</strong> {tipCell.count === 1 ? 'set' : 'sets'} · {fmtDay(tipCell.date)}
        </div>
      )}
    </div>
  );
}
