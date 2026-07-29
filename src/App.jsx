import React, { useState, useMemo, useEffect } from "react";
import {
  Home,
  List,
  CreditCard,
  Repeat,
  Plus,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Cake,
  Bus,
  Wallet,
  X,
  Trash2,
  Copy,
  ChevronDown,
  Utensils,
  Bike,
  Car,
  Coffee,
  Film,
  Wifi,
  Shirt,
  Heart,
  Landmark,
  Gift,
  ShieldCheck,
  TrendingUp,
  Check,
  Dumbbell,
  Stethoscope,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ---------------------------------------------------------- */
/* Tokens                                                       */
/* ---------------------------------------------------------- */
const C = {
  bg: "#FFFFFF",
  card: "#F2F4F6",
  ink: "#191F28",
  inkSoft: "#8B95A1",
  inkMute: "#B0B8C1",
  border: "#F2F4F6",
  accent: "#3182F6",
  accent2: "#3182F6",
  accentSoft: "#EBF2FE",
  danger: "#F04452",
  dangerSoft: "#FDEEEF",
  gold: "#3182F6",
  blue: "#3182F6",
  accentIcon: "#3182F6",
  dangerIcon: "#F04452",
  pSage: "#3182F6",
  pRose: "#F04452",
  pOrchid: "#3182F6",
  pCream: "#3182F6",
  pBlue: "#3182F6",
  pBlue2: "#3182F6",
};

const EXPENSE_CATEGORIES = ["식비", "배달", "자동차", "교통", "카페", "생활", "문화·여가", "주거·통신", "의복·미용", "데이트", "금융·보험", "구독비", "운동", "의료"].sort((a, b) => a.localeCompare(b, "ko"));
const INCOME_CATEGORIES = ["급여", "부수입", "금융", "기타", "보험금", "주식"].sort((a, b) => a.localeCompare(b, "ko"));

const GREEN_RAMP = ["#3182F6", "#5B9BF8", "#85B4FA", "#AECDFB", "#1B64C7", "#0F4A9C"];
const CAT_COLORS = {
  식비: GREEN_RAMP[0],
  배달: GREEN_RAMP[1],
  자동차: GREEN_RAMP[2],
  교통: GREEN_RAMP[3],
  카페: GREEN_RAMP[4],
  생활: GREEN_RAMP[5],
  "문화·여가": GREEN_RAMP[0],
  "주거·통신": GREEN_RAMP[1],
  "의복·미용": GREEN_RAMP[2],
  데이트: GREEN_RAMP[3],
  "금융·보험": GREEN_RAMP[4],
  구독비: GREEN_RAMP[5],
  급여: GREEN_RAMP[0],
  부수입: GREEN_RAMP[1],
  금융: GREEN_RAMP[2],
  기타: GREEN_RAMP[3],
  보험금: GREEN_RAMP[4],
  주식: GREEN_RAMP[5],
  운동: GREEN_RAMP[0],
  의료: GREEN_RAMP[1],
};

const CAT_ICON = {
  식비: Utensils,
  배달: Bike,
  자동차: Car,
  교통: Bus,
  카페: Coffee,
  생활: Home,
  "문화·여가": Film,
  "주거·통신": Wifi,
  "의복·미용": Shirt,
  데이트: Heart,
  "금융·보험": Landmark,
  구독비: Repeat,
  급여: Wallet,
  부수입: Gift,
  금융: Landmark,
  기타: Wallet,
  보험금: ShieldCheck,
  주식: TrendingUp,
  운동: Dumbbell,
  의료: Stethoscope,
};

const won = (n) => Math.round(Math.abs(n)).toLocaleString("ko-KR") + "원";

const TODAY = "2026-07-28";

function addMonthsToDateStr(dateStr, k) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const totalMonths = y * 12 + (m - 1) + k;
  const ny = Math.floor(totalMonths / 12);
  const nm = (totalMonths % 12) + 1;
  const daysInMonth = new Date(ny, nm, 0).getDate();
  const nd = Math.min(d, daysInMonth);
  return `${ny}-${String(nm).padStart(2, "0")}-${String(nd).padStart(2, "0")}`;
}

const TAB_META = {
  home: { label: "HOME", icon: Home },
  transactions: { label: "내역", icon: List },
  cards: { label: "카드 · 통장", icon: CreditCard },
  fixed: { label: "고정지출", icon: Repeat },
};

/* ---------------------------------------------------------- */
/* Seed data                                                    */
/* ---------------------------------------------------------- */
const txByMonth = {
  "2026-07": [],
  "2026-06": [],
  "2026-05": [],
  "2026-04": [],
};

const initialFixed = [];

const cardsSeed = [];

const CARD_ISSUERS = ["삼성카드", "우리카드", "신한카드", "현대카드", "국민카드"].sort((a, b) => a.localeCompare(b, "ko"));
const PAYMENT_TYPES = ["카드", "현금"];
const CARD_KINDS = ["신용", "체크"];

const accountsSeed = [];

const loansSeed = [];

const installmentsSeed = [];

const MONTHS = ["2026-07", "2026-06", "2026-05", "2026-04"];
const MONTH_LABEL = {
  "2026-07": "2026년 7월",
  "2026-06": "2026년 6월",
  "2026-05": "2026년 5월",
  "2026-04": "2026년 4월",
};
const MONTH_RANGE = {
  "2026-07": "07.01 ~ 07.31",
  "2026-06": "06.01 ~ 06.30",
  "2026-05": "05.01 ~ 05.31",
  "2026-04": "04.01 ~ 04.30",
};

/* ---------------------------------------------------------- */
/* Shared bits                                                  */
/* ---------------------------------------------------------- */
function Header({ tabKey, title, onBack, right, month, setMonth }) {
  const isTabScreen = !onBack && TAB_META[tabKey];

  return (
    <div
      style={{
        padding: "20px 20px 16px",
        background: isTabScreen ? C.accent : C.bg,
      }}
    >
      <div className="flex items-center justify-between">
        <div style={{ width: "24px" }}>
          {onBack && (
            <button onClick={onBack} style={{ color: C.ink, display: "flex" }}>
              <ArrowLeft size={20} />
            </button>
          )}
        </div>
        <span
          style={{
            fontSize: "17px",
            fontWeight: 800,
            color: isTabScreen ? "#fff" : C.ink,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </span>
        <div style={{ width: "24px", display: "flex", justifyContent: "flex-end" }}>{right}</div>
      </div>
      {tabKey === "home" && month && setMonth && (
        <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{
                appearance: "none",
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: "10px",
                padding: "6px 28px 6px 12px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#fff",
                textAlign: "center",
              }}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m} style={{ color: "#000" }}>
                  {MONTH_LABEL[m]}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#fff" }} />
          </div>
        </div>
      )}
    </div>
  );
}

