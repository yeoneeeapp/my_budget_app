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
  Users,
  ArrowRightLeft,
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

const EXPENSE_CATEGORIES = ["식비", "배달", "자동차", "교통", "카페", "생활", "문화·여가", "주거·통신", "의복·미용", "데이트", "금융·보험", "구독비", "운동", "의료", "선물", "가족"].sort((a, b) => a.localeCompare(b, "ko"));
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
  선물: GREEN_RAMP[2],
  가족: GREEN_RAMP[3],
  이체: GREEN_RAMP[4],
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
  선물: Gift,
  가족: Users,
  이체: ArrowRightLeft,
};

const won = (n) => Math.round(Math.abs(n)).toLocaleString("ko-KR") + "원";
const wonSigned = (n) => (n < 0 ? "-" : "") + won(n);

function formatNum(v) {
  const negative = String(v).trim().startsWith("-");
  const digits = String(v).replace(/[^\d]/g, "");
  if (!digits) return negative ? "-" : "";
  return (negative ? "-" : "") + parseInt(digits, 10).toLocaleString("ko-KR");
}
function unformatNum(v) {
  const negative = String(v).trim().startsWith("-");
  const digits = String(v).replace(/[^\d]/g, "");
  if (!digits) return negative ? "-" : "";
  return (negative ? "-" : "") + digits;
}
function AmountInput({ value, onChange, placeholder, style }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={formatNum(value)}
      onChange={(e) => onChange(unformatNum(e.target.value))}
      style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px", ...style }}
    />
  );
}

const pad2 = (n) => String(n).padStart(2, "0");
function realDateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function realMonthKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}
const NOW = new Date();
const TODAY = realDateStr(NOW);
const CURRENT_MONTH = realMonthKey(NOW);
const START_MONTH = "2026-07"; // 가계부를 시작한 달 — 이 달부터 내역이 보여요

function addMonthsToDateStr(dateStr, k) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const totalMonths = y * 12 + (m - 1) + k;
  const ny = Math.floor(totalMonths / 12);
  const nm = (totalMonths % 12) + 1;
  const daysInMonth = new Date(ny, nm, 0).getDate();
  const nd = Math.min(d, daysInMonth);
  return `${ny}-${pad2(nm)}-${pad2(nd)}`;
}

function monthsBetween(aKey, bKey) {
  const [ay, am] = aKey.slice(0, 7).split("-").map(Number);
  const [by, bm] = bKey.slice(0, 7).split("-").map(Number);
  return by * 12 + bm - (ay * 12 + am);
}

function loanTermMonths(loan) {
  if (!loan.maturityDate) return null;
  const t = monthsBetween(loan.startDate, loan.maturityDate);
  return t > 0 ? t : null;
}

// 상환방식에 따라 특정 달(monthKey)에 내야 하는 이자를 대략적으로 계산해요.
// (대출 시작 다음 달부터 이자가 발생한다고 가정)
function loanInterestForMonth(loan, monthKey) {
  const elapsed = monthsBetween(loan.startDate, monthKey);
  if (elapsed < 1) return 0;
  const rate = (loan.interestRate || 0) / 100 / 12;
  const term = loanTermMonths(loan);

  if (loan.repaymentType === "원금균등상환" && term) {
    const principalPerMonth = loan.balance / term;
    const remaining = Math.max(0, loan.balance - principalPerMonth * (elapsed - 1));
    return Math.round(remaining * rate);
  }
  if (loan.repaymentType === "원리금균등상환" && term && rate > 0) {
    const n = term;
    const growth = Math.pow(1 + rate, n);
    const paidGrowth = Math.pow(1 + rate, elapsed - 1);
    const remaining = Math.max(0, (loan.balance * (growth - paidGrowth)) / (growth - 1));
    return Math.round(remaining * rate);
  }
  // 만기일시상환(원금은 만기에 한번에), 또는 상환방식 미지정 시: 매달 원금 전체에 대한 이자
  return Math.round(loan.balance * rate);
}

function buildMonthsRange(startKey, endKey) {
  const [sy, sm] = startKey.split("-").map(Number);
  const [ey, em] = endKey.split("-").map(Number);
  const startTotal = sy * 12 + (sm - 1);
  const endTotal = ey * 12 + (em - 1);
  const lo = Math.min(startTotal, endTotal);
  const hi = Math.max(startTotal, endTotal);
  const arr = [];
  for (let t = hi; t >= lo; t--) {
    arr.push(`${Math.floor(t / 12)}-${pad2((t % 12) + 1)}`);
  }
  return arr;
}

