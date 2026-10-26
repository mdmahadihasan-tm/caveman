import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from 'remotion';
import { C, F, W, H, easeOutCubic, easeInOutCubic } from '../theme';
import { SplitPanel, PANEL_TOP } from './Motion';
import {
  IconCheck, IconNeedle, IconHand, IconMachine, IconPressure,
  IconBulb, IconCoffee, IconFlower, IconArrowUp,
} from './Icons';

type SP = { start: number; end: number };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
const pop = (t: number, trig: number, d = 0.16) => easeOutCubic(clamp01((t - trig) / d));

// gate + enter/exit opacity wrapper
const Gate: React.FC<SP & { children: React.ReactNode }> = ({ start, end, children }) => {
  const t = useT();
  if (t < start - 0.3 || t > end + 0.3) return null;
  const op = Math.min(easeOutCubic(clamp01((t - start) / 0.25)), clamp01((end + 0.1 - t) / 0.25));
  return <div style={{ position: 'absolute', inset: 0, opacity: op }}>{children}</div>;
};

const Title: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({
  children, color = C.ink, size = 56,
}) => (
  <div style={{ fontFamily: F.slide, fontWeight: 700, fontSize: size, color, letterSpacing: 0.3, lineHeight: 1.05 }}>
    {children}
  </div>
);

