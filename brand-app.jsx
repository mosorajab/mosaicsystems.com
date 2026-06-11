/* global React, DesignCanvas, DCSection, DCArtboard */
const { useState } = React;

/* =========================================================================
   MOSAIC SYSTEMS — brand exploration
   Palette carried from the portfolio: warm paper, warm ink, oxblood.
   ========================================================================= */
const BRAND = {
  paper:    "#f6f1e7",
  paper2:   "#ece4d4",
  ink:      "#221f1a",
  inkSoft:  "rgba(34,31,26,0.55)",
  oxblood:  "#8b2b25",
  oxLight:  "#c8604f", // brightened accent for dark grounds
  paperSoft:"rgba(246,241,231,0.55)"
};

/* ---- THE MARKS -------------------------------------------------------- */
// A — Diagonal: 3×3 tessellation, anti-diagonal in accent. Cleanest;
//     continues the portfolio's existing glyph DNA.
function MarkA({ fg, ax, size = 120 }) {
  const g = 10, t = (120 - 2 * g) / 3;
  const accent = new Set([2, 4, 6]);
  const cells = [];
  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3), c = i % 3;
    cells.push(<rect key={i} x={c * (t + g)} y={r * (t + g)} width={t} height={t} fill={accent.has(i) ? ax : fg} />);
  }
  return <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">{cells}</svg>;
}

// B — Monogram: the letter M built from modular tiles on a 5-col grid;
//     the inner "V" of the M picked out in accent. Strongest name tie.
function MarkB({ fg, ax, size = 120 }) {
  const g = 6, t = (120 - 4 * g) / 5;
  const map = {
    "0,0": 1, "0,4": 1,
    "1,0": 1, "1,1": 2, "1,3": 2, "1,4": 1,
    "2,0": 1, "2,2": 2, "2,4": 1,
    "3,0": 1, "3,4": 1,
    "4,0": 1, "4,4": 1
  };
  const cells = Object.keys(map).map((k) => {
    const [r, c] = k.split(",").map(Number);
    return <rect key={k} x={c * (t + g)} y={r * (t + g)} width={t} height={t} fill={map[k] === 2 ? ax : fg} />;
  });
  return <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">{cells}</svg>;
}

// C — Subdivision: a quartered square whose final cell resolves into a
//     finer 2×2 — a mosaic "assembling into systems". Most conceptual.
function MarkC({ fg, ax, size = 120 }) {
  const g = 6, L = (120 - g) / 2;
  const sg = 4, sm = (L - sg) / 2, ox = L + g, oy = L + g;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <rect x={0} y={0} width={L} height={L} fill={fg} />
      <rect x={L + g} y={0} width={L} height={L} fill={fg} />
      <rect x={0} y={L + g} width={L} height={L} fill={fg} />
      <rect x={ox} y={oy} width={sm} height={sm} fill={fg} />
      <rect x={ox + sm + sg} y={oy} width={sm} height={sm} fill={fg} />
      <rect x={ox} y={oy + sm + sg} width={sm} height={sm} fill={fg} />
      <rect x={ox + sm + sg} y={oy + sm + sg} width={sm} height={sm} fill={ax} />
    </svg>
  );
}

const MARKS = { A: MarkA, B: MarkB, C: MarkC };
function Mark({ v, ...rest }) { const C = MARKS[v]; return <C {...rest} />; }

/* ---- building blocks -------------------------------------------------- */
function Plate({ bg = BRAND.paper, children, pad = 0, style }) {
  return (
    <div style={{
      width: "100%", height: "100%", background: bg, display: "flex",
      alignItems: "center", justifyContent: "center", flexDirection: "column",
      padding: pad, boxSizing: "border-box", ...style
    }}>{children}</div>
  );
}
function Caption({ children, on = "light" }) {
  return (
    <div style={{
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, letterSpacing: "0.16em",
      textTransform: "uppercase", marginTop: 22,
      color: on === "dark" ? BRAND.paperSoft : BRAND.inkSoft
    }}>{children}</div>
  );
}

/* ---- LOCKUPS ---------------------------------------------------------- */
function HorizontalLockup({ v = "A", on = "light" }) {
  const fg = on === "dark" ? BRAND.paper : BRAND.ink;
  const ax = on === "dark" ? BRAND.oxLight : BRAND.oxblood;
  const soft = on === "dark" ? BRAND.paperSoft : BRAND.inkSoft;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
      <Mark v={v} fg={fg} ax={ax} size={72} />
      <div style={{ lineHeight: 1, textAlign: "left" }}>
        <div style={{ fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: 600, fontSize: 38, letterSpacing: "0.005em", color: fg }}>Mosaic</div>
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 14, letterSpacing: "0.46em", textTransform: "uppercase", color: soft, marginTop: 9, marginLeft: 2 }}>Systems</div>
      </div>
    </div>
  );
}
function VerticalLockup({ v = "A", on = "light" }) {
  const fg = on === "dark" ? BRAND.paper : BRAND.ink;
  const ax = on === "dark" ? BRAND.oxLight : BRAND.oxblood;
  const soft = on === "dark" ? BRAND.paperSoft : BRAND.inkSoft;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <Mark v={v} fg={fg} ax={ax} size={92} />
      <div style={{ textAlign: "center", lineHeight: 1 }}>
        <div style={{ fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: 600, fontSize: 26, letterSpacing: "0.18em", textTransform: "uppercase", color: fg }}>Mosaic</div>
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, letterSpacing: "0.44em", textTransform: "uppercase", color: soft, marginTop: 10 }}>Systems</div>
      </div>
    </div>
  );
}