function addMonthsToMonthKey(monthKey, k) {
  const [y, m] = monthKey.split("-").map(Number);
  const total = y * 12 + (m - 1) + k;
  return `${Math.floor(total / 12)}-${pad2((total % 12) + 1)}`;
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
const FUTURE_MONTHS_AHEAD = 12; // 현재 달 기준 앞으로 12개월까지 미리 넘겨볼 수 있어요
const MONTHS = buildMonthsRange(START_MONTH, addMonthsToMonthKey(CURRENT_MONTH, FUTURE_MONTHS_AHEAD)); // 최신(미래) 달이 맨 앞 (내림차순), 7월 이전은 존재하지 않음

const txByMonth = {};
MONTHS.forEach((m) => {
  txByMonth[m] = [];
});

const initialFixed = [];

const cardsSeed = [];

const CARD_ISSUERS = ["삼성카드", "우리카드", "신한카드", "현대카드", "국민카드"].sort((a, b) => a.localeCompare(b, "ko"));
const PAYMENT_TYPES = ["카드", "현금"];
const CARD_KINDS = ["신용", "체크"];

const accountsSeed = [];
const ACCOUNT_TYPES = ["입출금", "예금", "적금", "기타"];

const loansSeed = [];
const REPAYMENT_TYPES = ["원리금균등상환", "원금균등상환", "만기일시상환", "기타"];

const installmentsSeed = [];

function buildMonthLabel(monthKey) {
  const [y, m] = monthKey.split("-");
  return `${y}년 ${parseInt(m, 10)}월`;
}
function buildMonthRange(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  return `${pad2(m)}.01 ~ ${pad2(m)}.${pad2(days)}`;
}
const MONTH_LABEL = new Proxy({}, { get: (_, key) => buildMonthLabel(key) });
const MONTH_RANGE = new Proxy({}, { get: (_, key) => buildMonthRange(key) });

/* ---------------------------------------------------------- */
/* Shared bits                                                  */
/* ---------------------------------------------------------- */
function Header({ tabKey, title, onBack, right, month, setMonth, onQuickAdd }) {
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
        <div style={{ minWidth: "24px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>{right}</div>
      </div>
      {tabKey === "home" && month && setMonth && (
        <div className="flex items-center justify-between" style={{ marginTop: "10px" }}>
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
          {onQuickAdd && (
            <button
              onClick={onQuickAdd}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { key: "home", label: "HOME", icon: Home },
    { key: "transactions", label: "내역", icon: List },
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
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Home                                                          */
/* ---------------------------------------------------------- */
function HomeScreen({ tx, txAll, month, cards, loans, accounts, goTransactions, goCards, saveState, onReset }) {
  const income = tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = tx.filter((t) => t.type === "expense" && !t.canceled).reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  const cardTotal = cards.reduce(
    (s, c) => s + tx.filter((t) => t.type === "expense" && !t.canceled && t.method === c.method).reduce((a, t) => a + t.amount, 0),
    0
  );
  const loanTotal = loans.reduce((s, l) => s + l.balance, 0);
  const debtTotal = cardTotal + loanTotal;
  const totalAssets = accounts.reduce((s, a) => s + a.balance, 0);
  const netWorth = totalAssets - debtTotal;

  const categoryData = useMemo(() => {
    const map = {};
    tx.filter((t) => t.type === "expense" && !t.canceled).forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tx]);

  const monthIdx = MONTHS.indexOf(month);
  const recentMonths = MONTHS.slice(monthIdx, monthIdx + 4); // 현재 보는 달부터 과거 4개월 (내림차순)
  const trendData = recentMonths
    .slice()
    .reverse()
    .map((m) => {
      const items = txAll[m] || [];
      const inc = items.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = items.filter((t) => t.type === "expense" && !t.canceled).reduce((s, t) => s + t.amount, 0);
      return { m: m.slice(5) + "월", 수입: inc, 지출: exp };
    });

  const prevMonthKey = MONTHS[MONTHS.indexOf(month) + 1];
  const prevItems = prevMonthKey ? txAll[prevMonthKey] || [] : [];
  const prevIncome = prevItems.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevItems.filter((t) => t.type === "expense" && !t.canceled).reduce((s, t) => s + t.amount, 0);
  const prevNet = prevIncome - prevExpense;
  const netDiff = net - prevNet;
  const fixedExpense = tx.filter((t) => t.type === "expense" && !t.canceled && t.recurring === "고정").reduce((s, t) => s + t.amount, 0);
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
        style={{ background: C.dangerSoft, borderRadius: "12px", padding: "12px 14px", marginBottom: "10px", border: `1px solid ${C.danger}22` }}
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

      <div style={{ background: C.card, borderRadius: "12px", padding: "12px 14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: "12px", color: C.inkSoft }}>내 재산 (통장 잔액 - 총 부채)</div>
            <div style={{ fontSize: "11px", color: C.inkMute, opacity: 0.85 }}>통장 합계 {wonSigned(totalAssets)} · 부채 -{won(debtTotal)}</div>
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: netWorth < 0 ? C.danger : C.accent }}>{wonSigned(netWorth)}</div>
        </div>
      </div>

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
  const expense = tx.filter((t) => t.type === "expense" && !t.canceled).reduce((s, t) => s + t.amount, 0);
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
  (tx || []).forEach((t) => {
    if (!t || !t.date) return;
    const d = parseInt(t.date.slice(8, 10), 10);
    if (!d || Number.isNaN(d)) return;
    byDay[d] = byDay[d] || { income: 0, expense: 0 };
    if (t.type === "income") byDay[d].income += t.amount || 0;
    else if (!t.canceled) byDay[d].expense += t.amount || 0;
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

function WeeklyView({ month, tx }) {
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstWeekday = new Date(y, m - 1, 1).getDay();

  const byDay = {};
  (tx || []).forEach((t) => {
    if (!t || !t.date) return;
    const d = parseInt(t.date.slice(8, 10), 10);
    if (!d || Number.isNaN(d)) return;
    byDay[d] = byDay[d] || { income: 0, expense: 0 };
    if (t.type === "income") byDay[d].income += t.amount || 0;
    else if (!t.canceled) byDay[d].expense += t.amount || 0;
  });

  const weeks = [];
  let dayCursor = 1 - firstWeekday; // 첫 주는 이전 달 날짜로 시작할 수 있음
  while (dayCursor <= daysInMonth) {
    const weekStart = Math.max(dayCursor, 1);
    const weekEnd = Math.min(dayCursor + 6, daysInMonth);
    let income = 0;
    let expense = 0;
    for (let d = weekStart; d <= weekEnd; d++) {
      if (byDay[d]) {
        income += byDay[d].income;
        expense += byDay[d].expense;
      }
    }
    weeks.push({ label: `${pad2(m)}.${pad2(weekStart)} ~ ${pad2(m)}.${pad2(weekEnd)}`, income, expense });
    dayCursor += 7;
  }

  return (
    <div className="flex flex-col gap-2">
      {weeks.map((w, idx) => (
        <div key={idx} style={{ background: C.card, borderRadius: "12px", padding: "12px", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "12px", color: C.inkSoft, marginBottom: "6px" }}>{idx + 1}주차 · {w.label}</div>
          <div className="flex items-center" style={{ gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: C.inkMute }}>수입</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.accent }}>{won(w.income)}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: C.inkMute }}>지출</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.danger }}>{won(w.expense)}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: C.inkMute }}>합계</div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>{wonSigned(w.income - w.expense)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


function MonthlyListView({ txAll, goMonth }) {
  const rows = MONTHS.map((m) => {
    const items = txAll[m] || [];
    const income = items.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = items.filter((t) => t.type === "expense" && !t.canceled).reduce((s, t) => s + t.amount, 0);
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

function TransactionsScreen({ tx, setTx, filter, setFilter, txAll, goMonth, month, setMonth, onEditTx }) {
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
        {["일별", "주별", "달력", "월별"].map((v) => (
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
      {viewMode === "주별" && <WeeklyView month={month} tx={tx} />}
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
                    style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}`, opacity: t.canceled ? 0.5 : 1 }}
                  >
                    <button onClick={() => onEditTx(t)} className="flex items-center gap-2.5 text-left" style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: t.type === "income" ? C.accentSoft : t.type === "transfer" ? C.accentSoft : t.recurring === "고정" ? C.dangerSoft : C.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={15} color={t.type === "income" || t.type === "transfer" ? C.accentIcon : t.recurring === "고정" ? C.dangerIcon : C.inkMute} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, textDecoration: t.canceled ? "line-through" : "none" }}>
                          {t.memo} {t.canceled && <span style={{ fontSize: "10px", color: C.danger, fontWeight: 700 }}>(취소됨)</span>}
                        </div>
                        <div style={{ fontSize: "11px", color: C.inkMute }}>
                          {t.type === "transfer" ? `${t.transferFrom} → ${t.transferTo}` : `${t.category} · ${t.recurring} · ${t.method}`}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: t.type === "income" ? C.accent : t.type === "transfer" ? C.ink : C.ink,
                            textDecoration: t.canceled ? "line-through" : "none",
                          }}
                        >
                          {t.type === "income" ? "+" : t.type === "transfer" ? "" : "-"}
                          {won(t.amount)}
                        </span>
                        {t.discount > 0 && (
                          <span style={{ fontSize: "10px", color: C.inkMute }}>
                            {won(t.originalAmount)} - 할인 {won(t.discount)}
                          </span>
                        )}
                      </div>
                      {t.paymentType === "카드" && (
                        <button
                          onClick={() => setTx((prev) => prev.map((p) => (p.id === t.id ? { ...p, canceled: !p.canceled } : p)))}
                          title="카드 거래 취소"
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "4px",
                            border: `1.5px solid ${t.canceled ? C.danger : C.inkMute}`,
                            background: t.canceled ? C.danger : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {t.canceled && <Check size={10} color="#fff" strokeWidth={3} />}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setTx((prev) => {
                            const idx = prev.findIndex((p) => p.id === t.id);
                            const copy = { ...t, id: "t" + Date.now(), canceled: false };
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
    (s, c) => s + tx.filter((t) => t.type === "expense" && !t.canceled && t.method === c.method).reduce((a, t) => a + t.amount, 0),
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
      total: tx.filter((t) => t.type === "expense" && !t.canceled && t.method === c.method).reduce((s, t) => s + t.amount, 0),
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

function AllAccountsHistoryScreen({ accounts, cards, txAll, month, setView, setSelectedAccount, onAddAccount }) {
  const prevMonthKey = MONTHS[MONTHS.indexOf(month) + 1];
  const prevMonthTx = prevMonthKey ? txAll[prevMonthKey] || [] : [];
  const sortedAccounts = [...accounts]
    .map((a) => {
      const linkedCards = cards.filter((c) => (a.linkedCardIds || []).includes(c.id));
      const cardSpend = linkedCards.reduce(
        (s, c) => s + prevMonthTx.filter((t) => t.type === "expense" && !t.canceled && t.method === c.method).reduce((a2, t) => a2 + t.amount, 0),
        0
      );
      return { ...a, availableBalance: a.balance - cardSpend, linkedCards };
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
                  {a.linkedCards.length > 0 ? ` · ${a.linkedCards.map((c) => c.name).join(", ")} 연결` : ""}
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
  const total = cardTx.filter((t) => t.type === "expense" && !t.canceled).reduce((s, t) => s + t.amount, 0);

  const monthlyTotals = MONTHS.slice()
    .reverse()
    .map((m) => {
      const items = (txAll[m] || []).filter((t) => t.type === "expense" && !t.canceled && t.method === card.method);
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

function AccountDetailScreen({ account, tx, txAll, month, cards, onEdit }) {
  if (!account) return null;
  const linkedCards = cards.filter((c) => (account.linkedCardIds || []).includes(c.id));
  const linkedMethods = linkedCards.map((c) => c.method);
  const accountTx = tx
    .filter((t) => {
      if (t.type === "income") return t.toAccount === account.name;
      if (t.type === "transfer") return t.transferFrom === account.name || t.transferTo === account.name;
      if (t.method !== "계좌") return linkedMethods.includes(t.method);
      // 계좌 결제 항목 중 특정 통장이 지정된 경우(예: 대출 이자) 그 통장에서만 보여요.
      // 통장이 지정 안 된 일반 계좌 항목(고정지출 등)은 지금까지처럼 모든 통장에 보여요.
      return !t.fromAccount || t.fromAccount === account.name;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  // 카드 사용액은 보통 다음 달 결제일에 실제로 통장에서 빠져나가므로, 이번 달에 청구되는 금액은 '전월' 카드 사용액이에요.
  const prevMonthKey = MONTHS[MONTHS.indexOf(month) + 1];
  const prevMonthTx = prevMonthKey ? txAll[prevMonthKey] || [] : [];
  const billedCardSpend = linkedCards.reduce(
    (s, c) => s + prevMonthTx.filter((t) => t.type === "expense" && !t.canceled && t.method === c.method).reduce((a2, t) => a2 + t.amount, 0),
    0
  );
  const availableBalance = account.balance - billedCardSpend;

  function payLabel(t) {
    if (t.type === "transfer") return t.transferTo === account.name ? "받음" : "보냄";
    if (t.method === "계좌") return "계좌";
    if (t.paymentType === "현금") return "현금";
    return t.cardKind || "카드";
  }

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "4px" }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>{linkedCards.length > 0 ? "사용 가능 잔액" : "잔액"}</span>
          <span style={{ fontSize: "18px", fontWeight: 700, color: availableBalance < 0 ? C.danger : C.ink }}>{wonSigned(availableBalance)}</span>
        </div>
        <div style={{ fontSize: "12px", color: C.inkSoft }}>
          {account.bank} · {account.type}
        </div>
        {linkedCards.length > 0 && (
          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "11px", color: C.inkMute, marginBottom: "2px" }}>
              원 잔액 {wonSigned(account.balance)} - {prevMonthKey ? MONTH_LABEL[prevMonthKey].slice(5) : ""} 카드 청구 합계 {won(billedCardSpend)}
            </div>
            <div style={{ fontSize: "11px", color: C.inkMute }}>연결 카드: {linkedCards.map((c) => c.name).join(", ")}</div>
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
              <div style={{ fontSize: "11px", color: C.inkMute }}>{t.date.slice(5)} · {t.type === "transfer" ? payLabel(t) : t.category}</div>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: t.type === "income" || (t.type === "transfer" && t.transferTo === account.name) ? C.accent : C.ink }}>
              {t.type === "income" ? "+" : t.type === "transfer" ? (t.transferTo === account.name ? "+" : "-") : "-"}
              {won(t.amount)}
            </span>
          </div>
        ))}
        {accountTx.length === 0 && <div style={{ textAlign: "center", color: C.inkMute, fontSize: "13px", padding: "24px 0" }}>이번 달 거래 내역이 없어요.</div>}
      </div>
    </div>
  );
}

function LoanDetailScreen({ loan, txAll, accounts, onPayoff, onEdit }) {
  if (!loan) return null;
  const linkedAccount = accounts.find((a) => a.id === loan.linkedAccountId);
  const interestHistory = MONTHS.slice()
    .reverse()
    .map((m) => {
      const items = (txAll[m] || []).filter((t) => t.id === "l" + loan.id + "-" + m);
      const amt = items.reduce((s, t) => s + t.amount, 0);
      return { m, amt };
    })
    .filter((h) => h.amt > 0);

  return (
    <div style={{ padding: "12px 16px 16px" }}>
      <div style={{ background: C.card, borderRadius: "12px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>대출 잔액</span>
          <span style={{ fontSize: "18px", fontWeight: 700 }}>{won(loan.balance)}</span>
        </div>
        <div style={{ fontSize: "12px", color: C.inkSoft }}>
          이자율 연 {loan.interestRate}% · 예상 월 이자 {won(loan.monthlyInterest)}
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
        <div className="flex items-center justify-between" style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>대출금 상환일</span>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>매달 {loan.repayDay}일</span>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>상환방식</span>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{loan.repaymentType || "-"}</span>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "6px 0" }}>
          <span style={{ fontSize: "12px", color: C.inkSoft }}>이자 출금 통장</span>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{linkedAccount ? linkedAccount.name : "-"}</span>
        </div>
      </div>

      <div style={{ fontSize: "13px", fontWeight: 700, color: C.inkSoft, marginBottom: "8px" }}>이자 납부 내역</div>
      <div style={{ marginBottom: "16px" }}>
        {interestHistory.map((h) => (
          <div key={h.m} className="flex items-center justify-between" style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: "13px" }}>{MONTH_LABEL[h.m]}</span>
            <span style={{ fontSize: "13px" }}>{won(h.amt)}</span>
          </div>
        ))}
        {interestHistory.length === 0 && <div style={{ textAlign: "center", color: C.inkMute, fontSize: "13px", padding: "16px 0" }}>이자 납부 내역이 없어요.</div>}
        <div style={{ fontSize: "11px", color: C.inkMute, marginTop: "6px" }}>내역 탭에서 이 대출의 이자 거래를 수정하면 여기에도 바로 반영돼요.</div>
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
      const items = (txAll[m] || []).filter((t) => t.type === "expense" && !t.canceled && t.recurring === "고정");
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
function AddSheet({ onClose, onAdd, onSave, onDelete, onTransfer, cards, accounts, editTx, defaultDate }) {
  const [form, setForm] = useState(
    editTx
      ? {
          date: editTx.date,
          type: editTx.type,
          category: editTx.category,
          recurring: editTx.recurring,
          paymentType: editTx.paymentType || (editTx.method === "현금" ? "현금" : "카드"),
          cardKind: editTx.cardKind || "신용",
          cardIssuer: editTx.method === "현금" || editTx.method === "계좌" ? cards[0]?.name || "" : editTx.method,
          toAccount: editTx.toAccount || (accounts[0] ? accounts[0].name : ""),
          transferFrom: editTx.transferFrom || "현금",
          transferTo: editTx.transferTo || (accounts[0] ? accounts[0].name : ""),
          amount: String(editTx.originalAmount ?? editTx.amount ?? ""),
          discount: editTx.discount ? String(editTx.discount) : "",
          memo: editTx.memo === "-" ? "" : editTx.memo,
        }
      : {
          date: defaultDate || TODAY,
          type: "expense",
          category: "식비",
          recurring: "변동",
          paymentType: "카드",
          cardKind: "신용",
          cardIssuer: cards[0] ? cards[0].name : "",
          toAccount: accounts[0] ? accounts[0].name : "",
          transferFrom: "현금",
          transferTo: accounts[0] ? accounts[0].name : "",
          amount: "",
          discount: "",
          memo: "",
        }
  );
  const catOptions = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 50 }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, width: "100%", borderRadius: "16px 16px 0 0", padding: "16px", maxHeight: "85vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700 }}>{editTx ? "거래 수정" : "거래 추가"}</span>
          <button onClick={onClose} style={{ color: C.inkSoft }}>
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}
          />
          <div className="flex gap-2">
            {[
              { key: "expense", label: "지출" },
              { key: "income", label: "수입" },
              { key: "transfer", label: "이체" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  const opts = opt.key === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
                  setForm({ ...form, type: opt.key, category: opts[0] });
                }}
                className="flex-1"
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: form.type === opt.key ? C.ink : "transparent",
                  color: form.type === opt.key ? "#fff" : C.inkSoft,
                  border: form.type === opt.key ? "none" : `1px solid ${C.border}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {form.type !== "transfer" && (
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
              {catOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          {form.type !== "transfer" && (
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
          )}
          {form.type === "transfer" && (
            <div className="flex flex-col gap-2">
              <div>
                <div style={{ fontSize: "11px", color: C.inkMute, marginBottom: "4px" }}>보내는 곳</div>
                <select value={form.transferFrom} onChange={(e) => setForm({ ...form, transferFrom: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px", width: "100%" }}>
                  <option value="현금">현금</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: C.inkMute, marginBottom: "4px" }}>받는 통장</div>
                <select value={form.transferTo} onChange={(e) => setForm({ ...form, transferTo: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px", width: "100%" }}>
                  {accounts.length === 0 && <option value="">등록된 통장이 없어요</option>}
                  {accounts
                    .filter((a) => a.name !== form.transferFrom)
                    .map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
          {form.type === "income" && (
            <select value={form.toAccount} onChange={(e) => setForm({ ...form, toAccount: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
              {accounts.length === 0 && <option value="">등록된 통장이 없어요</option>}
              {accounts.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}으로 입금
                </option>
              ))}
            </select>
          )}
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
          <AmountInput placeholder="금액" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
          {form.type === "expense" && form.paymentType === "카드" && (
            <AmountInput placeholder="카드할인 (없으면 비워두세요)" value={form.discount} onChange={(v) => setForm({ ...form, discount: v })} />
          )}
          {form.type !== "transfer" && (
            <div
              className="flex items-center justify-between"
              style={{ background: C.accentSoft, borderRadius: "8px", padding: "8px 10px" }}
            >
              <span style={{ fontSize: "12px", color: C.inkSoft }}>최종금액 (금액 - 카드할인)</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: C.accent }}>
                {won(Math.max(0, (parseInt(form.amount, 10) || 0) - (parseInt(form.discount, 10) || 0)))}
              </span>
            </div>
          )}
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
              if (form.type === "transfer") {
                if (!form.transferTo) return;
                const txData = {
                  id: editTx ? editTx.id : "t" + Date.now(),
                  date: form.date,
                  type: "transfer",
                  category: "이체",
                  recurring: "변동",
                  method: form.transferFrom,
                  transferFrom: form.transferFrom,
                  transferTo: form.transferTo,
                  amount,
                  memo: form.memo || `${form.transferFrom} → ${form.transferTo} 이체`,
                };
                if (editTx) onSave(txData);
                else onAdd(txData);
                if (!editTx) onTransfer(form.transferFrom, form.transferTo, amount);
                onClose();
                return;
              }
              const discount = form.type === "expense" && form.paymentType === "카드" ? parseInt(form.discount, 10) || 0 : 0;
              const final = Math.max(0, amount - discount);
              const method = form.type === "income" ? "계좌" : form.paymentType === "현금" ? "현금" : form.cardIssuer;
              const txData = { id: editTx ? editTx.id : "t" + Date.now(), ...form, method, amount: final, originalAmount: amount, discount, memo: form.memo || "-" };
              if (editTx) onSave(txData);
              else onAdd(txData);
              onClose();
            }}
            style={{ background: C.accent, color: "#fff", borderRadius: "8px", padding: "10px", fontSize: "14px", fontWeight: 700, marginTop: "4px" }}
          >
            {editTx ? "수정 저장하기" : "추가하기"}
          </button>
          {editTx && (
            <button
              onClick={() => {
                onDelete(editTx.id);
                onClose();
              }}
              style={{ color: C.danger, fontSize: "13px", fontWeight: 600, padding: "6px" }}
            >
              이 거래 삭제하기
            </button>
          )}
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
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 50 }}
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
          type: editAccount.type || "입출금",
          accountNumber: editAccount.accountNumber === "-" ? "" : editAccount.accountNumber,
          linkedCardIds: editAccount.linkedCardIds || [],
          balance: String(editAccount.balance),
        }
      : { name: "", bank: BANKS[0], type: "입출금", accountNumber: "", linkedCardIds: [], balance: "" }
  );

  function toggleCard(cardId) {
    setForm((prev) => ({
      ...prev,
      linkedCardIds: prev.linkedCardIds.includes(cardId) ? prev.linkedCardIds.filter((id) => id !== cardId) : [...prev.linkedCardIds, cardId],
    }));
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 50 }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, width: "100%", borderRadius: "16px 16px 0 0", padding: "16px", maxHeight: "85vh", overflowY: "auto" }}>
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
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
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
          <div>
            <div style={{ fontSize: "11px", color: C.inkMute, marginBottom: "6px" }}>연결할 카드 (여러 개 선택 가능)</div>
            <div className="flex flex-col gap-1.5">
              {cards.length === 0 && <div style={{ fontSize: "12px", color: C.inkMute }}>등록된 카드가 없어요.</div>}
              {cards.map((c) => {
                const checked = form.linkedCardIds.includes(c.id);
                return (
                  <button key={c.id} onClick={() => toggleCard(c.id)} className="flex items-center gap-2" style={{ padding: "2px 0" }}>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "4px",
                        border: `1.5px solid ${checked ? C.accent : C.inkMute}`,
                        background: checked ? C.accent : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {checked && <Check size={11} color="#fff" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: "13px", color: checked ? C.ink : C.inkSoft }}>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <AmountInput placeholder="현재 잔액" value={form.balance} onChange={(v) => setForm({ ...form, balance: v })} />
          <button
            onClick={() => {
              if (!form.name.trim()) return;
              const linkedCards = cards.filter((c) => form.linkedCardIds.includes(c.id));
              const accountData = {
                id: editAccount ? editAccount.id : "ac" + Date.now(),
                name: form.name.trim(),
                bank: form.bank,
                type: form.type,
                accountNumber: form.accountNumber || "-",
                balance: parseInt(form.balance, 10) || 0,
                linkedCardIds: form.linkedCardIds,
                note: linkedCards.length > 0 ? `연결된 카드: ${linkedCards.map((c) => c.name).join(", ")}` : "연결된 카드 없음",
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
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 50 }}
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
          {editFixed && (
            <div style={{ fontSize: "11px", color: C.inkMute }}>금액이나 결제수단을 바꾸면, 지난 달 내역은 그대로 두고 이번 달부터 새 값으로 반영돼요.</div>
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

function LoanFormSheet({ accounts, onClose, onAdd, onSave, editLoan }) {
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
          repaymentType: editLoan.repaymentType || REPAYMENT_TYPES[0],
          linkedAccountId: editLoan.linkedAccountId || "",
        }
      : {
          name: "",
          bank: BANKS[0],
          balance: "",
          interestRate: "",
          startDate: TODAY,
          maturityDate: "",
          repayDay: "15",
          repaymentType: REPAYMENT_TYPES[0],
          linkedAccountId: accounts[0] ? accounts[0].id : "",
        }
  );
  const [error, setError] = useState("");
  const balanceNum = parseInt(form.balance, 10) || 0;
  const rateNum = parseFloat(form.interestRate) || 0;
  const monthlyInterest = Math.round((balanceNum * (rateNum / 100)) / 12);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 50 }}
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
          <select value={form.repaymentType} onChange={(e) => setForm({ ...form, repaymentType: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
            {REPAYMENT_TYPES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select value={form.linkedAccountId} onChange={(e) => setForm({ ...form, linkedAccountId: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px" }}>
            <option value="">이자 출금 통장 선택 안 함</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}에서 이자 출금
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between" style={{ background: C.accentSoft, borderRadius: "8px", padding: "8px 10px" }}>
            <span style={{ fontSize: "12px", color: C.inkSoft }}>예상 월 이자</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.accent }}>{won(monthlyInterest)}</span>
          </div>
          <div style={{ fontSize: "11px", color: C.inkMute }}>
            대출 시작 다음 달부터, 선택한 상환방식에 따라 계산된 이자가 거래내역에 자동으로 반영돼요. 실제 이자와 다르면 내역에서 직접 수정하시면 돼요.
          </div>
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
                  repaymentType: form.repaymentType,
                  linkedAccountId: form.linkedAccountId || null,
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
          totalAmount: String(editInstallment.principal ?? editInstallment.monthlyAmount * editInstallment.total),
          interestAmount: String(editInstallment.interestAmount || ""),
          total: String(editInstallment.total),
          firstPaymentDate: editInstallment.firstPaymentDate || "2026-07-01",
          interestFree: !!editInstallment.interestFree,
        }
      : { name: "", cardId: cards[0] ? cards[0].id : "", totalAmount: "", interestAmount: "", total: "3", firstPaymentDate: "2026-07-01", interestFree: false }
  );
  const totalAmountNum = parseInt(form.totalAmount, 10) || 0;
  const interestAmountNum = form.interestFree ? 0 : parseInt(form.interestAmount, 10) || 0;
  const totalNum = parseInt(form.total, 10) || 1;
  const monthlyAmount = Math.round((totalAmountNum + interestAmountNum) / totalNum);
  const dueDay = parseInt(form.firstPaymentDate.split("-")[2], 10) || 1;

  let paidNum = 0;
  for (let k = 0; k < totalNum; k++) {
    if (addMonthsToDateStr(form.firstPaymentDate, k) <= TODAY) paidNum++;
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 50 }}
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
          <AmountInput placeholder="총 할부 원금" value={form.totalAmount} onChange={(v) => setForm({ ...form, totalAmount: v })} />
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
          {!form.interestFree && (
            <AmountInput placeholder="총 이자 금액 (할부 전체 기간 합계)" value={form.interestAmount} onChange={(v) => setForm({ ...form, interestAmount: v })} />
          )}
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
                principal: totalAmountNum,
                interestAmount: interestAmountNum,
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
  const [month, setMonth] = useState(CURRENT_MONTH);
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
  const [editingTx, setEditingTx] = useState(null);
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

  // 고정지출은 등록 시점 이후로 MONTHS 범위가 늘어날 수 있어서(예: 다음 달이 됨),
  // 활성화된(미사용 체크 안 된) 고정지출 항목은 항상 모든 추적 달에 내역이 채워지도록 보정해요.
  useEffect(() => {
    if (!loaded) return;
    const missing = [];
    fixed
      .filter((f) => !f.unusedChecked)
      .forEach((f) => {
        MONTHS.forEach((m) => {
          const txId = "fx" + f.id + "-" + m;
          const exists = (txAll[m] || []).some((t) => t.id === txId);
          if (!exists) missing.push({ m, tx: fixedTxObj(f, m) });
        });
      });
    if (missing.length > 0) {
      setTxAll((prev) => {
        const updated = { ...prev };
        missing.forEach(({ m, tx: txObj }) => {
          updated[m] = [txObj, ...(updated[m] || [])];
        });
        return updated;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, fixed]);

  const tx = txAll[month] || [];
  function setTx(updater) {
    setTxAll((prev) => ({ ...prev, [month]: typeof updater === "function" ? updater(prev[month] || []) : updater }));
  }

  function addTxSmart(newTx) {
    const monthKey = newTx.date.slice(0, 7);
    setTxAll((prev) => ({ ...prev, [monthKey]: [newTx, ...(prev[monthKey] || [])] }));
  }

  function saveEditedTx(updatedTx, originalMonthKey) {
    const newMonthKey = updatedTx.date.slice(0, 7);
    setTxAll((prev) => {
      const updated = { ...prev };
      updated[originalMonthKey] = (updated[originalMonthKey] || []).filter((t) => t.id !== updatedTx.id);
      updated[newMonthKey] = [updatedTx, ...(updated[newMonthKey] || []).filter((t) => t.id !== updatedTx.id)];
      return updated;
    });
  }

  function deleteTxGlobal(txId, monthKey) {
    setTxAll((prev) => ({ ...prev, [monthKey]: (prev[monthKey] || []).filter((t) => t.id !== txId) }));
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
    const emptyTxByMonth = {};
    MONTHS.forEach((m) => {
      emptyTxByMonth[m] = [];
    });
    setTxAll(emptyTxByMonth);
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

  function applyTransfer(fromName, toName, amount) {
    setAccounts((prev) =>
      prev.map((a) => {
        let balance = a.balance;
        if (a.name === toName) balance += amount;
        if (a.name === fromName) balance -= amount; // fromName이 "현금"이면 어떤 통장 이름과도 안 맞아서 그냥 무시돼요
        return balance !== a.balance ? { ...a, balance } : a;
      })
    );
  }

  function loanInterestTxObj(loan, monthKey, accounts2) {
    const account = accounts2.find((a) => a.id === loan.linkedAccountId);
    return {
      id: "l" + loan.id + "-" + monthKey,
      date: `${monthKey}-${pad2(loan.repayDay)}`,
      type: "expense",
      category: "금융·보험",
      recurring: "고정",
      paymentType: "계좌",
      method: "계좌",
      fromAccount: account ? account.name : undefined,
      amount: loanInterestForMonth(loan, monthKey),
      memo: `${loan.name} 이자상환`,
    };
  }

  function addLoanWithTx(loan) {
    setLoans((prev) => [...prev, loan]);
    MONTHS.forEach((m) => {
      if (monthsBetween(loan.startDate, m) < 1) return; // 시작 다음 달부터
      const txObj = loanInterestTxObj(loan, m, accounts);
      if (txObj.amount > 0) addTxToMonth(m, txObj);
    });
  }

  function updateLoanWithTx(loan) {
    setLoans((prev) => prev.map((l) => (l.id === loan.id ? loan : l)));
    // 금액/이자율/상환방식이 바뀌어도 지난 달 내역(이미 직접 수정했을 수도 있는)은 그대로 두고,
    // 이번 달(수정 시점) 이후 달만 새로 계산해서 반영해요.
    const idx = MONTHS.indexOf(month);
    const affectedMonths = idx === -1 ? [month] : MONTHS.slice(0, idx + 1);
    setTxAll((prev) => {
      const updated = { ...prev };
      affectedMonths.forEach((m) => {
        const txId = "l" + loan.id + "-" + m;
        if (monthsBetween(loan.startDate, m) < 1) {
          updated[m] = (updated[m] || []).filter((t) => t.id !== txId);
          return;
        }
        const newTx = loanInterestTxObj(loan, m, accounts);
        const monthItems = updated[m] || [];
        const exists = monthItems.some((t) => t.id === txId);
        updated[m] = exists ? monthItems.map((t) => (t.id === txId ? newTx : t)) : newTx.amount > 0 ? [newTx, ...monthItems] : monthItems;
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

  function updateFixedWithTx(item) {
    setFixed((prev) => prev.map((f) => (f.id === item.id ? item : f)));
    // 금액/카드가 바뀌어도 지난 달 내역은 그대로 두고, 이번 달(수정하는 시점) 이후부터만 새 값으로 반영해요.
    const idx = MONTHS.indexOf(month);
    const affectedMonths = idx === -1 ? [month] : MONTHS.slice(0, idx + 1);
    setTxAll((prev) => {
      const updated = { ...prev };
      affectedMonths.forEach((m) => {
        const txId = "fx" + item.id + "-" + m;
        const monthItems = updated[m] || [];
        const exists = monthItems.some((t) => t.id === txId);
        const newTx = fixedTxObj(item, m);
        updated[m] = exists ? monthItems.map((t) => (t.id === txId ? newTx : t)) : monthItems;
      });
      return updated;
    });
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
        accounts={accounts}
        goTransactions={goTransactions}
        goCards={() => goTab("cards")}
        saveState={saveState}
        onReset={() => setShowResetConfirm(true)}
      />
    );
  } else if (view === "transactions") {
    title = "내역";
    screen = (
      <TransactionsScreen
        tx={tx}
        setTx={setTx}
        filter={txFilter}
        setFilter={setTxFilter}
        txAll={txAll}
        goMonth={goMonth}
        month={month}
        setMonth={setMonth}
        onEditTx={(t) => {
          setEditingTx(t);
          setShowAdd(true);
        }}
      />
    );
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
        txAll={txAll}
        month={month}
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
        txAll={txAll}
        accounts={accounts}
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
        txAll={txAll}
        month={month}
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
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <style>{`@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');`}</style>
      <div style={{ background: C.bg, borderRadius: "20px", overflow: "hidden", position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
        <Header
          tabKey={tab}
          title={title}
          onBack={onBack}
          month={month}
          setMonth={setMonth}
          onQuickAdd={
            tab === "home"
              ? () => {
                  setEditingTx(null);
                  setShowAdd(true);
                }
              : null
          }
          right={
            view === "transactions" ? (
              <>
                <Search size={18} color="#fff" />
                <button
                  onClick={() => {
                    setEditingTx(null);
                    setShowAdd(true);
                  }}
                  style={{ display: "flex" }}
                >
                  <Plus size={20} color="#fff" />
                </button>
              </>
            ) : view === "fixed" ? (
              <SlidersHorizontal size={18} color="#fff" />
            ) : null
          }
        />
        <div style={{ flex: 1, overflowY: "auto" }}>{screen}</div>
        <BottomNav tab={tab} setTab={goTab} />
        {showAdd && (
          <AddSheet
            cards={cards}
            accounts={accounts}
            editTx={editingTx}
            defaultDate={TODAY}
            onClose={() => {
              setShowAdd(false);
              setEditingTx(null);
            }}
            onAdd={(newTx) => {
              addTxSmart(newTx);
              setFixed((prev) =>
                prev.map((f) => (f.name === newTx.memo && f.unusedChecked ? { ...f, unusedChecked: false, lastUsedDays: 0 } : f))
              );
            }}
            onSave={(updatedTx) => saveEditedTx(updatedTx, month)}
            onDelete={(txId) => deleteTxGlobal(txId, month)}
            onTransfer={applyTransfer}
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
            accounts={accounts}
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
            onSave={updateFixedWithTx}
          />
        )}
        {showResetConfirm && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
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