/* ---------- Slide a + b : NUMBING CHANGES THE SKIN + skin diagram ---------- */
export const SkinSlide: React.FC<SP> = ({ start, end }) => {
  const t = useT();
  const items = [
    { label: 'Texture', trig: 8.96 },
    { label: 'Skin response', trig: 13.2 },
    { label: 'Color', trig: 14.26 },
  ];
  const diag = pop(t, 10.4, 0.5);
  return (
    <Gate start={start} end={end}>
      <SplitPanel enter={easeOutCubic(clamp01((t - start) / 0.35))}>
        <div style={{ padding: '56px 64px', width: 912, boxSizing: 'border-box' }}>
          <div style={{ display: 'inline-block', background: C.accent, color: '#fff', fontFamily: F.slide, fontWeight: 700, fontSize: 30, padding: '8px 20px', borderRadius: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
            Numbing changes
          </div>
          <Title size={72}>THE SKIN</Title>
          <div style={{ marginTop: 34, display: 'flex', gap: 48 }}>
            <div style={{ flex: 1 }}>
              {items.map((it, i) => {
                const p = pop(t, it.trig);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: C.good, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * p})` }}>
                      <IconCheck size={34} color="#fff" sw={5} />
                    </div>
                    <div style={{ fontFamily: F.slide, fontWeight: 600, fontSize: 46, color: C.ink }}>{it.label}</div>
                  </div>
                );
              })}
            </div>
            {/* skin diagram: numbed vs natural */}
            <div style={{ width: 300, opacity: diag, transform: `scale(${0.85 + 0.15 * diag})` }}>
              {[
                { t: 'Numbed', c: '#C9B6A6', bumpy: true },
                { t: 'Natural', c: C.blush, bumpy: false },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: F.slide, fontWeight: 600, fontSize: 26, color: C.inkSoft, marginBottom: 6 }}>{s.t}</div>
                  <svg width="300" height="96" viewBox="0 0 300 96">
                    <defs>
                      <clipPath id={`clp${i}`}><rect x="0" y="0" width="300" height="96" rx="16" /></clipPath>
                    </defs>
                    <g clipPath={`url(#clp${i})`}>
                      <rect x="0" y="0" width="300" height="96" fill={s.c} />
                      <path
                        d={s.bumpy
                          ? 'M0 54 q15 -22 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 L300 96 L0 96 Z'
                          : 'M0 58 q75 -10 150 0 t150 0 L300 96 L0 96 Z'}
                        fill={C.accentDeep} opacity={0.85}
                      />
                      {s.bumpy && [40, 110, 180, 250].map((x, k) => <circle key={k} cx={x} cy={38} r="4" fill={C.strike} opacity={0.6} />)}
                    </g>
                    <rect x="1" y="1" width="298" height="94" rx="16" fill="none" stroke="rgba(0,0,0,0.12)" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SplitPanel>
    </Gate>
  );
};

/* ---------- Slide c : HEALED RESULTS ↑ ---------- */
export const HealedSlide: React.FC<SP> = ({ start, end }) => {
  const t = useT();
  const grow = pop(t, 15.3, 2.2);
  const arrow = pop(t, 17.6, 0.6);
  const bars = [0.42, 0.6, 0.78, 1.0];
  return (
    <Gate start={start} end={end}>
      <SplitPanel enter={easeOutCubic(clamp01((t - start) / 0.35))}>
        <div style={{ padding: '56px 64px', width: 912, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end', gap: 40 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-block', background: C.good, color: '#fff', fontFamily: F.slide, fontWeight: 700, fontSize: 30, padding: '8px 20px', borderRadius: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
              Healed results
            </div>
            <Title size={66}>UP&nbsp;&amp;&nbsp;EVEN</Title>
            <div style={{ fontFamily: F.slide, fontWeight: 500, fontSize: 32, color: C.inkSoft, marginTop: 10 }}>
              no more uneven texture
            </div>
          </div>
          {/* bar graph + rising arrow */}
          <svg width="360" height="300" viewBox="0 0 360 300">
            <line x1="20" y1="270" x2="340" y2="270" stroke={C.inkSoft} strokeWidth="3" />
            {bars.map((b, i) => {
              const x = 40 + i * 76;
              const full = 230 * b;
              const h = full * grow;
              return <rect key={i} x={x} y={270 - h} width="52" height={h} rx="8" fill={i === 3 ? C.accent : C.blush} />;
            })}
            <g opacity={arrow} transform={`translate(${310 - (1 - arrow) * 60}, ${40 + (1 - arrow) * 60})`}>
              <IconArrowUp size={72} color={C.accentDeep} />
            </g>
            <polyline
              points="66,228 142,196 218,150 294,70"
              fill="none" stroke={C.accentDeep} strokeWidth="5" strokeLinecap="round"
              strokeDasharray="320" strokeDashoffset={320 * (1 - grow)}
            />
          </svg>
        </div>
      </SplitPanel>
    </Gate>
  );
};

/* ---------- Slide d : 4 tool icon cards ---------- */
export const IconsSlide: React.FC<SP> = ({ start, end }) => {
  const t = useT();
  const cards = [
    { label: 'Needle', trig: 26.47, Icon: IconNeedle },
    { label: 'Hand speed', trig: 27.27, Icon: IconHand },
    { label: 'Machine speed', trig: 27.97, Icon: IconMachine },
    { label: 'Pressure', trig: 29.04, Icon: IconPressure },
  ];
  const lead = pop(t, 25.6, 0.3);
  return (
    <Gate start={start} end={end}>
      <SplitPanel enter={easeOutCubic(clamp01((t - start) / 0.35))}>
        <div style={{ padding: '46px 56px', width: 912, boxSizing: 'border-box' }}>
          <div style={{ opacity: lead, fontFamily: F.slide, fontWeight: 700, fontSize: 36, color: C.accent, letterSpacing: 1, marginBottom: 20 }}>
            REAL-TIME ADJUSTMENTS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
            {cards.map((c, i) => {
              const p = pop(t, c.trig);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 18, padding: '22px 24px', borderRadius: 22,
                  background: '#fff', boxShadow: '0 10px 26px rgba(90,60,40,0.14)',
                  opacity: p, transform: `translateY(${(1 - p) * 26}px) scale(${0.9 + 0.1 * p})`,
                }}>
                  <div style={{ width: 70, height: 70, borderRadius: 18, background: C.beige, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accentDeep }}>
                    <c.Icon size={44} color={C.accentDeep} />
                  </div>
                  <div style={{ fontFamily: F.slide, fontWeight: 600, fontSize: 38, color: C.ink }}>{c.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </SplitPanel>
    </Gate>
  );
};

/* ---------- overlay card base ---------- */
const OverlayCard: React.FC<{ children: React.ReactNode; t: number; start: number; top?: number; h?: number; blur?: boolean }> = ({
  children, t, start, top = H * 0.3, h = H * 0.34, blur = true,
}) => {
  const e = easeOutCubic(clamp01((t - start) / 0.3));
  return (
    <>
      {/* light scene darken to focus the glass card */}
      {blur && <div style={{ position: 'absolute', inset: 0, background: `rgba(16,10,7,${0.24 * e})` }} />}
      {/* frosted-glass card: blurred background shows through */}
      <div style={{
        position: 'absolute', left: W * 0.06, right: W * 0.17, top, minHeight: h,
        transform: `translateY(${(1 - e) * 40}px) scale(${0.94 + 0.06 * e})`, opacity: e,
        background: `rgba(247,239,231,0.42)`,
        backdropFilter: `blur(${30 * e}px) saturate(1.35)`,
        WebkitBackdropFilter: `blur(${30 * e}px) saturate(1.35)`,
        borderRadius: 40,
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.65)',
        padding: '48px 52px',
      }}>
        {children}
      </div>
    </>
  );
};

/* ---------- Slide e : 3×3×3 -> 1 CLEAR RESULT ---------- */
export const ThreeSlide: React.FC<SP> = ({ start, end }) => {
  const t = useT();
  const rows = [
    { n: '3', label: 'needles', trig: 32.49 },
    { n: '3', label: 'speeds', trig: 33.37 },
    { n: '3', label: 'machines', trig: 34.57 },
  ];
  const strike = pop(t, 35.2, 0.5);
  const result = pop(t, 35.75, 0.3);
  return (
    <Gate start={start} end={end}>
      <OverlayCard t={t} start={start} top={H * 0.28} h={H * 0.4}>
        <div style={{ fontFamily: F.slide, fontWeight: 700, fontSize: 34, color: C.accent, letterSpacing: 1, marginBottom: 18 }}>THE OLD GUESSWORK</div>
        <div style={{ position: 'relative' }}>
          {rows.map((r, i) => {
            const p = pop(t, r.trig);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 10, opacity: p, transform: `translateX(${(1 - p) * 24}px)` }}>
                <span style={{ fontFamily: F.cap, fontWeight: 800, fontSize: 58, color: C.accentDeep }}>{r.n}</span>
                <span style={{ fontFamily: F.slide, fontWeight: 600, fontSize: 46, color: C.ink }}>different {r.label}</span>
                {i < 2 && <span style={{ fontFamily: F.cap, fontWeight: 800, fontSize: 46, color: C.inkSoft, marginLeft: 6 }}>×</span>}
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: 0, top: '46%', height: 8, borderRadius: 4, background: C.strike, width: `${strike * 100}%` }} />
        </div>
        <div style={{ marginTop: 26, opacity: result, transform: `scale(${0.8 + 0.2 * result})`, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: C.good, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconCheck size={38} color="#fff" sw={5} />
          </div>
          <span style={{ fontFamily: F.cap, fontWeight: 800, fontSize: 58, color: C.ink }}>1 CLEAR RESULT</span>
        </div>
      </OverlayCard>
    </Gate>
  );
};

/* ---------- Slide f : PRO TIP badge (flash) ---------- */
export const ProTipSlide: React.FC<SP> = ({ start, end }) => {
  const t = useT();
  const flash = interpolate(t, [37.55, 37.63, 37.9], [0, 0.85, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const e = easeOutCubic(clamp01((t - 37.6) / 0.35));
  return (
    <Gate start={start} end={end}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 45% at 50% 34%, rgba(0,0,0,0.45), rgba(0,0,0,0) 70%)', opacity: e }} />
      <div style={{ position: 'absolute', inset: 0, background: `rgba(255,255,255,${flash})` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: H * 0.34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, opacity: e, transform: `scale(${0.6 + 0.4 * e})` }}>
        <div style={{ width: 150, height: 150, borderRadius: 40, background: `linear-gradient(150deg, ${C.caramel}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 20px 50px rgba(185,119,76,0.55)` }}>
          <IconBulb size={92} color="#fff" />
        </div>
        <div style={{ fontFamily: F.cap, fontWeight: 800, fontSize: 92, color: '#fff', letterSpacing: 2, textShadow: '0 6px 24px rgba(0,0,0,0.5)' }}>PRO TIP</div>
      </div>
    </Gate>
  );
};

/* ---------- caffeine / sensitive skin card ---------- */
export const CaffeineSlide: React.FC<SP> = ({ start, end }) => {
  const t = useT();
  const rows = [
    { Icon: IconCoffee, label: 'Caffeine?', trig: 43.08, c: '#8a5a2b' },
    { Icon: IconFlower, label: 'Sensitive skin?', trig: 44.34, c: C.pink },
  ];
  return (
    <Gate start={start} end={end}>
      <OverlayCard t={t} start={start} top={H * 0.3} h={H * 0.36}>
        <div style={{ fontFamily: F.slide, fontWeight: 700, fontSize: 38, color: C.accent, marginBottom: 24 }}>Don't blame it on…</div>
        {rows.map((r, i) => {
          const p = pop(t, r.trig);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, opacity: p, transform: `translateX(${(1 - p) * 26}px)` }}>
              <div style={{ width: 74, height: 74, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.c, boxShadow: '0 8px 20px rgba(90,60,40,0.12)' }}>
                <r.Icon size={46} color={r.c} />
              </div>
              <div style={{ fontFamily: F.slide, fontWeight: 600, fontSize: 52, color: C.ink }}>{r.label}</div>
            </div>
          );
        })}
      </OverlayCard>
    </Gate>
  );
};

/* ---------- tools card ---------- */
export const ToolsSlide: React.FC<SP> = ({ start, end }) => {
  const t = useT();
  const e = pop(t, 45.4, 0.4);
  const em = pop(t, 47.0, 0.3);
  return (
    <Gate start={start} end={end}>
      <OverlayCard t={t} start={start} top={H * 0.34} h={H * 0.26}>
        <div style={{ fontFamily: F.slide, fontWeight: 600, fontSize: 40, color: C.inkSoft, opacity: e }}>Instead →</div>
        <div style={{ fontFamily: F.cap, fontWeight: 800, fontSize: 66, color: C.ink, lineHeight: 1.08, marginTop: 10, transform: `scale(${0.96 + 0.04 * em})` }}>
          CHECK YOUR <span style={{ color: C.accent }}>TECHNIQUE</span> &amp; <span style={{ color: C.accent }}>TOOLS</span> FIRST
        </div>
      </OverlayCard>
    </Gate>
  );
};

/* ---------- CTA + closing quote (loops back to opening look) ---------- */
export const CtaSlide: React.FC<SP> = ({ start, end }) => {
  const t = useT();
  const e = easeOutCubic(clamp01((t - start) / 0.4));
  const save = pop(t, start + 0.5, 0.4);
  const follow = pop(t, start + 1.1, 0.4);
  return (
    <Gate start={start} end={end}>
      {/* full brand closing panel — matches opening brand-band look for a seamless loop */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(170deg, ${C.ink} 0%, #2a1a12 60%, ${C.accentDeep} 130%)`, opacity: e }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: H * 0.26, textAlign: 'center', padding: '0 150px 0 90px', opacity: e }}>
        <div style={{ fontFamily: F.slide, fontWeight: 500, fontSize: 36, color: C.caramel, letterSpacing: 3, textTransform: 'uppercase' }}>The takeaway</div>
        <div style={{ fontFamily: F.cap, fontWeight: 800, fontSize: 62, color: '#fff', lineHeight: 1.12, marginTop: 20 }}>
          IT'S YOUR <span style={{ color: C.caramel }}>TECHNIQUE</span>,<br />NOT THE NUMBING
        </div>
      </div>
      <div style={{ position: 'absolute', left: W * 0.08, right: W * 0.17, top: H * 0.52, display: 'flex', flexDirection: 'column', gap: 24, opacity: e }}>
        <div style={{ opacity: save, transform: `translateY(${(1 - save) * 20}px)`, background: `linear-gradient(90deg, ${C.accent}, ${C.caramel})`, borderRadius: 22, padding: '26px 32px', textAlign: 'center', fontFamily: F.slide, fontWeight: 700, fontSize: 44, color: C.ink }}>
          Save this for your next client
        </div>
        <div style={{ opacity: follow, transform: `translateY(${(1 - follow) * 20}px)`, textAlign: 'center', fontFamily: F.slide, fontWeight: 600, fontSize: 40, color: '#fff' }}>
          Follow <span style={{ color: C.caramel, fontWeight: 700 }}>@karilynmay.pmu</span>
          <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>for more PMU tips</div>
        </div>
      </div>
    </Gate>
  );
};