function BottomNav({ tab, setTab, onAdd }) {
  const items = [
    { key: "home", label: "HOME", icon: Home },
    { key: "transactions", label: "내역", icon: List },
  ];
  const items2 = [
    { key: "cards", label: "카드·통장", icon: CreditCard },
    { key: "fixed", label: "고정지출", icon: Repeat },
  ];
  const Item = ({ it }) => {
    const Icon = it.icon;
    const active = tab === it.key;
    return (
      <button
        onClick={() => setTab(it.key)}
        className="flex flex-col items-center"
        style={{ gap: "2px", color: active ? C.accent : C.inkMute }}
      >
        <Icon size={20} />
        <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500 }}>{it.label}</span>
      </button>
    );
  };
  return (
    <div
      className="flex items-center justify-around"
      style={{ padding: "10px 8px", borderTop: `1px solid ${C.border}`, background: C.card }}
    >
      {items.map((it) => (
        <Item key={it.key} it={it} />
      ))}
      <button
        onClick={onAdd}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: C.accent,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={20} />
      </button>
      {items2.map((it) => (
        <Item key={it.key} it={it} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Home                                                          */
/* ---------------------------------------------------------- */
function HomeScreen({ tx, txAll, month, cards, loans, goTransactions, goCards, saveState, onReset }) {
  const income = tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = tx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  const cardTotal = cards.reduce(
    (s, c) => s + tx.filter((t) => t.type === "expense" && t.method === c.method).reduce((a, t) => a + t.amount, 0),
    0
  );
  const loanTotal = loans.reduce((s, l) => s + l.balance, 0);
  const debtTotal = cardTotal + loanTotal;

  const categoryData = useMemo(() => {
    const map = {};
    tx.filter((t) => t.type === "expense").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tx]);

  const trendData = MONTHS.slice()
    .reverse()
    .map((m) => {
      const items = txAll[m] || [];
      const inc = items.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = items.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { m: m.slice(5) + "월", 수입: inc, 지출: exp };
    });

  const prevMonthKey = MONTHS[MONTHS.indexOf(month) + 1];
  const prevItems = prevMonthKey ? txAll[prevMonthKey] || [] : [];
  const prevIncome = prevItems.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevItems.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const prevNet = prevIncome - prevExpense;
  const netDiff = net - prevNet;
  const fixedExpense = tx.filter((t) => t.type === "expense" && t.recurring === "고정").reduce((s, t) => s + t.amount, 0);
  const fixedRatio = expense ? Math.round((fixedExpense / expense) * 100) : 0;

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div className="flex items-center justify-end gap-3" style={{ marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", color: C.inkMute }}>
          {saveState === "saving" ? "저장 중..." : saveState === "error" ? "저장 실패" : "저장됨"}
        </span>
        <button onClick={onReset} style={{ fontSize: "11px", color: C.inkSoft, textDecoration: "underline" }}>
          초기화
        </button>
      </div>
      <div style={{ background: C.card, borderRadius: "16px", padding: "20px 14px", marginBottom: "10px", border: `1px solid ${C.border}`, textAlign: "center" }}>
        <div style={{ fontSize: "12px", color: C.inkSoft, marginBottom: "6px" }}>이번 달 기준 순 잔액</div>
        <div style={{ fontSize: "32px", fontWeight: 800, color: net >= 0 ? C.accent : C.danger, letterSpacing: "-0.02em", marginBottom: "10px" }}>
          {net >= 0 ? "" : "-"}
          {won(net)}
        </div>
        <div className="flex items-center justify-center gap-2">
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "20px",
              background: netDiff >= 0 ? C.accentSoft : C.dangerSoft,
              color: netDiff >= 0 ? C.accent : C.danger,
            }}
          >
            지난달 대비 {netDiff >= 0 ? "+" : "-"}
            {won(netDiff)}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "20px",
              background: C.accentSoft,
              color: C.accent,
            }}
          >
            고정지출 비중 {fixedRatio}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2" style={{ marginBottom: "10px" }}>
        <button onClick={() => goTransactions("수입")} className="text-left" style={{ background: C.card, borderRadius: "12px", padding: "12px", border: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-1" style={{ fontSize: "12px", color: C.inkSoft, marginBottom: "4px" }}>
            <ArrowUpRight size={13} /> 이번 달 수입
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700 }}>{won(income)}</div>
        </button>
        <button onClick={() => goTransactions("지출")} className="text-left" style={{ background: C.card, borderRadius: "12px", padding: "12px", border: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-1" style={{ fontSize: "12px", color: C.inkSoft, marginBottom: "4px" }}>
            <ArrowDownRight size={13} /> 이번 달 지출
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700 }}>{won(expense)}</div>
        </button>
      </div>

      <button
        onClick={goCards}
        className="w-full text-left"
        style={{ background: C.dangerSoft, borderRadius: "12px", padding: "12px 14px", marginBottom: "14px", border: `1px solid ${C.danger}22` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: "12px", color: C.danger }}>카드 + 대출 총 부채</div>
            <div style={{ fontSize: "11px", color: C.danger, opacity: 0.85 }}>
              카드 {won(cardTotal)} · 대출 {won(loanTotal)}
            </div>
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: C.danger }}>{won(debtTotal)}</div>
        </div>
      </button>

      <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>월별 수입 · 지출 추이</div>
      <div style={{ height: "150px", marginBottom: "16px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData}>
            <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.inkSoft }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => won(v)} contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="수입" fill={C.pBlue} radius={[3, 3, 0, 0]} />
            <Bar dataKey="지출" fill={C.pRose} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>카테고리별 지출 비중</div>
      <div className="flex items-center gap-4">
        <div style={{ width: "120px", height: "120px", flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={58} paddingAngle={2}>
                {categoryData.map((d, i) => (
                  <Cell key={i} fill={CAT_COLORS[d.name] || C.gold} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => won(v)} contentStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-1.5">
          {categoryData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5" style={{ fontSize: "12px", color: C.ink }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: CAT_COLORS[d.name] || C.gold, display: "inline-block" }} />
              {d.name} {Math.round((d.value / (expense || 1)) * 100)}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Transactions                                                  */
/* ---------------------------------------------------------- */
function MonthNav({ month, setMonth }) {
  const idx = MONTHS.indexOf(month);
  const prevMonth = MONTHS[idx + 1]; // MONTHS is desc order (07,06,05,04)
  const nextMonth = MONTHS[idx - 1];
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
      <button onClick={() => prevMonth && setMonth(prevMonth)} disabled={!prevMonth} style={{ color: prevMonth ? C.ink : C.inkMute, padding: "4px" }}>
        <ArrowLeft size={16} />
      </button>
      <span style={{ fontSize: "14px", fontWeight: 700 }}>{MONTH_LABEL[month]}</span>
      <button
        onClick={() => nextMonth && setMonth(nextMonth)}
        disabled={!nextMonth}
        style={{ color: nextMonth ? C.ink : C.inkMute, padding: "4px", transform: "rotate(180deg)" }}
      >
        <ArrowLeft size={16} />
      </button>
    </div>
  );
}

function SummaryBar({ tx }) {
  const income = tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = tx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return (
    <div className="flex items-center" style={{ background: C.card, borderRadius: "12px", padding: "12px", marginBottom: "12px", border: `1px solid ${C.border}` }}>
      <div style={{ flex: 1, textAlign: "center" }}>
        <div style={{ fontSize: "11px", color: C.inkSoft, marginBottom: "2px" }}>수입</div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.accent }}>{won(income)}</div>
      </div>
      <div style={{ width: "1px", height: "28px", background: C.border }} />
      <div style={{ flex: 1, textAlign: "center" }}>
        <div style={{ fontSize: "11px", color: C.inkSoft, marginBottom: "2px" }}>지출</div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.danger }}>{won(expense)}</div>
      </div>
      <div style={{ width: "1px", height: "28px", background: C.border }} />
      <div style={{ flex: 1, textAlign: "center" }}>
        <div style={{ fontSize: "11px", color: C.inkSoft, marginBottom: "2px" }}>합계</div>
        <div style={{ fontSize: "13px", fontWeight: 700 }}>{won(income - expense)}</div>
      </div>
    </div>
  );
}

function CalendarView({ month, tx }) {
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const byDay = {};
  tx.forEach((t) => {
    const d = parseInt(t.date.slice(8, 10), 10);
    byDay[d] = byDay[d] || { income: 0, expense: 0 };
    if (t.type === "income") byDay[d].income += t.amount;
    else byDay[d].expense += t.amount;
  });

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7" style={{ marginBottom: "4px" }}>
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: "11px", color: C.inkMute, padding: "4px 0" }}>
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7" style={{ rowGap: "2px" }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const info = byDay[d];
          return (
            <div key={i} style={{ minHeight: "52px", padding: "3px 2px", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", color: C.ink, textAlign: "center", marginBottom: "2px" }}>{d}</div>
              {info && (
                <div style={{ textAlign: "center" }}>
                  {info.income > 0 && (
                    <div style={{ fontSize: "9px", color: C.accent, fontWeight: 600, lineHeight: 1.3 }}>{Math.round(info.income / 1000)}천</div>
                  )}
                  {info.expense > 0 && (
                    <div style={{ fontSize: "9px", color: C.danger, fontWeight: 600, lineHeight: 1.3 }}>{Math.round(info.expense / 1000)}천</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyListView({ txAll, goMonth }) {
  const rows = MONTHS.map((m) => {
    const items = txAll[m] || [];
    const income = items.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = items.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { m, income, expense, net: income - expense };
  });

  return (
    <div>
      <div
        className="flex items-center"
        style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}`, marginBottom: "6px", fontSize: "12px", color: C.inkSoft, fontWeight: 600 }}
      >
        <div style={{ flex: 1.4 }}>월</div>
        <div style={{ flex: 1, textAlign: "right" }}>수입</div>
        <div style={{ flex: 1, textAlign: "right" }}>지출</div>
        <div style={{ flex: 1, textAlign: "right" }}>합계</div>
      </div>
      {rows.map((r) => (
        <button
          key={r.m}
          onClick={() => goMonth(r.m)}
          className="w-full flex items-center text-left"
          style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}
        >
          <div style={{ flex: 1.4 }}>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{r.m.slice(5)}월</div>
            <div style={{ fontSize: "11px", color: C.inkMute }}>{MONTH_RANGE[r.m]}</div>
          </div>
          <div style={{ flex: 1, textAlign: "right", fontSize: "12px", color: C.accent, fontWeight: 600 }}>{won(r.income)}</div>
          <div style={{ flex: 1, textAlign: "right", fontSize: "12px", color: C.danger, fontWeight: 600 }}>{won(r.expense)}</div>
          <div style={{ flex: 1, textAlign: "right", fontSize: "12px", fontWeight: 700, color: r.net >= 0 ? C.ink : C.danger }}>
            {r.net >= 0 ? "" : "-"}
            {won(r.net)}
          </div>
        </button>
      ))}
    </div>
  );
}

function TransactionsScreen({ tx, setTx, filter, setFilter, txAll, goMonth, month, setMonth }) {
  const [viewMode, setViewMode] = useState("일별");

  const filtered = tx.filter((t) => {
    if (filter === "전체") return true;
    if (filter === "수입") return t.type === "income";
    if (filter === "지출") return t.type === "expense";
    if (filter === "고정") return t.recurring === "고정";
    if (filter === "변동") return t.recurring === "변동";
    return true;
  });

  const grouped = useMemo(() => {
    const map = {};
    filtered
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .forEach((t) => {
        (map[t.date] = map[t.date] || []).push(t);
      });
    return map;
  }, [filtered]);

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <MonthNav month={month} setMonth={setMonth} />
      <div className="flex gap-1.5" style={{ marginBottom: "10px" }}>
        {["일별", "달력", "월별"].map((v) => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            style={{
              fontSize: "12px",
              padding: "5px 12px",
              borderRadius: "14px",
              background: viewMode === v ? C.accent : "transparent",
              color: viewMode === v ? "#fff" : C.inkSoft,
              border: viewMode === v ? "none" : `1px solid ${C.border}`,
            }}
          >
            {v}
          </button>
        ))}
      </div>

      <SummaryBar tx={tx} />

      {viewMode === "월별" && <MonthlyListView txAll={txAll} goMonth={goMonth} />}
      {viewMode === "달력" && <CalendarView month={month} tx={tx} />}
      {viewMode === "일별" && (
        <>
          <div className="flex gap-1.5" style={{ marginBottom: "12px", overflowX: "auto" }}>
            {["전체", "수입", "지출", "고정", "변동"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: "12px",
                  padding: "5px 12px",
                  borderRadius: "14px",
                  whiteSpace: "nowrap",
                  background: filter === f ? C.accent : "transparent",
                  color: filter === f ? "#fff" : C.inkSoft,
                  border: filter === f ? "none" : `1px solid ${C.border}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "12px", color: C.inkSoft, marginBottom: "6px" }}>{date.slice(5).replace("-", "월 ")}일</div>
              {items.map((t) => {
                const Icon = CAT_ICON[t.category] || Wallet;
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between"
                    style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: t.type === "income" ? C.accentSoft : t.recurring === "고정" ? C.dangerSoft : C.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={15} color={t.type === "income" ? C.accentIcon : t.recurring === "고정" ? C.dangerIcon : C.inkMute} />
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{t.memo}</div>
                        <div style={{ fontSize: "11px", color: C.inkMute }}>
                          {t.category} · {t.recurring} · {t.method}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        <span style={{ fontSize: "13px", fontWeight: 600, color: t.type === "income" ? C.accent : C.ink }}>
                          {t.type === "income" ? "+" : "-"}
                          {won(t.amount)}
                        </span>
                        {t.discount > 0 && (
                          <span style={{ fontSize: "10px", color: C.inkMute }}>
                            {won(t.originalAmount)} - 할인 {won(t.discount)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setTx((prev) => {
                            const idx = prev.findIndex((p) => p.id === t.id);
                            const copy = { ...t, id: "t" + Date.now() };
                            const next = [...prev];
                            next.splice(idx + 1, 0, copy);
                            return next;
                          })
                        }
                        style={{ color: C.inkMute }}
                      >
                        <Copy size={13} />
                      </button>
                      <button onClick={() => setTx((prev) => prev.filter((p) => p.id !== t.id))} style={{ color: C.inkMute }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div style={{ textAlign: "center", color: C.inkMute, fontSize: "13px", padding: "40px 0" }}>거래 내역이 없어요.</div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Cards & Loans + Installments                                  */
/* ---------------------------------------------------------- */
function CardsScreen({ tx, cards, loans, accounts, installments, setView }) {
  const cardTotal = cards.reduce(
    (s, c) => s + tx.filter((t) => t.type === "expense" && t.method === c.method).reduce((a, t) => a + t.amount, 0),
    0
  );
  const loanTotal = loans.reduce((s, l) => s + l.balance, 0);

  const NavButton = ({ label, sub, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between"
      style={{ background: C.card, borderRadius: "12px", padding: "14px", border: `1px solid ${C.border}` }}
    >
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: "14px", fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: "11px", color: C.inkMute, marginTop: "2px" }}>{sub}</div>
      </div>
      <span style={{ color: C.inkMute, fontSize: "18px" }}>›</span>
    </button>
  );

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div style={{ background: C.accent, borderRadius: "12px", padding: "14px", marginBottom: "16px" }} className="flex items-center justify-between">
        <div>
          <div style={{ fontSize: "12px", color: "#fff", opacity: 0.65 }}>카드 + 대출 합산</div>
          <div style={{ fontSize: "12px", color: "#fff", opacity: 0.65 }}>이번 달 마이너스 총액</div>
        </div>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>-{won(cardTotal + loanTotal)}</div>
      </div>

      <div className="flex flex-col gap-2">
        <NavButton label="전체 카드 내역" sub={`카드 ${cards.length}개 · 가나다순`} onClick={() => setView("allCards")} />
        <NavButton label="전체 통장 내역" sub={`통장 ${accounts.length}개 · 가나다순`} onClick={() => setView("allAccounts")} />
        <NavButton label="할부 내역" sub={`${installments.length}건 진행 중`} onClick={() => setView("installments")} />
        <NavButton label="대출 내역" sub={`${loans.length}건 · 총 ${won(loanTotal)}`} onClick={() => setView("loansList")} />
      </div>

      <div style={{ fontSize: "11px", color: C.inkMute, marginTop: "16px" }}>
        은행·카드사 실시간 자동 연동은 마이데이터 사업자 인증이 필요해서 개인 프로젝트로는 어려워요. 지금은 직접 등록/수정하는 방식이에요.
      </div>
    </div>
  );
}

function AllCardsHistoryScreen({ tx, cards, setView, setSelectedCard, onAddCard }) {
  const cardTotals = cards
    .map((c) => ({
      ...c,
      total: tx.filter((t) => t.type === "expense" && t.method === c.method).reduce((s, t) => s + t.amount, 0),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: C.inkSoft }}>카드 (가나다순)</span>
        <button onClick={onAddCard} style={{ fontSize: "12px", fontWeight: 700, color: C.accent }}>
          + 카드 등록
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {cardTotals.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCard(c.id);
              setView("cardDetail");
            }}
            className="flex items-center justify-between w-full text-left"
            style={{ background: C.card, borderRadius: "12px", padding: "12px", border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2.5">
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CreditCard size={15} color={C.accentIcon} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>{c.name}</span>
                  <span style={{ fontSize: "10px", color: C.accent, background: C.accentSoft, padding: "1px 6px", borderRadius: "6px", fontWeight: 700 }}>{c.kind}</span>
                </div>
                <div style={{ fontSize: "11px", color: C.inkMute }}>
                  {c.issuer} · 결제일 매달 {c.dueDay}일
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ fontSize: "14px", fontWeight: 700 }}>{won(c.total)}</div>
              <span style={{ color: C.inkMute }}>›</span>
            </div>
          </button>
        ))}
        {cardTotals.length === 0 && <div style={{ textAlign: "center", color: C.inkMute, fontSize: "13px", padding: "40px 0" }}>등록된 카드가 없어요.</div>}
      </div>
    </div>
  );
}

function AllAccountsHistoryScreen({ accounts, cards, tx, setView, setSelectedAccount, onAddAccount }) {
  const sortedAccounts = [...accounts]
    .map((a) => {
      const linkedCard = cards.find((c) => c.id === a.linkedCardId);
      const cardSpend = linkedCard ? tx.filter((t) => t.type === "expense" && t.method === linkedCard.method).reduce((s, t) => s + t.amount, 0) : 0;
      return { ...a, availableBalance: a.balance - cardSpend, linkedCard };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: C.inkSoft }}>통장 (가나다순)</span>
        <button onClick={onAddAccount} style={{ fontSize: "12px", fontWeight: 700, color: C.accent }}>
          + 통장 등록
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {sortedAccounts.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setSelectedAccount(a.id);
              setView("accountDetail");
            }}
            className="flex items-center justify-between w-full text-left"
            style={{ background: C.card, borderRadius: "12px", padding: "12px", border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2.5">
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Landmark size={15} color={C.accentIcon} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700 }}>{a.name}</div>
                <div style={{ fontSize: "11px", color: C.inkMute }}>
                  {a.bank} · {a.type}
                  {a.linkedCard ? ` · ${a.linkedCard.name} 연결` : ""}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ fontSize: "14px", fontWeight: 700 }}>{won(a.availableBalance)}</div>
              <span style={{ color: C.inkMute }}>›</span>
            </div>
          </button>
        ))}
        {sortedAccounts.length === 0 && <div style={{ textAlign: "center", color: C.inkMute, fontSize: "13px", padding: "40px 0" }}>등록된 통장이 없어요.</div>}
      </div>
    </div>
  );
}