/* ---- INSTAGRAM AVATAR ------------------------------------------------- */
function Avatar({ v = "A", on = "dark", size = 168 }) {
  const dark = on === "dark";
  const bg = dark ? BRAND.ink : BRAND.paper;
  const fg = dark ? BRAND.paper : BRAND.ink;
  const ax = dark ? BRAND.oxLight : BRAND.oxblood;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 1px 0 rgba(34,31,26,0.10)",
      border: dark ? "none" : "1px solid rgba(34,31,26,0.10)"
    }}>
      <Mark v={v} fg={fg} ax={ax} size={size * 0.5} />
    </div>
  );
}

/* ========================================================================= */
function App() {
  const [primary] = useState("C");
  return (
    <DesignCanvas>
      <DCSection id="marks" title="The Mark" subtitle="Three Swiss-modular directions · pick one to lock">
        <DCArtboard id="mk-a" label="A · Diagonal" width={300} height={330}>
          <Plate><Mark v="A" fg={BRAND.ink} ax={BRAND.oxblood} size={148} /><Caption>01 — Tessellation</Caption></Plate>
        </DCArtboard>
        <DCArtboard id="mk-b" label="B · Monogram M" width={300} height={330}>
          <Plate><Mark v="B" fg={BRAND.ink} ax={BRAND.oxblood} size={148} /><Caption>02 — The M</Caption></Plate>
        </DCArtboard>
        <DCArtboard id="mk-c" label="C · Subdivision" width={300} height={330}>
          <Plate><Mark v="C" fg={BRAND.ink} ax={BRAND.oxblood} size={148} /><Caption>03 — Systems</Caption></Plate>
        </DCArtboard>
      </DCSection>

      <DCSection id="lockup" title="Primary Lockup" subtitle="Shown with mark A — swappable to B or C">
        <DCArtboard id="lk-h" label="Horizontal" width={520} height={240}>
          <Plate pad={34} style={{ alignItems: "flex-start", justifyContent: "center" }}>
            <HorizontalLockup v={primary} />
          </Plate>
        </DCArtboard>
        <DCArtboard id="lk-v" label="Stacked" width={320} height={360}>
          <Plate><VerticalLockup v={primary} /></Plate>
        </DCArtboard>
        <DCArtboard id="lk-inv" label="Reversed" width={520} height={240}>
          <Plate bg={BRAND.ink} pad={34} style={{ alignItems: "flex-start", justifyContent: "center" }}>
            <HorizontalLockup v={primary} on="dark" />
          </Plate>
        </DCArtboard>
      </DCSection>

      <DCSection id="ig" title="Instagram Avatar" subtitle="Circular crop · mark only, centered with safe margin">
        <DCArtboard id="ig-a" label="Avatar · A (dark)" width={260} height={300}>
          <Plate bg={BRAND.paper2}><Avatar v="A" on="dark" /><Caption>Mark A</Caption></Plate>
        </DCArtboard>
        <DCArtboard id="ig-b" label="Avatar · B (dark)" width={260} height={300}>
          <Plate bg={BRAND.paper2}><Avatar v="B" on="dark" /><Caption>Mark B</Caption></Plate>
        </DCArtboard>
        <DCArtboard id="ig-c" label="Avatar · C (dark)" width={260} height={300}>
          <Plate bg={BRAND.paper2}><Avatar v="C" on="dark" /><Caption>Mark C</Caption></Plate>
        </DCArtboard>
        <DCArtboard id="ig-light" label="Avatar · C (light)" width={260} height={300}>
          <Plate bg={BRAND.ink}><Avatar v="C" on="light" /><Caption on="dark">Light variant</Caption></Plate>
        </DCArtboard>
      </DCSection>

      <DCSection id="oncolor" title="On Color" subtitle="Ground tests for the recommended mark">
        <DCArtboard id="oc-ink" label="On ink" width={240} height={240}>
          <Plate bg={BRAND.ink}><Mark v={primary} fg={BRAND.paper} ax={BRAND.oxLight} size={116} /></Plate>
        </DCArtboard>
        <DCArtboard id="oc-ox" label="On oxblood" width={240} height={240}>
          <Plate bg={BRAND.oxblood}><Mark v={primary} fg={BRAND.paper} ax={BRAND.ink} size={116} /></Plate>
        </DCArtboard>
        <DCArtboard id="oc-mono" label="Monochrome" width={240} height={240}>
          <Plate bg={BRAND.paper}><Mark v={primary} fg={BRAND.ink} ax={BRAND.ink} size={116} /></Plate>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