function LoansListScreen({ loans, setView, setSelectedLoan, onAddLoan }) {
  const loanTotal = loans.reduce((s, l) => s + l.balance, 0);
  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "12px", color: C.inkSoft, marginBottom: "4px" }}>대출 총액</div>
        <div style={{ fontSize: "20px", fontWeight: 700 }}>{won(loanTotal)}</div>
      </div>
      <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: C.inkSoft }}>대출 목록</span>
        <button onClick={onAddLoan} style={{ fontSize: "12px", fontWeight: 700, color: C.accent }}>
          + 대출 등록
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {loans.map((l) => (
          <button
            key={l.id}
            onClick={() => {
              setSelectedLoan(l.id);
              setView("loanDetail");
            }}
            className="flex items-center justify-between w-full text-left"
            style={{ background: C.card, borderRadius: "12px", padding: "12px", border: `1px solid ${C.border}` }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>{l.name}</div>
              <div style={{ fontSize: "11px", color: C.inkMute }}>
                {l.bank ? `${l.bank} · ` : ""}이자율 연 {l.interestRate}% · 월 이자 {won(l.monthlyInterest)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ fontSize: "14px", fontWeight: 700 }}>{won(l.balance)}</div>
              <span style={{ color: C.inkMute }}>›</span>
            </div>
          </button>
        ))}
        {loans.length === 0 && <div style={{ textAlign: "center", color: C.inkMute, fontSize: "13px", padding: "40px 0" }}>등록된 대출이 없어요.</div>}
      </div>
    </div>
  );
}

function CardDetailScreen({ card, tx, txAll, onEdit }) {
  const [mode, setMode] = useState("이번달");
  if (!card) return null;
  const cardTx = tx.filter((t) => t.method === card.method).sort((a, b) => (a.date < b.date ? 1 : -1));
  const total = cardTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const monthlyTotals = MONTHS.slice()
    .reverse()
    .map((m) => {
      const items = (txAll[m] || []).filter((t) => t.type === "expense" && t.method === card.method);
      return { m, total: items.reduce((s, t) => s + t.amount, 0), items };
    });

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "4px" }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>이번 달 사용액</span>
          <span style={{ fontSize: "18px", fontWeight: 700 }}>{won(total)}</span>
        </div>
        <div style={{ fontSize: "12px", color: C.inkSoft }}>결제일 매달 {card.dueDay}일</div>
      </div>

      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700 }}>카드 정보</span>
          <button onClick={onEdit} style={{ fontSize: "12px", fontWeight: 700, color: C.accent }}>
            수정
          </button>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>카드사</span>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{card.issuer}</span>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>카드번호</span>
          <span style={{ fontSize: "13px", fontWeight: 600, fontFamily: "monospace" }}>{card.cardNumber}</span>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>유효기간</span>
          <span style={{ fontSize: "13px", fontWeight: 600, fontFamily: "monospace" }}>{card.expiryDate}</span>
        </div>
        <div style={{ padding: "8px 0 2px" }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>혜택</span>
          <div style={{ fontSize: "13px", marginTop: "4px", lineHeight: 1.5 }}>{card.benefits}</div>
        </div>
      </div>

      <div className="flex gap-1.5" style={{ marginBottom: "12px" }}>
        {["이번달", "월별"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              fontSize: "12px",
              padding: "5px 12px",
              borderRadius: "14px",
              background: mode === m ? C.accent : "transparent",
              color: mode === m ? "#fff" : C.inkSoft,
              border: mode === m ? "none" : `1px solid ${C.border}`,
            }}
          >
            {m} 내역
          </button>
        ))}
      </div>

      {mode === "이번달" && (
        <div className="flex flex-col">
          {cardTx.map((t) => (
            <div key={t.id} className="flex items-center justify-between" style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{t.memo}</div>
                <div style={{ fontSize: "11px", color: C.inkMute }}>{t.date.slice(5)} · {t.category}</div>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>{won(t.amount)}</span>
            </div>
          ))}
          {cardTx.length === 0 && <div style={{ textAlign: "center", color: C.inkMute, fontSize: "13px", padding: "24px 0" }}>이번 달 사용 내역이 없어요.</div>}
        </div>
      )}

      {mode === "월별" && (
        <div className="flex flex-col gap-2">
          {monthlyTotals.map((mt) => (
            <div key={mt.m} className="flex items-center justify-between" style={{ background: C.card, borderRadius: "12px", padding: "12px 14px", border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>{mt.m.slice(5)}월</span>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>{won(mt.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountDetailScreen({ account, tx, cards, onEdit }) {
  if (!account) return null;
  const linkedCard = cards.find((c) => c.id === account.linkedCardId);
  const accountTx = tx
    .filter((t) => t.method === "계좌" || (linkedCard && t.method === linkedCard.method))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const cardSpend = linkedCard ? tx.filter((t) => t.type === "expense" && t.method === linkedCard.method).reduce((s, t) => s + t.amount, 0) : 0;
  const availableBalance = account.balance - cardSpend;

  function payLabel(t) {
    if (t.method === "계좌") return "계좌";
    if (t.paymentType === "현금") return "현금";
    return t.cardKind || "카드";
  }

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "4px" }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>{linkedCard ? "사용 가능 잔액" : "잔액"}</span>
          <span style={{ fontSize: "18px", fontWeight: 700 }}>{won(availableBalance)}</span>
        </div>
        <div style={{ fontSize: "12px", color: C.inkSoft }}>
          {account.bank} · {account.type}
        </div>
        {linkedCard && (
          <div className="flex items-center justify-between" style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: "11px", color: C.inkMute }}>
              원 잔액 {won(account.balance)} - {linkedCard.name} 이번달 사용 {won(cardSpend)}
            </span>
          </div>
        )}
      </div>

      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700 }}>통장 정보</span>
          <button onClick={onEdit} style={{ fontSize: "12px", fontWeight: 700, color: C.accent }}>
            수정
          </button>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>계좌번호</span>
          <span style={{ fontSize: "13px", fontWeight: 600, fontFamily: "monospace" }}>{account.accountNumber}</span>
        </div>
        <div style={{ padding: "8px 0 2px" }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>메모</span>
          <div style={{ fontSize: "13px", marginTop: "4px", lineHeight: 1.5 }}>{account.note}</div>
        </div>
      </div>

      <div style={{ fontSize: "13px", fontWeight: 700, color: C.inkSoft, marginBottom: "8px" }}>이번 달 계좌 거래 내역</div>
      <div className="flex flex-col">
        {accountTx.map((t) => (
          <div key={t.id} className="flex items-center justify-between" style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: "13px", fontWeight: 600 }}>{t.memo}</span>
                <span style={{ fontSize: "10px", color: C.accent, background: C.accentSoft, padding: "1px 6px", borderRadius: "6px", fontWeight: 700 }}>{payLabel(t)}</span>
              </div>
              <div style={{ fontSize: "11px", color: C.inkMute }}>{t.date.slice(5)} · {t.category}</div>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: t.type === "income" ? C.accent : C.ink }}>
              {t.type === "income" ? "+" : "-"}
              {won(t.amount)}
            </span>
          </div>
        ))}
        {accountTx.length === 0 && <div style={{ textAlign: "center", color: C.inkMute, fontSize: "13px", padding: "24px 0" }}>이번 달 거래 내역이 없어요.</div>}
      </div>
    </div>
  );
}

function LoanDetailScreen({ loan, onPayoff, onEdit }) {
  if (!loan) return null;
  const months = ["04월", "05월", "06월", "07월"];
  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>대출 잔액</span>
          <span style={{ fontSize: "18px", fontWeight: 700 }}>{won(loan.balance)}</span>
        </div>
        <div style={{ fontSize: "12px", color: C.inkSoft }}>
          이자율 연 {loan.interestRate}% · 월 이자 {won(loan.monthlyInterest)}
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700 }}>대출 정보</span>
          <button onClick={onEdit} style={{ fontSize: "12px", fontWeight: 700, color: C.accent }}>
            수정
          </button>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>은행</span>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{loan.bank || "-"}</span>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>대출 시작일</span>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{loan.startDate}</span>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>만기일</span>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{loan.maturityDate || "-"}</span>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "6px 0" }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>대출금 상환일</span>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>매달 {loan.repayDay}일</span>
        </div>
      </div>

      <div style={{ fontSize: "13px", fontWeight: 700, color: C.inkSoft, marginBottom: "8px" }}>이자 납부 내역</div>
      <div style={{ marginBottom: "16px" }}>
        {loan.history
          .slice()
          .reverse()
          .map((amt, idx) => (
            <div key={idx} className="flex items-center justify-between" style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: "13px" }}>2026.{months[months.length - 1 - idx]}</span>
              <span style={{ fontSize: "13px" }}>{won(amt)}</span>
            </div>
          ))}
      </div>

      <button
        onClick={onPayoff}
        style={{ width: "100%", background: C.accentSoft, color: C.accent, borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: 700 }}
      >
        상환완료 처리
      </button>
    </div>
  );
}

function InstallmentsScreen({ installments, setView, setSelectedInstallment, onAddInstallment }) {
  const [mode, setMode] = useState("진행중");
  const monthTotal = installments.reduce((s, i) => s + i.monthlyAmount, 0);
  const monthLabels = ["4월", "5월", "6월", "7월"];
  const monthlyTotals = monthLabels.map((m, idx) => {
    const offsetFromNow = monthLabels.length - 1 - idx; // 0 = this month, 1 = last month, ...
    const total = installments.reduce((s, i) => (offsetFromNow < i.paid ? s + i.monthlyAmount : s), 0);
    return { m, total };
  });

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "12px", color: C.inkSoft, marginBottom: "4px" }}>이번 달 할부 결제 총액</div>
        <div style={{ fontSize: "20px", fontWeight: 700 }}>{won(monthTotal)}</div>
      </div>

      <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
        <div className="flex gap-1.5">
          {["진행중", "월별"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                fontSize: "12px",
                padding: "5px 12px",
                borderRadius: "14px",
                background: mode === m ? C.accent : "transparent",
                color: mode === m ? "#fff" : C.inkSoft,
                border: mode === m ? "none" : `1px solid ${C.border}`,
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <button onClick={onAddInstallment} style={{ fontSize: "12px", fontWeight: 700, color: C.accent }}>
          + 할부 등록
        </button>
      </div>

      {mode === "진행중" && (
        <>
          <div className="flex flex-col gap-2">
            {installments.map((i) => (
              <button
                key={i.id}
                onClick={() => {
                  setSelectedInstallment(i.id);
                  setView("installmentDetail");
                }}
                className="w-full text-left"
                style={{ background: C.card, borderRadius: "12px", padding: "12px", border: `1px solid ${C.border}` }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: "13px", fontWeight: 700 }}>{i.name}</span>
                      {i.interestFree && (
                        <span style={{ fontSize: "10px", color: C.accent, background: C.accentSoft, padding: "1px 6px", borderRadius: "6px", fontWeight: 700 }}>무이자</span>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: C.inkMute }}>
                      {i.card} · {i.total}개월 할부
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ fontSize: "14px", fontWeight: 700 }}>{won(i.monthlyAmount)}</div>
                    <span style={{ color: C.inkMute }}>›</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ flex: 1, height: "5px", background: C.bg, borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${(i.paid / i.total) * 100}%`, height: "100%", background: C.pBlue }} />
                  </div>
                  <span style={{ fontSize: "11px", color: C.inkSoft, whiteSpace: "nowrap" }}>
                    {i.paid}/{i.total}회
                  </span>
                </div>
              </button>
            ))}
          </div>
          {installments.length === 0 && (
            <div style={{ textAlign: "center", color: C.inkMute, fontSize: "13px", padding: "40px 0" }}>진행 중인 할부가 없어요.</div>
          )}
          <div style={{ fontSize: "11px", color: C.inkMute, marginTop: "10px" }}>할부가 끝나면 목록에서 자동으로 사라져요.</div>
        </>
      )}

      {mode === "월별" && (
        <div className="flex flex-col gap-2">
          {monthlyTotals.map((mt) => (
            <div key={mt.m} className="flex items-center justify-between" style={{ background: C.card, borderRadius: "12px", padding: "12px 14px", border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>{mt.m}</span>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>{won(mt.total)}</span>
            </div>
          ))}
          <div style={{ fontSize: "11px", color: C.inkMute, marginTop: "4px" }}>새로 등록한 할부는 결제한 회차 수만큼 최근 달부터 자동으로 반영돼요.</div>
        </div>
      )}
    </div>
  );
}

function InstallmentDetailScreen({ installment, onEdit }) {
  if (!installment) return null;
  const months = Array.from({ length: installment.total }, (_, i) => i + 1);

  function roundDateLabel(roundIdx) {
    if (!installment.firstPaymentDate) return null;
    return addMonthsToDateStr(installment.firstPaymentDate, roundIdx).slice(0, 7).replace("-", ".");
  }

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: "12px", color: C.inkSoft }}>회당 결제금액</span>
            {installment.interestFree && (
              <span style={{ fontSize: "10px", color: C.accent, background: C.accentSoft, padding: "1px 6px", borderRadius: "6px", fontWeight: 700 }}>무이자</span>
            )}
          </div>
          <button onClick={onEdit} style={{ fontSize: "12px", fontWeight: 700, color: C.accent }}>
            수정
          </button>
        </div>
        <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>{won(installment.monthlyAmount)}</div>
        <div style={{ fontSize: "12px", color: C.inkSoft }}>
          {installment.card} · 총 {won(installment.monthlyAmount * installment.total)} · {installment.total}개월 할부 · 매달 {installment.dueDay}일 결제
        </div>
        {installment.firstPaymentDate && (
          <div style={{ fontSize: "12px", color: C.inkSoft, marginTop: "4px" }}>최초 결제일 {installment.firstPaymentDate}</div>
        )}
      </div>

      <div style={{ fontSize: "13px", fontWeight: 700, color: C.inkSoft, marginBottom: "8px" }}>회차별 진행 현황</div>
      <div className="flex flex-col gap-1">
        {months.map((m) => {
          const isPaid = m <= installment.paid;
          const dateLabel = roundDateLabel(m - 1);
          return (
            <div key={m} className="flex items-center justify-between" style={{ padding: "8px 10px", borderRadius: "8px", background: isPaid ? C.accentSoft : C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: isPaid ? C.accent : C.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isPaid && <Check size={11} color="#fff" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  {m}회차{dateLabel ? ` · ${dateLabel}` : ""}
                </span>
              </div>
              <span style={{ fontSize: "12px", color: isPaid ? C.accent : C.inkMute, fontWeight: 600 }}>{isPaid ? "결제완료" : "결제예정"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Fixed expenses                                                */
/* ---------------------------------------------------------- */
function FixedScreen({ fixed, txAll, setView, setSelectedFixed, onToggleUnused, onAddFixed }) {
  const [mode, setMode] = useState("결제일순");
  const total = fixed.reduce((s, f) => s + f.amount, 0);

  const byCategory = useMemo(() => {
    const map = {};
    fixed.forEach((f) => {
      (map[f.category] = map[f.category] || []).push(f);
    });
    return map;
  }, [fixed]);

  const sorted = [...fixed].sort((a, b) => a.dueDay - b.dueDay);

  const Row = (f) => {
    const suspicious = f.lastUsedDays >= 60;
    const isSubscription = f.category === "OTT/스트리밍" || f.category === "기타 구독" || f.category === "구독비";
    return (
      <div
        key={f.id}
        style={{
          background: f.unusedChecked ? C.dangerSoft : suspicious ? C.dangerSoft : C.card,
          borderRadius: "12px",
          padding: "12px",
          border: `1px solid ${f.unusedChecked || suspicious ? C.danger + "33" : C.border}`,
        }}
      >
        <button
          onClick={() => {
            setSelectedFixed(f.id);
            setView("fixedDetail");
          }}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: C.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                color: C.inkSoft,
                fontWeight: 700,
              }}
            >
              {f.dueDay}일
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>{f.name}</div>
              <div style={{ fontSize: "11px", color: suspicious ? C.danger : C.inkMute }}>
                {mode === "결제일순" ? f.category : f.method} {suspicious ? `· ${f.lastUsedDays}일간 미사용` : ""}
              </div>
            </div>
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700 }}>{won(f.amount)}</div>
        </button>
        {isSubscription && mode === "미사용" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleUnused(f);
            }}
            className="flex items-center gap-1.5"
            style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${C.border}` }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "4px",
                border: `1.5px solid ${f.unusedChecked ? C.danger : C.inkMute}`,
                background: f.unusedChecked ? C.danger : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {f.unusedChecked && <Check size={11} color="#fff" strokeWidth={3} />}
            </div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: f.unusedChecked ? C.danger : C.inkSoft }}>미사용 중 체크</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div className="flex gap-1.5" style={{ marginBottom: "12px" }}>
        {["결제일순", "카테고리별", "월별", "미사용"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              fontSize: "12px",
              padding: "5px 12px",
              borderRadius: "14px",
              background: mode === m ? C.accent : "transparent",
              color: mode === m ? "#fff" : C.inkSoft,
              border: mode === m ? "none" : `1px solid ${C.border}`,
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between" style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "10px", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "12px", color: C.inkSoft }}>이번 달 총액 · {fixed.length}건</div>
        <div style={{ fontSize: "18px", fontWeight: 700 }}>{won(total)}</div>
      </div>

      <div className="flex justify-end" style={{ marginBottom: "10px" }}>
        <button onClick={onAddFixed} style={{ fontSize: "12px", fontWeight: 700, color: C.accent }}>
          + 고정지출 등록
        </button>
      </div>

      {mode === "결제일순" && <div className="flex flex-col gap-2">{sorted.map(Row)}</div>}

      {mode === "카테고리별" &&
        Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: "14px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>{cat}</span>
              <span style={{ fontSize: "12px", color: C.inkSoft }}>{won(items.reduce((s, f) => s + f.amount, 0))}</span>
            </div>
            <div className="flex flex-col gap-2">{items.map(Row)}</div>
          </div>
        ))}

      {mode === "월별" && <MonthlyFixedView fixed={fixed} txAll={txAll} />}

      {mode === "미사용" && (
        <div className="flex flex-col gap-2">
          {fixed.filter((f) => f.unusedChecked).map(Row)}
          {fixed.filter((f) => f.unusedChecked).length === 0 && (
            <div style={{ textAlign: "center", color: C.inkMute, fontSize: "13px", padding: "40px 0" }}>미사용으로 체크된 항목이 없어요.</div>
          )}
        </div>
      )}
    </div>
  );
}

function MonthlyFixedView({ fixed, txAll }) {
  const monthTotals = MONTHS.slice()
    .reverse()
    .map((m) => {
      const items = (txAll[m] || []).filter((t) => t.type === "expense" && t.recurring === "고정");
      return { m: m.slice(5) + "월", key: m, total: items.reduce((s, t) => s + t.amount, 0), items };
    });

  return (
    <div>
      <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>월별 고정지출 추이</div>
      <div style={{ height: "140px", marginBottom: "18px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthTotals}>
            <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.inkSoft }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => won(v)} contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="total" fill={C.accent} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>월별 내역</div>
      <div className="flex flex-col gap-2">
        {monthTotals
          .slice()
          .reverse()
          .map((mt) => (
            <div key={mt.key} style={{ background: C.card, borderRadius: "12px", padding: "12px", border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between" style={{ marginBottom: mt.items.length ? "6px" : 0 }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>{mt.m}</span>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>{won(mt.total)}</span>
              </div>
              <div className="flex flex-col gap-1">
                {mt.items.map((t) => (
                  <div key={t.id} className="flex items-center justify-between" style={{ fontSize: "11px", color: C.inkSoft }}>
                    <span>{t.memo}</span>
                    <span>{won(t.amount)}</span>
                  </div>
                ))}
                {mt.items.length === 0 && <div style={{ fontSize: "11px", color: C.inkMute }}>내역이 없어요.</div>}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function FixedDetailScreen({ fixed, txAll, onEdit }) {
  if (!fixed) return null;
  const monthlyHistory = MONTHS.slice()
    .reverse()
    .map((m) => {
      const items = (txAll[m] || []).filter((t) => t.memo === fixed.name && t.recurring === "고정");
      const amt = items.reduce((s, t) => s + t.amount, 0);
      return { m, amt };
    })
    .filter((h) => h.amt > 0);
  const cumulative = monthlyHistory.reduce((s, h) => s + h.amt, 0);

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "12px", border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>월 결제금액</span>
          <button onClick={onEdit} style={{ fontSize: "12px", fontWeight: 700, color: C.accent }}>
            수정
          </button>
        </div>
        <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>{won(fixed.amount)}</div>
        <div className="flex items-center justify-between" style={{ fontSize: "12px", color: C.inkSoft }}>
          <span>{fixed.category}</span>
          <span>
            {fixed.method} · 매달 {fixed.dueDay}일
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2" style={{ marginBottom: "14px" }}>
        <div style={{ background: C.card, borderRadius: "12px", padding: "10px", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "11px", color: C.inkSoft }}>누적 결제액</div>
          <div style={{ fontSize: "14px", fontWeight: 700 }}>{won(cumulative)}</div>
        </div>
        <div style={{ background: C.card, borderRadius: "12px", padding: "10px", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "11px", color: C.inkSoft }}>결제된 달 수</div>
          <div style={{ fontSize: "14px", fontWeight: 700 }}>{monthlyHistory.length}개월</div>
        </div>
      </div>

      <div style={{ fontSize: "13px", fontWeight: 700, color: C.inkSoft, marginBottom: "8px" }}>결제 내역</div>
      <div>
        {monthlyHistory.map((h) => (
          <div key={h.m} className="flex items-center justify-between" style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: "13px" }}>{h.m}.{String(fixed.dueDay).padStart(2, "0")}</span>
            <span style={{ fontSize: "13px" }}>{won(h.amt)}</span>
          </div>
        ))}
        {monthlyHistory.length === 0 && <div style={{ textAlign: "center", color: C.inkMute, fontSize: "13px", padding: "24px 0" }}>결제 내역이 없어요.</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Quick add sheet                                                */
/* ---------------------------------------------------------- */
function AddSheet({ onClose, onAdd, cards }) {
  const [form, setForm] = useState({
    date: "2026-07-28",
    type: "expense",
    category: "식비",
    recurring: "변동",
    paymentType: "카드",
    cardKind: "신용",
    cardIssuer: cards[0] ? cards[0].name : "",
    amount: "",
    discount: "",
    memo: "",
  });
  const catOptions = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return (
    <div
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 10, borderRadius: "24px", overflow: "hidden" }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, width: "100%", borderRadius: "16px 16px 0 0", padding: "16px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700 }}>거래 추가</span>
          <button onClick={onClose} style={{ color: C.inkSoft }}>
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={form.type}
              onChange={(e) => {
                const type = e.target.value;
                const opts = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
                setForm({ ...form, type, category: opts[0] });
              }}
              className="flex-1"
              style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
            >
              <option value="expense">지출</option>
              <option value="income">수입</option>
            </select>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="flex-1" style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
              {catOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            {["변동", "고정"].map((r) => (
              <button
                key={r}
                onClick={() => setForm({ ...form, recurring: r })}
                className="flex-1"
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: form.recurring === r ? C.accent : "transparent",
                  color: form.recurring === r ? "#fff" : C.inkSoft,
                  border: form.recurring === r ? "none" : `1px solid ${C.border}`,
                }}
              >
                {r}
              </button>
            ))}
          </div>
          {form.type === "expense" && (
            <div className="flex gap-2">
              {PAYMENT_TYPES.map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, paymentType: p })}
                  className="flex-1"
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    background: form.paymentType === p ? C.ink : "transparent",
                    color: form.paymentType === p ? "#fff" : C.inkSoft,
                    border: form.paymentType === p ? "none" : `1px solid ${C.border}`,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          {form.type === "expense" && form.paymentType === "카드" && (
            <div className="flex gap-2">
              <select value={form.cardKind} onChange={(e) => setForm({ ...form, cardKind: e.target.value })} className="flex-1" style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
                {CARD_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <select value={form.cardIssuer} onChange={(e) => setForm({ ...form, cardIssuer: e.target.value })} className="flex-1" style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
                {[...cards]
                  .sort((a, b) => a.name.localeCompare(b.name, "ko"))
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <input
            type="number"
            placeholder="금액"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          {form.type === "expense" && form.paymentType === "카드" && (
            <input
              type="number"
              placeholder="카드할인 (없으면 비워두세요)"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
            />
          )}
          <div
            className="flex items-center justify-between"
            style={{ background: C.accentSoft, borderRadius: "8px", padding: "8px 10px" }}
          >
            <span style={{ fontSize: "12px", color: C.inkSoft }}>최종금액 (금액 - 카드할인)</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.accent }}>
              {won(Math.max(0, (parseInt(form.amount, 10) || 0) - (parseInt(form.discount, 10) || 0)))}
            </span>
          </div>
          <input
            type="text"
            placeholder="메모"
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <button
            onClick={() => {
              if (!form.amount) return;
              const amount = parseInt(form.amount, 10);
              const discount = form.type === "expense" && form.paymentType === "카드" ? parseInt(form.discount, 10) || 0 : 0;
              const final = Math.max(0, amount - discount);
              const method = form.type === "income" ? "계좌" : form.paymentType === "현금" ? "현금" : form.cardIssuer;
              onAdd({ id: "t" + Date.now(), ...form, method, amount: final, originalAmount: amount, discount, memo: form.memo || "-" });
              onClose();
            }}
            style={{ background: C.accent, color: "#fff", borderRadius: "8px", padding: "10px", fontSize: "14px", fontWeight: 700, marginTop: "4px" }}
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}

const BANKS = ["국민은행", "신한은행", "우리은행", "하나은행", "농협은행", "기업은행", "카카오뱅크", "토스뱅크"].sort((a, b) => a.localeCompare(b, "ko"));

function CardFormSheet({ onClose, onAdd, onSave, editCard }) {
  const [form, setForm] = useState(
    editCard
      ? {
          name: editCard.name === editCard.issuer ? "" : editCard.name,
          issuer: editCard.issuer,
          kind: editCard.kind,
          dueDay: String(editCard.dueDay),
          cardNumber: editCard.cardNumber === "-" ? "" : editCard.cardNumber,
          expiryDate: editCard.expiryDate === "-" ? "" : editCard.expiryDate,
          benefits: editCard.benefits,
        }
      : { name: "", issuer: CARD_ISSUERS[0], kind: "신용", dueDay: "15", cardNumber: "", expiryDate: "", benefits: "" }
  );
  return (
    <div
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 10, borderRadius: "24px", overflow: "hidden" }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, width: "100%", borderRadius: "16px 16px 0 0", padding: "16px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700 }}>{editCard ? "카드 수정" : "카드 등록"}</span>
          <button onClick={onClose} style={{ color: C.inkSoft }}>
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} className="flex-1" style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
              {CARD_ISSUERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="flex-1" style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
              {CARD_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="카드 별칭 (예: 생활비 카드) - 비워두면 카드사명 사용"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <input
            type="number"
            placeholder="결제일 (1~31)"
            value={form.dueDay}
            onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <input
            type="text"
            placeholder="카드번호 (예: 1234-56**-****-7890)"
            value={form.cardNumber}
            onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <input
            type="text"
            placeholder="유효기간 (MM/YY)"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <input
            type="text"
            placeholder="혜택 (예: 카페 5% 적립)"
            value={form.benefits}
            onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <button
            onClick={() => {
              const name = form.name.trim() || form.issuer;
              const cardData = {
                id: editCard ? editCard.id : "c" + Date.now(),
                name,
                issuer: form.issuer,
                kind: form.kind,
                dueDay: parseInt(form.dueDay, 10) || 15,
                method: name,
                cardNumber: form.cardNumber || "-",
                expiryDate: form.expiryDate || "-",
                benefits: form.benefits || "등록된 혜택 정보가 없어요.",
              };
              if (editCard) onSave(cardData);
              else onAdd(cardData);
              onClose();
            }}
            style={{ background: C.accent, color: "#fff", borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: 700, marginTop: "4px" }}
          >
            {editCard ? "수정 저장하기" : "카드 등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountFormSheet({ cards, onClose, onAdd, onSave, editAccount }) {
  const [form, setForm] = useState(
    editAccount
      ? {
          name: editAccount.name,
          bank: editAccount.bank,
          type: editAccount.type,
          accountNumber: editAccount.accountNumber === "-" ? "" : editAccount.accountNumber,
          linkedCardId: editAccount.linkedCardId || "",
          balance: String(editAccount.balance),
        }
      : { name: "", bank: BANKS[0], type: "입출금", accountNumber: "", linkedCardId: "", balance: "" }
  );
  return (
    <div
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 10, borderRadius: "24px", overflow: "hidden" }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, width: "100%", borderRadius: "16px 16px 0 0", padding: "16px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700 }}>{editAccount ? "통장 수정" : "통장 등록"}</span>
          <button onClick={onClose} style={{ color: C.inkSoft }}>
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <select value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
            {BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="통장 이름 (예: 주거래 통장)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <input
            type="text"
            placeholder="계좌번호"
            value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <select value={form.linkedCardId} onChange={(e) => setForm({ ...form, linkedCardId: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
            <option value="">연결된 카드 없음</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="현재 잔액"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <button
            onClick={() => {
              if (!form.name.trim()) return;
              const linkedCard = cards.find((c) => c.id === form.linkedCardId);
              const accountData = {
                id: editAccount ? editAccount.id : "ac" + Date.now(),
                name: form.name.trim(),
                bank: form.bank,
                type: form.type,
                accountNumber: form.accountNumber || "-",
                balance: parseInt(form.balance, 10) || 0,
                linkedCardId: form.linkedCardId || null,
                note: linkedCard ? `연결된 카드: ${linkedCard.name}` : "연결된 카드 없음",
              };
              if (editAccount) onSave(accountData);
              else onAdd(accountData);
              onClose();
            }}
            style={{ background: C.accent, color: "#fff", borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: 700, marginTop: "4px" }}
          >
            {editAccount ? "수정 저장하기" : "통장 등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FixedFormSheet({ cards, onClose, onAdd, onSave, editFixed }) {
  const methodOptions = ["계좌", "현금", ...cards.map((c) => c.name)];
  const [form, setForm] = useState(
    editFixed
      ? {
          name: editFixed.name,
          category: editFixed.category,
          amount: String(editFixed.amount),
          dueDay: String(editFixed.dueDay),
          method: editFixed.method,
        }
      : { name: "", category: EXPENSE_CATEGORIES[0], amount: "", dueDay: "15", method: methodOptions[0] }
  );
  const [error, setError] = useState("");

  return (
    <div
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 10, borderRadius: "24px", overflow: "hidden" }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, width: "100%", borderRadius: "16px 16px 0 0", padding: "16px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700 }}>{editFixed ? "고정지출 수정" : "고정지출 등록"}</span>
          <button onClick={onClose} style={{ color: C.inkSoft }}>
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="이름 (예: 넷플릭스)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="금액"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <input
            type="number"
            placeholder="결제일 (매달 며칠, 1~31)"
            value={form.dueDay}
            onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
            {methodOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {!editFixed && (
            <div style={{ fontSize: "11px", color: C.inkMute }}>등록하면 매달 결제일에 맞춰 거래내역에 자동으로 반영돼요.</div>
          )}
          {error && (
            <div style={{ fontSize: "12px", color: C.danger, fontWeight: 700, background: C.dangerSoft, borderRadius: "8px", padding: "8px 10px" }}>
              {error}
            </div>
          )}
          <button
            onClick={() => {
              try {
                if (!form.name.trim()) {
                  setError("이름을 입력해주세요.");
                  return;
                }
                if (!form.amount || parseInt(form.amount, 10) <= 0) {
                  setError("금액을 입력해주세요.");
                  return;
                }
                setError("");
                const fixedData = {
                  id: editFixed ? editFixed.id : "f" + Date.now(),
                  name: form.name.trim(),
                  category: form.category,
                  amount: parseInt(form.amount, 10) || 0,
                  dueDay: parseInt(form.dueDay, 10) || 15,
                  method: form.method,
                  lastUsedDays: editFixed ? editFixed.lastUsedDays : 0,
                  unusedChecked: editFixed ? editFixed.unusedChecked : false,
                  history: editFixed ? editFixed.history : [],
                };
                if (editFixed) onSave(fixedData);
                else onAdd(fixedData);
                onClose();
              } catch (e) {
                setError("등록 중 문제가 생겼어요: " + e.message);
              }
            }}
            style={{ background: C.accent, color: "#fff", borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: 700, marginTop: "4px" }}
          >
            {editFixed ? "수정 저장하기" : "고정지출 등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoanFormSheet({ onClose, onAdd, onSave, editLoan }) {
  const [form, setForm] = useState(
    editLoan
      ? {
          name: editLoan.name,
          bank: editLoan.bank || BANKS[0],
          balance: String(editLoan.balance),
          interestRate: String(editLoan.interestRate),
          startDate: editLoan.startDate,
          maturityDate: editLoan.maturityDate || "",
          repayDay: String(editLoan.repayDay),
        }
      : { name: "", bank: BANKS[0], balance: "", interestRate: "", startDate: "2026-01-01", maturityDate: "", repayDay: "15" }
  );
  const [error, setError] = useState("");
  const balanceNum = parseInt(form.balance, 10) || 0;
  const rateNum = parseFloat(form.interestRate) || 0;
  const monthlyInterest = Math.round((balanceNum * (rateNum / 100)) / 12);

  return (
    <div
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 10, borderRadius: "24px", overflow: "hidden" }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, width: "100%", borderRadius: "16px 16px 0 0", padding: "16px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700 }}>{editLoan ? "대출 수정" : "대출 등록"}</span>
          <button onClick={onClose} style={{ color: C.inkSoft }}>
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="대출 이름 (예: 전세자금대출)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <select value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
            {BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="대출 잔액"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <input
            type="number"
            placeholder="이자율 (연 %, 예: 3.5)"
            value={form.interestRate}
            onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <div>
            <div style={{ fontSize: "11px", color: C.inkMute, marginBottom: "4px" }}>대출 시작일</div>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px", width: "100%" }}
            />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: C.inkMute, marginBottom: "4px" }}>만기일</div>
            <input
              type="date"
              value={form.maturityDate}
              onChange={(e) => setForm({ ...form, maturityDate: e.target.value })}
              style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px", width: "100%" }}
            />
          </div>
          <input
            type="number"
            placeholder="대출금 상환일 (매달 며칠, 1~31)"
            value={form.repayDay}
            onChange={(e) => setForm({ ...form, repayDay: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <div className="flex items-center justify-between" style={{ background: C.accentSoft, borderRadius: "8px", padding: "8px 10px" }}>
            <span style={{ fontSize: "12px", color: C.inkSoft }}>예상 월 이자</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.accent }}>{won(monthlyInterest)}</span>
          </div>
          {!editLoan && (
            <div style={{ fontSize: "11px", color: C.inkMute }}>등록하면 상환일에 맞춰 현금 지출로 거래내역에 자동으로 반영돼요.</div>
          )}
          {editLoan && (
            <div style={{ fontSize: "11px", color: C.inkMute }}>저장하면 이번 달까지의 이자 내역도 새 금액으로 다시 계산돼요.</div>
          )}
          {error && <div style={{ fontSize: "12px", color: C.danger, fontWeight: 700, background: C.dangerSoft, borderRadius: "8px", padding: "8px 10px" }}>{error}</div>}
          <button
            onClick={() => {
              try {
                if (!form.name.trim()) {
                  setError("대출 이름을 입력해주세요.");
                  return;
                }
                if (!form.balance || balanceNum <= 0) {
                  setError("대출 잔액을 입력해주세요.");
                  return;
                }
                setError("");
                const repayDay = parseInt(form.repayDay, 10) || 15;
                const loanData = {
                  id: editLoan ? editLoan.id : "l" + Date.now(),
                  name: form.name.trim(),
                  bank: form.bank,
                  balance: balanceNum,
                  interestRate: rateNum,
                  monthlyInterest,
                  startDate: form.startDate,
                  maturityDate: form.maturityDate || "",
                  repayDay,
                  history: [monthlyInterest, monthlyInterest, monthlyInterest, monthlyInterest],
                };
                if (editLoan) onSave(loanData);
                else onAdd(loanData);
                onClose();
              } catch (e) {
                setError("저장 중 문제가 생겼어요: " + e.message);
              }
            }}
            style={{ background: C.accent, color: "#fff", borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: 700, marginTop: "4px" }}
          >
            {editLoan ? "수정 저장하기" : "대출 등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InstallmentFormSheet({ cards, onClose, onAdd, onSave, editInstallment }) {
  const [form, setForm] = useState(
    editInstallment
      ? {
          name: editInstallment.name,
          cardId: editInstallment.cardId || (cards[0] ? cards[0].id : ""),
          totalAmount: String(editInstallment.monthlyAmount * editInstallment.total),
          total: String(editInstallment.total),
          firstPaymentDate: editInstallment.firstPaymentDate || "2026-07-01",
          interestFree: !!editInstallment.interestFree,
        }
      : { name: "", cardId: cards[0] ? cards[0].id : "", totalAmount: "", total: "3", firstPaymentDate: "2026-07-01", interestFree: false }
  );
  const totalAmountNum = parseInt(form.totalAmount, 10) || 0;
  const totalNum = parseInt(form.total, 10) || 1;
  const monthlyAmount = Math.round(totalAmountNum / totalNum);
  const dueDay = parseInt(form.firstPaymentDate.split("-")[2], 10) || 1;

  let paidNum = 0;
  for (let k = 0; k < totalNum; k++) {
    if (addMonthsToDateStr(form.firstPaymentDate, k) <= TODAY) paidNum++;
  }

  return (
    <div
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 10, borderRadius: "24px", overflow: "hidden" }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, width: "100%", borderRadius: "16px 16px 0 0", padding: "16px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700 }}>{editInstallment ? "할부 수정" : "할부 등록"}</span>
          <button onClick={onClose} style={{ color: C.inkSoft }}>
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="할부 항목 이름 (예: 노트북)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <select value={form.cardId} onChange={(e) => setForm({ ...form, cardId: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="총 할부 금액"
            value={form.totalAmount}
            onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <input
            type="number"
            placeholder="총 개월수"
            value={form.total}
            onChange={(e) => setForm({ ...form, total: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <div>
            <div style={{ fontSize: "11px", color: C.inkMute, marginBottom: "4px" }}>최초 결제일 (이 날짜가 1회차예요)</div>
            <input
              type="date"
              value={form.firstPaymentDate}
              onChange={(e) => setForm({ ...form, firstPaymentDate: e.target.value })}
              style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px", width: "100%" }}
            />
          </div>
          <button
            onClick={() => setForm({ ...form, interestFree: !form.interestFree })}
            className="flex items-center gap-2"
            style={{ padding: "8px 2px" }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "4px",
                border: `1.5px solid ${form.interestFree ? C.accent : C.inkMute}`,
                background: form.interestFree ? C.accent : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {form.interestFree && <Check size={12} color="#fff" strokeWidth={3} />}
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: form.interestFree ? C.accent : C.inkSoft }}>무이자 할부</span>
          </button>
          <div className="flex items-center justify-between" style={{ background: C.accentSoft, borderRadius: "8px", padding: "8px 10px" }}>
            <span style={{ fontSize: "12px", color: C.inkSoft }}>회당 결제금액 · 매달 {dueDay}일</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.accent }}>{won(monthlyAmount)}</span>
          </div>
          <div className="flex items-center justify-between" style={{ background: C.accentSoft, borderRadius: "8px", padding: "8px 10px" }}>
            <span style={{ fontSize: "12px", color: C.inkSoft }}>현재까지 결제 회차 (자동 계산)</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.accent }}>
              {paidNum}/{totalNum}회
            </span>
          </div>
          {!editInstallment && (
            <div style={{ fontSize: "11px", color: C.inkMute }}>등록하면 최초 결제일부터 오늘까지의 회차가 거래내역에 자동으로 반영돼요.</div>
          )}
          <button
            onClick={() => {
              if (!form.name.trim() || !form.totalAmount) return;
              const card = cards.find((c) => c.id === form.cardId);
              const installmentData = {
                id: editInstallment ? editInstallment.id : "i" + Date.now(),
                name: form.name.trim(),
                card: card ? card.name : "",
                cardId: form.cardId,
                total: totalNum,
                paid: paidNum,
                monthlyAmount,
                firstPaymentDate: form.firstPaymentDate,
                dueDay,
                interestFree: form.interestFree,
              };
              if (editInstallment) onSave(installmentData);
              else onAdd(installmentData);
              onClose();
            }}
            style={{ background: C.accent, color: "#fff", borderRadius: "12px", padding: "12px", fontSize: "15px", fontWeight: 700, marginTop: "4px" }}
          >
            {editInstallment ? "수정 저장하기" : "할부 등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* App shell                                                     */
/* ---------------------------------------------------------- */
export default function BudgetAppPrototype() {
  const [tab, setTab] = useState("home");
  const [view, setView] = useState("home");
  const [month, setMonth] = useState("2026-07");
  const [txAll, setTxAll] = useState(txByMonth);
  const [fixed, setFixed] = useState(initialFixed);
  const [cards, setCards] = useState(cardsSeed);
  const [accounts, setAccounts] = useState(accountsSeed);
  const [loans, setLoans] = useState(loansSeed);
  const [installments, setInstallments] = useState(installmentsSeed);
  const [selectedFixedId, setSelectedFixedId] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState(null);
  const [txFilter, setTxFilter] = useState("전체");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showAddInstallment, setShowAddInstallment] = useState(false);
  const [showAddFixed, setShowAddFixed] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingLoan, setEditingLoan] = useState(null);
  const [editingInstallment, setEditingInstallment] = useState(null);
  const [editingFixed, setEditingFixed] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 앱을 처음 열 때 저장된 데이터 불러오기
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem("app-data");
        const result = raw ? { value: raw } : null;
        if (!cancelled && result && result.value) {
          const saved = JSON.parse(result.value);
          if (saved.txAll) setTxAll(saved.txAll);
          if (saved.fixed) setFixed(saved.fixed);
          if (saved.cards) setCards(saved.cards);
          if (saved.accounts) setAccounts(saved.accounts);
          if (saved.loans) setLoans(saved.loans);
          if (saved.installments) setInstallments(saved.installments);
        }
      } catch (e) {
        // 저장된 데이터가 아직 없으면 기본 예시 데이터로 시작
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 데이터가 바뀔 때마다 저장 (초기 로딩 이후에만)
  useEffect(() => {
    if (!loaded) return;
    setSaveState("saving");
    const timer = setTimeout(async () => {
      try {
        const payload = JSON.stringify({ txAll, fixed, cards, accounts, loans, installments });
        localStorage.setItem("app-data", payload);
        setSaveState("saved");
      } catch (e) {
        setSaveState("error");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [loaded, txAll, fixed, cards, accounts, loans, installments]);

  const tx = txAll[month] || [];
  function setTx(updater) {
    setTxAll((prev) => ({ ...prev, [month]: typeof updater === "function" ? updater(prev[month] || []) : updater }));
  }

  function goTab(t) {
    setTab(t);
    setView(t);
  }
  function goTransactions(filter) {
    setTxFilter(filter);
    setTab("transactions");
    setView("transactions");
  }
  function goMonth(m) {
    setMonth(m);
  }

  async function resetAllData() {
    try {
      localStorage.removeItem("app-data");
    } catch (e) {
      // 저장된 데이터가 없었을 수도 있음
    }
    setTxAll({ "2026-07": [], "2026-06": [], "2026-05": [], "2026-04": [] });
    setFixed([]);
    setCards([]);
    setAccounts([]);
    setLoans([]);
    setInstallments([]);
    setShowResetConfirm(false);
  }

  function addTxToMonth(monthKey, txObj) {
    setTxAll((prev) => ({ ...prev, [monthKey]: [txObj, ...(prev[monthKey] || [])] }));
  }

  function addLoanWithTx(loan) {
    setLoans((prev) => [...prev, loan]);
    const pad = (n) => String(n).padStart(2, "0");
    MONTHS.forEach((m) => {
      addTxToMonth(m, {
        id: "l" + loan.id + "-" + m,
        date: `${m}-${pad(loan.repayDay)}`,
        type: "expense",
        category: "금융·보험",
        recurring: "고정",
        paymentType: "현금",
        method: "현금",
        amount: loan.monthlyInterest,
        memo: `${loan.name} 이자상환`,
      });
    });
  }

  function updateLoanWithTx(loan) {
    setLoans((prev) => prev.map((l) => (l.id === loan.id ? loan : l)));
    const pad = (n) => String(n).padStart(2, "0");
    setTxAll((prev) => {
      const updated = { ...prev };
      MONTHS.forEach((m) => {
        const txId = "l" + loan.id + "-" + m;
        const newTx = {
          id: txId,
          date: `${m}-${pad(loan.repayDay)}`,
          type: "expense",
          category: "금융·보험",
          recurring: "고정",
          paymentType: "현금",
          method: "현금",
          amount: loan.monthlyInterest,
          memo: `${loan.name} 이자상환`,
        };
        const monthItems = updated[m] || [];
        const exists = monthItems.some((t) => t.id === txId);
        updated[m] = exists ? monthItems.map((t) => (t.id === txId ? newTx : t)) : [newTx, ...monthItems];
      });
      return updated;
    });
  }

  function addInstallmentWithTx(installment) {
    setInstallments((prev) => [...prev, installment]);
    const card = cards.find((c) => c.id === installment.cardId);
    for (let k = 0; k < installment.paid; k++) {
      const roundDate = addMonthsToDateStr(installment.firstPaymentDate, k);
      const monthKey = roundDate.slice(0, 7);
      if (!MONTHS.includes(monthKey)) continue; // 추적 범위(4~7월) 밖이면 생략
      addTxToMonth(monthKey, {
        id: "i" + installment.id + "-" + monthKey,
        date: roundDate,
        type: "expense",
        category: "생활",
        recurring: "변동",
        paymentType: "카드",
        cardKind: card ? card.kind : "신용",
        method: installment.card,
        amount: installment.monthlyAmount,
        memo: `${installment.name} 할부 ${k + 1}회차${installment.interestFree ? " (무이자)" : ""}`,
      });
    }
  }

  function fixedTxObj(item, monthKey) {
    const pad = (n) => String(n).padStart(2, "0");
    return {
      id: "fx" + item.id + "-" + monthKey,
      date: `${monthKey}-${pad(item.dueDay)}`,
      type: "expense",
      category: item.category,
      recurring: "고정",
      paymentType: item.method === "현금" ? "현금" : item.method === "계좌" ? "계좌" : "카드",
      method: item.method,
      amount: item.amount,
      memo: item.name,
    };
  }

  function addFixedWithTx(item) {
    setFixed((prev) => [...prev, item]);
    MONTHS.forEach((m) => addTxToMonth(m, fixedTxObj(item, m)));
  }

  function toggleFixedUnused(item) {
    const newChecked = !item.unusedChecked;
    setFixed((prev) => prev.map((f) => (f.id === item.id ? { ...f, unusedChecked: newChecked } : f)));
    if (newChecked) {
      setTxAll((prev) => {
        const updated = { ...prev };
        updated[month] = (updated[month] || []).filter((t) => t.id !== "fx" + item.id + "-" + month);
        return updated;
      });
    } else {
      setTxAll((prev) => {
        const updated = { ...prev };
        const already = (updated[month] || []).some((t) => t.id === "fx" + item.id + "-" + month);
        if (!already) updated[month] = [fixedTxObj(item, month), ...(updated[month] || [])];
        return updated;
      });
    }
  }

  const selectedFixed = fixed.find((f) => f.id === selectedFixedId);
  const selectedCard = cards.find((c) => c.id === selectedCardId);
  const selectedLoan = loans.find((l) => l.id === selectedLoanId);
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedInstallment = installments.find((i) => i.id === selectedInstallmentId);

  if (!loaded) {
    return (
      <div
        style={{
          maxWidth: "380px",
          margin: "0 auto",
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "20px",
          fontFamily: "'Pretendard', system-ui, -apple-system, sans-serif",
        }}
      >
        <style>{`@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');`}</style>
        <div style={{ color: C.inkSoft, fontSize: "13px" }}>불러오는 중...</div>
      </div>
    );
  }

  let screen;
  let title = "";
  let onBack = null;

  if (view === "home") {
    title = "";
    screen = (
      <HomeScreen
        tx={tx}
        txAll={txAll}
        month={month}
        cards={cards}
        loans={loans}
        goTransactions={goTransactions}
        goCards={() => goTab("cards")}
        saveState={saveState}
        onReset={() => setShowResetConfirm(true)}
      />
    );
  } else if (view === "transactions") {
    title = "내역";
    screen = <TransactionsScreen tx={tx} setTx={setTx} filter={txFilter} setFilter={setTxFilter} txAll={txAll} goMonth={goMonth} month={month} setMonth={setMonth} />;
  } else if (view === "cards") {
    title = "카드 · 통장";
    screen = (
      <CardsScreen
        tx={tx}
        cards={cards}
        loans={loans}
        accounts={accounts}
        installments={installments}
        setView={setView}
      />
    );
  } else if (view === "allCards") {
    title = "전체 카드 내역";
    onBack = () => setView("cards");
    screen = (
      <AllCardsHistoryScreen
        tx={tx}
        cards={cards}
        setView={setView}
        setSelectedCard={setSelectedCardId}
        onAddCard={() => {
          setEditingCard(null);
          setShowAddCard(true);
        }}
      />
    );
  } else if (view === "allAccounts") {
    title = "전체 통장 내역";
    onBack = () => setView("cards");
    screen = (
      <AllAccountsHistoryScreen
        accounts={accounts}
        cards={cards}
        tx={tx}
        setView={setView}
        setSelectedAccount={setSelectedAccountId}
        onAddAccount={() => {
          setEditingAccount(null);
          setShowAddAccount(true);
        }}
      />
    );
  } else if (view === "loansList") {
    title = "대출 내역";
    onBack = () => setView("cards");
    screen = <LoansListScreen loans={loans} setView={setView} setSelectedLoan={setSelectedLoanId} onAddLoan={() => setShowAddLoan(true)} />;
  } else if (view === "cardDetail") {
    title = selectedCard ? selectedCard.name : "카드 상세";
    onBack = () => setView("allCards");
    screen = (
      <CardDetailScreen
        card={selectedCard}
        tx={tx}
        txAll={txAll}
        onEdit={() => {
          setEditingCard(selectedCard);
          setShowAddCard(true);
        }}
      />
    );
  } else if (view === "loanDetail") {
    title = selectedLoan ? selectedLoan.name : "대출 상세";
    onBack = () => setView("loansList");
    screen = (
      <LoanDetailScreen
        loan={selectedLoan}
        onPayoff={() => {
          setLoans((prev) => prev.filter((l) => l.id !== selectedLoanId));
          setView("loansList");
        }}
        onEdit={() => {
          setEditingLoan(selectedLoan);
          setShowAddLoan(true);
        }}
      />
    );
  } else if (view === "accountDetail") {
    title = selectedAccount ? selectedAccount.name : "통장 상세";
    onBack = () => setView("allAccounts");
    screen = (
      <AccountDetailScreen
        account={selectedAccount}
        tx={tx}
        cards={cards}
        onEdit={() => {
          setEditingAccount(selectedAccount);
          setShowAddAccount(true);
        }}
      />
    );
  } else if (view === "installments") {
    title = "할부 내역";
    onBack = () => setView("cards");
    screen = <InstallmentsScreen installments={installments} setView={setView} setSelectedInstallment={setSelectedInstallmentId} onAddInstallment={() => setShowAddInstallment(true)} />;
  } else if (view === "installmentDetail") {
    title = selectedInstallment ? selectedInstallment.name : "할부 상세";
    onBack = () => setView("installments");
    screen = (
      <InstallmentDetailScreen
        installment={selectedInstallment}
        onEdit={() => {
          setEditingInstallment(selectedInstallment);
          setShowAddInstallment(true);
        }}
      />
    );
  } else if (view === "fixed") {
    title = "고정지출";
    screen = (
      <FixedScreen
        fixed={fixed}
        txAll={txAll}
        setView={setView}
        setSelectedFixed={setSelectedFixedId}
        onToggleUnused={toggleFixedUnused}
        onAddFixed={() => {
          setEditingFixed(null);
          setShowAddFixed(true);
        }}
      />
    );
  } else if (view === "fixedDetail") {
    title = selectedFixed ? selectedFixed.name : "상세";
    onBack = () => setView("fixed");
    screen = (
      <FixedDetailScreen
        fixed={selectedFixed}
        txAll={txAll}
        onEdit={() => {
          setEditingFixed(selectedFixed);
          setShowAddFixed(true);
        }}
      />
    );
  }

  return (
    <div
      style={{
        maxWidth: "380px",
        margin: "0 auto",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "20px",
        fontFamily: "'Pretendard', system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');`}</style>
      <div style={{ background: C.bg, borderRadius: "20px", overflow: "hidden", position: "relative", minHeight: "600px", display: "flex", flexDirection: "column" }}>
        <Header
          tabKey={tab}
          title={title}
          onBack={onBack}
          month={month}
          setMonth={setMonth}
          right={
            view === "transactions" ? (
              <Search size={18} color="#fff" />
            ) : view === "fixed" ? (
              <SlidersHorizontal size={18} color="#fff" />
            ) : null
          }
        />
        <div style={{ flex: 1, overflowY: "auto" }}>{screen}</div>
        <BottomNav tab={tab} setTab={goTab} onAdd={() => setShowAdd(true)} />
        {showAdd && (
          <AddSheet
            cards={cards}
            onClose={() => setShowAdd(false)}
            onAdd={(newTx) => {
              setTx((prev) => [newTx, ...prev]);
              setFixed((prev) =>
                prev.map((f) => (f.name === newTx.memo && f.unusedChecked ? { ...f, unusedChecked: false, lastUsedDays: 0 } : f))
              );
            }}
          />
        )}
        {showAddCard && (
          <CardFormSheet
            editCard={editingCard}
            onClose={() => {
              setShowAddCard(false);
              setEditingCard(null);
            }}
            onAdd={(newCard) => setCards((prev) => [...prev, newCard])}
            onSave={(updatedCard) => setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)))}
          />
        )}
        {showAddAccount && (
          <AccountFormSheet
            cards={cards}
            editAccount={editingAccount}
            onClose={() => {
              setShowAddAccount(false);
              setEditingAccount(null);
            }}
            onAdd={(newAccount) => setAccounts((prev) => [...prev, newAccount])}
            onSave={(updatedAccount) => setAccounts((prev) => prev.map((a) => (a.id === updatedAccount.id ? updatedAccount : a)))}
          />
        )}
        {showAddLoan && (
          <LoanFormSheet
            editLoan={editingLoan}
            onClose={() => {
              setShowAddLoan(false);
              setEditingLoan(null);
            }}
            onAdd={addLoanWithTx}
            onSave={updateLoanWithTx}
          />
        )}
        {showAddInstallment && (
          <InstallmentFormSheet
            cards={cards}
            editInstallment={editingInstallment}
            onClose={() => {
              setShowAddInstallment(false);
              setEditingInstallment(null);
            }}
            onAdd={addInstallmentWithTx}
            onSave={(updatedInstallment) => setInstallments((prev) => prev.map((i) => (i.id === updatedInstallment.id ? updatedInstallment : i)))}
          />
        )}
        {showAddFixed && (
          <FixedFormSheet
            cards={cards}
            editFixed={editingFixed}
            onClose={() => {
              setShowAddFixed(false);
              setEditingFixed(null);
            }}
            onAdd={addFixedWithTx}
            onSave={(updatedFixed) => setFixed((prev) => prev.map((f) => (f.id === updatedFixed.id ? updatedFixed : f)))}
          />
        )}
        {showResetConfirm && (
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, borderRadius: "20px" }}
            onClick={() => setShowResetConfirm(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: C.card, borderRadius: "16px", padding: "20px", width: "85%", textAlign: "center" }}
            >
              <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>데이터를 모두 지울까요?</div>
              <div style={{ fontSize: "13px", color: C.inkSoft, marginBottom: "18px" }}>거래내역, 카드, 통장, 대출, 할부가 전부 삭제되고 이 작업은 되돌릴 수 없어요.</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: `1px solid ${C.border}`, fontSize: "14px", fontWeight: 600, color: C.inkSoft }}
                >
                  취소
                </button>
                <button
                  onClick={resetAllData}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: C.danger, color: "#fff", fontSize: "14px", fontWeight: 700 }}
                >
                  전부 삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
