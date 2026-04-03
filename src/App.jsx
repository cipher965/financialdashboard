import { useState, useMemo, useEffect, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Housing","Food","Transport","Healthcare","Entertainment","Shopping","Utilities","Salary","Freelance","Investment"];
const CATEGORY_COLORS = {
  Housing:"#e8c547", Food:"#4ecdc4", Transport:"#ff6b6b", Healthcare:"#a78bfa",
  Entertainment:"#fb923c", Shopping:"#34d399", Utilities:"#60a5fa",
  Salary:"#f472b6", Freelance:"#818cf8", Investment:"#fbbf24"
};

const SEED_TRANSACTIONS = [
  { id:1,  date:"2025-01-05", desc:"Monthly Salary",        category:"Salary",        amount:5200, type:"income"  },
  { id:2,  date:"2025-01-07", desc:"Rent Payment",          category:"Housing",       amount:1400, type:"expense" },
  { id:3,  date:"2025-01-09", desc:"Grocery Store",         category:"Food",          amount:210,  type:"expense" },
  { id:4,  date:"2025-01-12", desc:"Freelance Project",     category:"Freelance",     amount:800,  type:"income"  },
  { id:5,  date:"2025-01-15", desc:"Electric Bill",         category:"Utilities",     amount:95,   type:"expense" },
  { id:6,  date:"2025-01-18", desc:"Netflix & Spotify",     category:"Entertainment", amount:28,   type:"expense" },
  { id:7,  date:"2025-01-22", desc:"Uber Rides",            category:"Transport",     amount:65,   type:"expense" },
  { id:8,  date:"2025-01-25", desc:"Online Shopping",       category:"Shopping",      amount:180,  type:"expense" },
  { id:9,  date:"2025-02-05", desc:"Monthly Salary",        category:"Salary",        amount:5200, type:"income"  },
  { id:10, date:"2025-02-07", desc:"Rent Payment",          category:"Housing",       amount:1400, type:"expense" },
  { id:11, date:"2025-02-10", desc:"Doctor Visit",          category:"Healthcare",    amount:120,  type:"expense" },
  { id:12, date:"2025-02-14", desc:"Valentine Dinner",      category:"Food",          amount:145,  type:"expense" },
  { id:13, date:"2025-02-18", desc:"Investment ETF",        category:"Investment",    amount:500,  type:"expense" },
  { id:14, date:"2025-02-20", desc:"Freelance Project",     category:"Freelance",     amount:1200, type:"income"  },
  { id:15, date:"2025-02-24", desc:"Gym Membership",        category:"Healthcare",    amount:45,   type:"expense" },
  { id:16, date:"2025-03-05", desc:"Monthly Salary",        category:"Salary",        amount:5500, type:"income"  },
  { id:17, date:"2025-03-07", desc:"Rent Payment",          category:"Housing",       amount:1400, type:"expense" },
  { id:18, date:"2025-03-10", desc:"Grocery Store",         category:"Food",          amount:235,  type:"expense" },
  { id:19, date:"2025-03-14", desc:"Car Maintenance",       category:"Transport",     amount:320,  type:"expense" },
  { id:20, date:"2025-03-18", desc:"Concert Tickets",       category:"Entertainment", amount:120,  type:"expense" },
  { id:21, date:"2025-03-22", desc:"Phone Bill",            category:"Utilities",     amount:60,   type:"expense" },
  { id:22, date:"2025-03-25", desc:"Investment ETF",        category:"Investment",    amount:500,  type:"expense" },
  { id:23, date:"2025-04-05", desc:"Monthly Salary",        category:"Salary",        amount:5500, type:"income"  },
  { id:24, date:"2025-04-07", desc:"Rent Payment",          category:"Housing",       amount:1400, type:"expense" },
  { id:25, date:"2025-04-10", desc:"Grocery Store",         category:"Food",          amount:190,  type:"expense" },
  { id:26, date:"2025-04-13", desc:"Freelance Project",     category:"Freelance",     amount:950,  type:"income"  },
  { id:27, date:"2025-04-18", desc:"New Laptop",            category:"Shopping",      amount:899,  type:"expense" },
  { id:28, date:"2025-04-21", desc:"Internet Bill",         category:"Utilities",     amount:55,   type:"expense" },
  { id:29, date:"2025-04-25", desc:"Investment ETF",        category:"Investment",    amount:700,  type:"expense" },
  { id:30, date:"2025-05-05", desc:"Monthly Salary",        category:"Salary",        amount:5500, type:"income"  },
  { id:31, date:"2025-05-07", desc:"Rent Payment",          category:"Housing",       amount:1400, type:"expense" },
  { id:32, date:"2025-05-12", desc:"Restaurant Week",       category:"Food",          amount:310,  type:"expense" },
  { id:33, date:"2025-05-15", desc:"Flight Tickets",        category:"Transport",     amount:450,  type:"expense" },
  { id:34, date:"2025-05-18", desc:"Freelance Project",     category:"Freelance",     amount:600,  type:"income"  },
  { id:35, date:"2025-05-22", desc:"Streaming Upgrade",     category:"Entertainment", amount:55,   type:"expense" },
  { id:36, date:"2025-05-25", desc:"Investment ETF",        category:"Investment",    amount:700,  type:"expense" },
  { id:37, date:"2025-06-05", desc:"Monthly Salary",        category:"Salary",        amount:5800, type:"income"  },
  { id:38, date:"2025-06-07", desc:"Rent Payment",          category:"Housing",       amount:1400, type:"expense" },
  { id:39, date:"2025-06-10", desc:"Grocery Store",         category:"Food",          amount:220,  type:"expense" },
  { id:40, date:"2025-06-15", desc:"Medical Checkup",       category:"Healthcare",    amount:200,  type:"expense" },
  { id:41, date:"2025-06-18", desc:"Bonus Payment",         category:"Salary",        amount:1000, type:"income"  },
  { id:42, date:"2025-06-22", desc:"Home Decor",            category:"Shopping",      amount:340,  type:"expense" },
  { id:43, date:"2025-06-25", desc:"Investment ETF",        category:"Investment",    amount:1000, type:"expense" },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const fmt = (n, compact=false) => compact
  ? new Intl.NumberFormat("en-US", { style:"currency", currency:"USD", notation:"compact", maximumFractionDigits:1 }).format(n)
  : new Intl.NumberFormat("en-US", { style:"currency", currency:"USD", minimumFractionDigits:2 }).format(n);

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
const monthKey = (d) => d.slice(0,7);
const monthLabel = (k) => new Date(k+"-01").toLocaleDateString("en-US",{month:"short",year:"2-digit"});

// ─── ICONS (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ name, size=18 }) => {
  const paths = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    transactions: "M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
    insights: "M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.1h-15V5h15v14.1zm0-16.1h-15c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
    add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    search: "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    filter: "M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z",
    sort: "M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z",
    up: "M7 14l5-5 5 5z",
    down: "M7 10l5 5 5-5z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    moon: "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z",
    sun: "M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z",
    export: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
    user: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    shield: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
    check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    trend_up: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
    wallet: "M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
    menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}>
      <path d={paths[name] || paths.check}/>
    </svg>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0b0f;
    --bg2: #111318;
    --bg3: #181a22;
    --surface: #1c1f29;
    --surface2: #242838;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --text: #eef0f8;
    --text2: #8b90a7;
    --text3: #555a72;
    --gold: #e8c547;
    --gold2: #f0d678;
    --teal: #4ecdc4;
    --red: #ff6b6b;
    --green: #4ade80;
    --purple: #a78bfa;
    --font-display: 'Syne', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --r: 12px;
    --r2: 8px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --shadow2: 0 8px 40px rgba(0,0,0,0.6);
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-display); }

  .light-mode {
    --bg: #f4f5f7;
    --bg2: #eceef2;
    --bg3: #e4e6ec;
    --surface: #ffffff;
    --surface2: #f0f2f8;
    --border: rgba(0,0,0,0.08);
    --border2: rgba(0,0,0,0.14);
    --text: #0f1117;
    --text2: #555a72;
    --text3: #9ca3af;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes countUp {
    from { opacity:0; transform:translateY(6px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pulse {
    0%,100% { opacity:1; }
    50% { opacity:0.6; }
  }
  .fade-up { animation: fadeUp 0.4s ease both; }
  .fade-up-1 { animation-delay:0.05s; }
  .fade-up-2 { animation-delay:0.1s; }
  .fade-up-3 { animation-delay:0.15s; }
  .fade-up-4 { animation-delay:0.2s; }
  .fade-up-5 { animation-delay:0.25s; }

  button { cursor:pointer; border:none; outline:none; font-family: var(--font-display); }
  input, select, textarea { font-family: var(--font-display); outline:none; border:none; }
`;

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"10px 14px",fontSize:13,fontFamily:"var(--font-mono)"}}>
      <div style={{color:"var(--text2)",marginBottom:6,fontSize:11}}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{color:p.color||"var(--gold)",fontWeight:600}}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",borderRadius:"var(--r)",border:"1px solid var(--border2)",width:"100%",maxWidth:480,animation:"fadeUp 0.25s ease both",boxShadow:"var(--shadow2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px",borderBottom:"1px solid var(--border)"}}>
          <span style={{fontSize:18,fontWeight:700,color:"var(--gold)"}}>{title}</span>
          <button onClick={onClose} style={{background:"var(--surface2)",color:"var(--text2)",borderRadius:6,padding:4,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.color="var(--red)"}
            onMouseLeave={e=>e.currentTarget.style.color="var(--text2)"}
          ><Icon name="close" size={16}/></button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function FinanceDashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [role, setRole] = useState("admin");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [transactions, setTransactions] = useState(() => {
    try { const s = localStorage.getItem("fd_txns"); return s ? JSON.parse(s) : SEED_TRANSACTIONS; } catch { return SEED_TRANSACTIONS; }
  });
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({ date:"", desc:"", category:"Food", amount:"", type:"expense" });
  const [formError, setFormError] = useState("");

  // persist
  useEffect(() => { try { localStorage.setItem("fd_txns", JSON.stringify(transactions)); } catch {} }, [transactions]);

  const isAdmin = role === "admin";

  // ── derived data ────────────────────────────────────────────────────────────
  const totalIncome  = useMemo(() => transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0), [transactions]);
  const balance      = totalIncome - totalExpense;

  // monthly trend
  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const k = monthKey(t.date);
      if (!map[k]) map[k] = { month:monthLabel(k), income:0, expense:0 };
      map[k][t.type === "income" ? "income" : "expense"] += t.amount;
    });
    return Object.entries(map).sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>({...v, balance: v.income-v.expense}));
  }, [transactions]);

  // category breakdown (expenses)
  const catData = useMemo(() => {
    const map = {};
    transactions.filter(t=>t.type==="expense").forEach(t => {
      map[t.category] = (map[t.category]||0) + t.amount;
    });
    return Object.entries(map).sort(([,a],[,b])=>b-a).map(([name,value])=>({name,value}));
  }, [transactions]);

  // insights
  const topCat    = catData[0];
  const lastMonth = monthlyData[monthlyData.length-1];
  const prevMonth = monthlyData[monthlyData.length-2];
  const savingsRate = totalIncome > 0 ? ((totalIncome-totalExpense)/totalIncome*100).toFixed(1) : 0;

  // filtered transactions
  const filteredTxns = useMemo(() => {
    let arr = [...transactions];
    if (search) arr = arr.filter(t => t.desc.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== "all") arr = arr.filter(t => t.type === filterType);
    if (filterCat !== "all") arr = arr.filter(t => t.category === filterCat);
    arr.sort((a,b) => {
      if (sortField === "date")   return sortDir==="desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
      if (sortField === "amount") return sortDir==="desc" ? b.amount-a.amount : a.amount-b.amount;
      return 0;
    });
    return arr;
  }, [transactions, search, filterType, filterCat, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d==="desc"?"asc":"desc");
    else { setSortField(field); setSortDir("desc"); }
  };

  // ── form handlers ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm({ date: new Date().toISOString().slice(0,10), desc:"", category:"Food", amount:"", type:"expense" });
    setFormError("");
    setModalOpen(true);
  };
  const openEdit = (t) => {
    setEditTarget(t.id);
    setForm({ date:t.date, desc:t.desc, category:t.category, amount:String(t.amount), type:t.type });
    setFormError("");
    setModalOpen(true);
  };
  const submitForm = () => {
    if (!form.date || !form.desc || !form.amount) { setFormError("All fields are required."); return; }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) { setFormError("Amount must be a positive number."); return; }
    if (editTarget) {
      setTransactions(prev => prev.map(t => t.id===editTarget ? {...t,...form,amount} : t));
    } else {
      setTransactions(prev => [...prev, { id: Date.now(), ...form, amount }]);
    }
    setModalOpen(false);
  };
  const deleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id!==id));

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], { type:"application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "transactions.json"; a.click();
  };
  const exportCSV = () => {
    const header = "id,date,description,category,type,amount";
    const rows = transactions.map(t=>`${t.id},${t.date},"${t.desc}",${t.category},${t.type},${t.amount}`);
    const blob = new Blob([[header,...rows].join("\n")], { type:"text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "transactions.csv"; a.click();
  };

  // ── nav items ────────────────────────────────────────────────────────────────
  const navItems = [
    { id:"dashboard",    label:"Overview",     icon:"dashboard"     },
    { id:"transactions", label:"Transactions", icon:"transactions"  },
    { id:"insights",     label:"Insights",     icon:"insights"      },
  ];

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className={darkMode ? "" : "light-mode"} style={{minHeight:"100vh",background:"var(--bg)",display:"flex",position:"relative"}}>

        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:40,display:"block"}}/>}

        {/* ── SIDEBAR ── */}
        <aside style={{
          width:220, flexShrink:0, background:"var(--bg2)", borderRight:"1px solid var(--border)",
          display:"flex", flexDirection:"column", padding:"24px 16px", gap:4,
          position:"fixed", top:0, left:0, height:"100vh", zIndex:50,
          transform: sidebarOpen ? "translateX(0)" : undefined,
          transition:"transform 0.3s ease",
        }}>
          {/* Logo */}
          <div style={{padding:"0 8px 24px",borderBottom:"1px solid var(--border)",marginBottom:8}}>
            <div style={{fontSize:20,fontWeight:800,color:"var(--gold)",letterSpacing:"-0.5px"}}>
              fin<span style={{color:"var(--teal)"}}>track</span>
            </div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:2,fontFamily:"var(--font-mono)"}}>v2.4.1</div>
          </div>

          {/* Nav */}
          {navItems.map(n => (
            <button key={n.id} onClick={()=>{ setActiveTab(n.id); setSidebarOpen(false); }} style={{
              display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
              borderRadius:"var(--r2)", background: activeTab===n.id ? "var(--surface)" : "transparent",
              color: activeTab===n.id ? "var(--gold)" : "var(--text2)",
              fontWeight: activeTab===n.id ? 600 : 400, fontSize:14,
              transition:"all 0.2s", textAlign:"left",
              borderLeft: activeTab===n.id ? "2px solid var(--gold)" : "2px solid transparent",
            }}
              onMouseEnter={e=>{ if(activeTab!==n.id) e.currentTarget.style.color="var(--text)"; }}
              onMouseLeave={e=>{ if(activeTab!==n.id) e.currentTarget.style.color="var(--text2)"; }}
            >
              <Icon name={n.icon} size={16}/>{n.label}
            </button>
          ))}

          {/* Bottom */}
          <div style={{marginTop:"auto",display:"flex",flexDirection:"column",gap:12}}>
            {/* Role switcher */}
            <div style={{background:"var(--surface)",borderRadius:"var(--r2)",padding:"12px",border:"1px solid var(--border)"}}>
              <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--font-mono)",marginBottom:6}}>ROLE</div>
              <div style={{display:"flex",gap:4}}>
                {["admin","viewer"].map(r=>(
                  <button key={r} onClick={()=>setRole(r)} style={{
                    flex:1, padding:"5px 0", fontSize:11, fontWeight:600, borderRadius:5,
                    background: role===r ? "var(--gold)" : "var(--surface2)",
                    color: role===r ? "#000" : "var(--text2)",
                    transition:"all 0.2s"
                  }}>{r}</button>
                ))}
              </div>
              <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6,color:"var(--text3)",fontSize:11}}>
                <Icon name={isAdmin?"shield":"user"} size={12}/>
                {isAdmin ? "Full access" : "Read only"}
              </div>
            </div>

            {/* Dark mode */}
            <button onClick={()=>setDarkMode(d=>!d)} style={{
              display:"flex",alignItems:"center",gap:8,padding:"10px 12px",
              borderRadius:"var(--r2)",background:"var(--surface)",color:"var(--text2)",
              fontSize:13,transition:"all 0.2s",border:"1px solid var(--border)"
            }}>
              <Icon name={darkMode?"sun":"moon"} size={14}/>
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{marginLeft:220,flex:1,minWidth:0,display:"flex",flexDirection:"column",minHeight:"100vh"}}>

          {/* Top bar */}
          <header style={{
            padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",
            background:"var(--bg2)",borderBottom:"1px solid var(--border)",position:"sticky",top:0,zIndex:30,
            backdropFilter:"blur(12px)"
          }}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:"var(--surface)",color:"var(--text2)",borderRadius:6,padding:6,display:"none",alignItems:"center"}}>
                <Icon name="menu" size={18}/>
              </button>
              <div>
                <div style={{fontSize:20,fontWeight:700,letterSpacing:"-0.4px"}}>{navItems.find(n=>n.id===activeTab)?.label}</div>
                <div style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>
                  {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
                </div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {isAdmin && (
                <>
                  <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:"var(--r2)",background:"var(--surface)",color:"var(--text2)",fontSize:13,border:"1px solid var(--border)",transition:"all 0.2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.color="var(--gold)";e.currentTarget.style.borderColor="var(--gold)";}}
                    onMouseLeave={e=>{e.currentTarget.style.color="var(--text2)";e.currentTarget.style.borderColor="var(--border)";}}>
                    <Icon name="export" size={14}/>CSV
                  </button>
                  <button onClick={exportJSON} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:"var(--r2)",background:"var(--surface)",color:"var(--text2)",fontSize:13,border:"1px solid var(--border)",transition:"all 0.2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.color="var(--gold)";e.currentTarget.style.borderColor="var(--gold)";}}
                    onMouseLeave={e=>{e.currentTarget.style.color="var(--text2)";e.currentTarget.style.borderColor="var(--border)";}}>
                    <Icon name="export" size={14}/>JSON
                  </button>
                  <button onClick={openAdd} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:"var(--r2)",background:"var(--gold)",color:"#000",fontSize:13,fontWeight:700,transition:"all 0.2s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="var(--gold2)"}
                    onMouseLeave={e=>e.currentTarget.style.background="var(--gold)"}>
                    <Icon name="add" size={14}/>New Transaction
                  </button>
                </>
              )}
            </div>
          </header>

          {/* Page content */}
          <main style={{flex:1,padding:"24px 28px",display:"flex",flexDirection:"column",gap:20}}>
            {activeTab === "dashboard" && <DashboardView {...{balance,totalIncome,totalExpense,monthlyData,catData,transactions}}/>}
            {activeTab === "transactions" && <TransactionsView {...{filteredTxns,search,setSearch,filterType,setFilterType,filterCat,setFilterCat,sortField,sortDir,toggleSort,isAdmin,openEdit,deleteTransaction,transactions}}/>}
            {activeTab === "insights" && <InsightsView {...{topCat,lastMonth,prevMonth,savingsRate,monthlyData,catData,totalIncome,totalExpense,transactions}}/>}
          </main>
        </div>

        {/* Add/Edit Modal */}
        <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editTarget?"Edit Transaction":"Add Transaction"}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {formError && <div style={{padding:"10px 14px",background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.3)",borderRadius:"var(--r2)",color:"var(--red)",fontSize:13}}>{formError}</div>}
            {[
              { label:"Date",        key:"date",     type:"date"   },
              { label:"Description", key:"desc",     type:"text"   },
              { label:"Amount (USD)",key:"amount",   type:"number" },
            ].map(f=>(
              <div key={f.key}>
                <label style={{fontSize:12,color:"var(--text2)",marginBottom:4,display:"block",fontWeight:600}}>{f.label}</label>
                <input type={f.type} value={form[f.key]} placeholder={f.label}
                  onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"10px 14px",color:"var(--text)",fontSize:14,transition:"all 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="var(--gold)"}
                  onBlur={e=>e.target.style.borderColor="var(--border2)"}
                />
              </div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <label style={{fontSize:12,color:"var(--text2)",marginBottom:4,display:"block",fontWeight:600}}>Type</label>
                <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                  style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"10px 14px",color:"var(--text)",fontSize:14}}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:12,color:"var(--text2)",marginBottom:4,display:"block",fontWeight:600}}>Category</label>
                <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}
                  style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"10px 14px",color:"var(--text)",fontSize:14}}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={()=>setModalOpen(false)} style={{flex:1,padding:"10px",borderRadius:"var(--r2)",background:"var(--surface2)",color:"var(--text2)",fontSize:14,fontWeight:600,transition:"all 0.2s"}}>Cancel</button>
              <button onClick={submitForm} style={{flex:2,padding:"10px",borderRadius:"var(--r2)",background:"var(--gold)",color:"#000",fontSize:14,fontWeight:700,transition:"all 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--gold2)"}
                onMouseLeave={e=>e.currentTarget.style.background="var(--gold)"}>
                {editTarget ? "Save Changes" : "Add Transaction"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}

// ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────
function DashboardView({ balance, totalIncome, totalExpense, monthlyData, catData, transactions }) {
  const recentTxns = [...transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);

  const cards = [
    { label:"Net Balance", value:balance, icon:"wallet", color:"var(--gold)", bg:"rgba(232,197,71,0.08)" },
    { label:"Total Income", value:totalIncome, icon:"trend_up", color:"var(--green)", bg:"rgba(74,222,128,0.08)" },
    { label:"Total Expenses", value:totalExpense, icon:"down", color:"var(--red)", bg:"rgba(255,107,107,0.08)" },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {cards.map((c,i)=>(
          <div key={c.label} className={`fade-up fade-up-${i+1}`} style={{
            background:"var(--surface)",borderRadius:"var(--r)",padding:"20px 22px",
            border:"1px solid var(--border)",position:"relative",overflow:"hidden"
          }}>
            <div style={{position:"absolute",top:16,right:16,width:38,height:38,borderRadius:10,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",color:c.color}}>
              <Icon name={c.icon} size={18}/>
            </div>
            <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",marginBottom:8,fontWeight:600,letterSpacing:"0.08em"}}>{c.label.toUpperCase()}</div>
            <div style={{fontSize:26,fontWeight:800,color:c.color,letterSpacing:"-0.5px",fontFamily:"var(--font-mono)"}}>{fmt(c.value,true)}</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:4,fontFamily:"var(--font-mono)"}}>{fmt(c.value)}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16}}>
        {/* Area chart */}
        <div className="fade-up fade-up-4" style={{background:"var(--surface)",borderRadius:"var(--r)",padding:"20px 22px",border:"1px solid var(--border)"}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Balance Trend</div>
          <div style={{fontSize:12,color:"var(--text3)",marginBottom:18,fontFamily:"var(--font-mono)"}}>Monthly net balance</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData} margin={{top:4,right:4,bottom:0,left:-10}}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e8c547" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#e8c547" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="month" tick={{fill:"var(--text3)",fontSize:11,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"var(--text3)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,true)}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="balance" name="Balance" stroke="#e8c547" strokeWidth={2} fill="url(#balGrad)" dot={{fill:"#e8c547",r:3}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="fade-up fade-up-5" style={{background:"var(--surface)",borderRadius:"var(--r)",padding:"20px 22px",border:"1px solid var(--border)"}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Spending Breakdown</div>
          <div style={{fontSize:12,color:"var(--text3)",marginBottom:12,fontFamily:"var(--font-mono)"}}>By category</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {catData.map((entry,i)=><Cell key={i} fill={CATEGORY_COLORS[entry.name]||"#888"}/>)}
              </Pie>
              <Tooltip content={<CustomTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px 12px",marginTop:8}}>
            {catData.slice(0,5).map(d=>(
              <div key={d.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--text2)"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:CATEGORY_COLORS[d.name]||"#888",flexShrink:0}}/>
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Income vs Expense bar */}
      <div className="fade-up" style={{background:"var(--surface)",borderRadius:"var(--r)",padding:"20px 22px",border:"1px solid var(--border)"}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Income vs Expenses</div>
        <div style={{fontSize:12,color:"var(--text3)",marginBottom:18,fontFamily:"var(--font-mono)"}}>Monthly comparison</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} margin={{top:4,right:4,bottom:0,left:-10}} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
            <XAxis dataKey="month" tick={{fill:"var(--text3)",fontSize:11,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"var(--text3)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,true)}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="income" name="Income" fill="#4ade80" radius={[4,4,0,0]} maxBarSize={28}/>
            <Bar dataKey="expense" name="Expense" fill="#ff6b6b" radius={[4,4,0,0]} maxBarSize={28}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent transactions */}
      <div className="fade-up" style={{background:"var(--surface)",borderRadius:"var(--r)",padding:"20px 22px",border:"1px solid var(--border)"}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Recent Transactions</div>
        {recentTxns.map((t,i)=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:i<recentTxns.length-1?"1px solid var(--border)":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:34,height:34,borderRadius:9,background:`${CATEGORY_COLORS[t.category]}22`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:CATEGORY_COLORS[t.category]||"#888"}}/>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{t.desc}</div>
                <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>{t.category} · {fmtDate(t.date)}</div>
              </div>
            </div>
            <div style={{fontSize:14,fontWeight:700,fontFamily:"var(--font-mono)",color:t.type==="income"?"var(--green)":"var(--red)"}}>
              {t.type==="income"?"+":"-"}{fmt(t.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TRANSACTIONS VIEW ────────────────────────────────────────────────────────
function TransactionsView({ filteredTxns, search, setSearch, filterType, setFilterType, filterCat, setFilterCat, sortField, sortDir, toggleSort, isAdmin, openEdit, deleteTransaction, transactions }) {
  const allCats = useMemo(() => [...new Set(transactions.map(t=>t.category))].sort(), [transactions]);

  const SortIcon = ({field}) => (
    <span style={{color: sortField===field ? "var(--gold)" : "var(--text3)",marginLeft:4,display:"inline-flex",verticalAlign:"middle"}}>
      <Icon name={sortField===field&&sortDir==="asc"?"up":"down"} size={14}/>
    </span>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Filters */}
      <div className="fade-up" style={{background:"var(--surface)",borderRadius:"var(--r)",padding:"16px 20px",border:"1px solid var(--border)",display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        {/* Search */}
        <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",gap:8,background:"var(--bg3)",borderRadius:"var(--r2)",padding:"8px 12px",border:"1px solid var(--border)"}}>
          <Icon name="search" size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search transactions..." style={{background:"transparent",color:"var(--text)",fontSize:13,width:"100%",border:"none",outline:"none"}}/>
          {search && <button onClick={()=>setSearch("")} style={{background:"none",color:"var(--text3)",padding:0,display:"flex"}}><Icon name="close" size={14}/></button>}
        </div>
        {/* Type */}
        <div style={{display:"flex",gap:4}}>
          {["all","income","expense"].map(t=>(
            <button key={t} onClick={()=>setFilterType(t)} style={{padding:"7px 14px",borderRadius:"var(--r2)",fontSize:12,fontWeight:600,
              background:filterType===t?"var(--gold)":"var(--bg3)",color:filterType===t?"#000":"var(--text2)",
              border:`1px solid ${filterType===t?"var(--gold)":"var(--border)"}`,transition:"all 0.2s",textTransform:"capitalize"}}>
              {t}
            </button>
          ))}
        </div>
        {/* Category */}
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{padding:"7px 12px",borderRadius:"var(--r2)",background:"var(--bg3)",color:"var(--text2)",fontSize:13,border:"1px solid var(--border)"}}>
          <option value="all">All Categories</option>
          {allCats.map(c=><option key={c}>{c}</option>)}
        </select>
        <div style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font-mono)",marginLeft:"auto"}}>{filteredTxns.length} result{filteredTxns.length!==1?"s":""}</div>
      </div>

      {/* Table */}
      <div className="fade-up fade-up-2" style={{background:"var(--surface)",borderRadius:"var(--r)",border:"1px solid var(--border)",overflow:"hidden"}}>
        {/* Header */}
        <div style={{display:"grid",gridTemplateColumns:"1.4fr 2fr 1.2fr 1.1fr 1.2fr auto",gap:0,padding:"12px 20px",background:"var(--bg3)",borderBottom:"1px solid var(--border)"}}>
          {[
            {label:"Date",  field:"date"},
            {label:"Description", field:null},
            {label:"Category", field:null},
            {label:"Type", field:null},
            {label:"Amount", field:"amount"},
          ].map(h=>(
            <div key={h.label} onClick={h.field?()=>toggleSort(h.field):undefined}
              style={{fontSize:11,color:"var(--text3)",fontWeight:700,letterSpacing:"0.08em",cursor:h.field?"pointer":"default",userSelect:"none",display:"flex",alignItems:"center"}}>
              {h.label.toUpperCase()}{h.field&&<SortIcon field={h.field}/>}
            </div>
          ))}
          {isAdmin && <div style={{fontSize:11,color:"var(--text3)",fontWeight:700,letterSpacing:"0.08em"}}>ACTIONS</div>}
        </div>
        {/* Rows */}
        {filteredTxns.length === 0 ? (
          <div style={{padding:"48px",textAlign:"center",color:"var(--text3)"}}>
            <div style={{fontSize:32,marginBottom:12}}>⟨ ∅ ⟩</div>
            <div style={{fontSize:14,fontFamily:"var(--font-mono)"}}>No transactions found</div>
          </div>
        ) : filteredTxns.map((t,i) => (
          <div key={t.id} style={{
            display:"grid",gridTemplateColumns:"1.4fr 2fr 1.2fr 1.1fr 1.2fr auto",gap:0,
            padding:"13px 20px",borderBottom:i<filteredTxns.length-1?"1px solid var(--border)":"none",
            transition:"background 0.15s",alignItems:"center"
          }}
            onMouseEnter={e=>e.currentTarget.style.background="var(--surface2)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            <div style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>{fmtDate(t.date)}</div>
            <div style={{fontSize:13,fontWeight:500}}>{t.desc}</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:CATEGORY_COLORS[t.category]||"#888",flexShrink:0}}/>
              <span style={{fontSize:12,color:"var(--text2)"}}>{t.category}</span>
            </div>
            <div>
              <span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:4,
                background:t.type==="income"?"rgba(74,222,128,0.12)":"rgba(255,107,107,0.12)",
                color:t.type==="income"?"var(--green)":"var(--red)"}}>
                {t.type.toUpperCase()}
              </span>
            </div>
            <div style={{fontSize:14,fontWeight:700,fontFamily:"var(--font-mono)",color:t.type==="income"?"var(--green)":"var(--red)"}}>
              {t.type==="income"?"+":"-"}{fmt(t.amount)}
            </div>
            {isAdmin && (
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>openEdit(t)} style={{background:"var(--surface2)",color:"var(--text2)",borderRadius:6,padding:5,display:"flex",transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(167,139,250,0.2)";e.currentTarget.style.color="var(--purple)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="var(--surface2)";e.currentTarget.style.color="var(--text2)";}}><Icon name="edit" size={13}/></button>
                <button onClick={()=>deleteTransaction(t.id)} style={{background:"var(--surface2)",color:"var(--text2)",borderRadius:6,padding:5,display:"flex",transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,107,107,0.15)";e.currentTarget.style.color="var(--red)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="var(--surface2)";e.currentTarget.style.color="var(--text2)";}}><Icon name="delete" size={13}/></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INSIGHTS VIEW ────────────────────────────────────────────────────────────
function InsightsView({ topCat, lastMonth, prevMonth, savingsRate, monthlyData, catData, totalIncome, totalExpense, transactions }) {
  const expenseChange = prevMonth ? ((lastMonth?.expense - prevMonth?.expense)/prevMonth.expense*100).toFixed(1) : null;
  const incomeChange  = prevMonth ? ((lastMonth?.income  - prevMonth?.income) /prevMonth.income *100).toFixed(1) : null;
  const avgMonthlyExpense = monthlyData.length ? (monthlyData.reduce((s,m)=>s+m.expense,0)/monthlyData.length) : 0;
  const avgMonthlyIncome  = monthlyData.length ? (monthlyData.reduce((s,m)=>s+m.income,0) /monthlyData.length) : 0;

  const insights = [
    {
      title:"Top Spending Category",
      value: topCat?.name || "—",
      sub: topCat ? `${fmt(topCat.value)} total spent` : "No expenses yet",
      color:"var(--red)", icon:"down",
      detail: topCat ? `${((topCat.value/totalExpense)*100).toFixed(1)}% of all expenses` : ""
    },
    {
      title:"Savings Rate",
      value: `${savingsRate}%`,
      sub: `${fmt(totalIncome - totalExpense)} saved overall`,
      color: parseFloat(savingsRate) >= 20 ? "var(--green)" : "var(--gold)", icon:"trend_up",
      detail: parseFloat(savingsRate) >= 20 ? "✓ Healthy savings rate" : "⚠ Aim for 20%+"
    },
    {
      title:"Avg Monthly Income",
      value: fmt(avgMonthlyIncome, true),
      sub: fmt(avgMonthlyIncome),
      color:"var(--green)", icon:"trend_up",
      detail: incomeChange ? `${incomeChange>0?"+":""}${incomeChange}% vs prior month` : ""
    },
    {
      title:"Avg Monthly Spend",
      value: fmt(avgMonthlyExpense, true),
      sub: fmt(avgMonthlyExpense),
      color:"var(--red)", icon:"down",
      detail: expenseChange ? `${expenseChange>0?"+":""}${expenseChange}% vs prior month` : ""
    },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Insight cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
        {insights.map((ins,i)=>(
          <div key={ins.title} className={`fade-up fade-up-${i+1}`} style={{background:"var(--surface)",borderRadius:"var(--r)",padding:"20px 22px",border:"1px solid var(--border)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",fontWeight:700,letterSpacing:"0.08em"}}>{ins.title.toUpperCase()}</div>
              <div style={{width:32,height:32,borderRadius:8,background:`${ins.color}18`,display:"flex",alignItems:"center",justifyContent:"center",color:ins.color}}>
                <Icon name={ins.icon} size={15}/>
              </div>
            </div>
            <div style={{fontSize:28,fontWeight:800,color:ins.color,margin:"8px 0 4px",letterSpacing:"-0.5px",fontFamily:"var(--font-mono)"}}>{ins.value}</div>
            <div style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>{ins.sub}</div>
            {ins.detail && <div style={{marginTop:8,fontSize:11,color:"var(--text2)",padding:"6px 10px",background:"var(--surface2)",borderRadius:6}}>{ins.detail}</div>}
          </div>
        ))}
      </div>

      {/* Category spending bar breakdown */}
      <div className="fade-up" style={{background:"var(--surface)",borderRadius:"var(--r)",padding:"22px",border:"1px solid var(--border)"}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Category Breakdown</div>
        <div style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font-mono)",marginBottom:20}}>Relative spending per category</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {catData.map(d=>{
            const pct = (d.value/totalExpense*100).toFixed(1);
            return (
              <div key={d.name}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:CATEGORY_COLORS[d.name]||"#888"}}/>
                    <span style={{fontSize:13,fontWeight:500}}>{d.name}</span>
                  </div>
                  <div style={{fontSize:12,fontFamily:"var(--font-mono)",color:"var(--text2)"}}>
                    {fmt(d.value)} <span style={{color:"var(--text3)"}}>({pct}%)</span>
                  </div>
                </div>
                <div style={{height:6,background:"var(--surface2)",borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:CATEGORY_COLORS[d.name]||"#888",borderRadius:99,transition:"width 0.8s ease"}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly comparison */}
      <div className="fade-up" style={{background:"var(--surface)",borderRadius:"var(--r)",padding:"22px",border:"1px solid var(--border)"}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Monthly Comparison</div>
        <div style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font-mono)",marginBottom:20}}>Income, expense and net balance per month</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} margin={{top:4,right:4,bottom:0,left:-10}} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
            <XAxis dataKey="month" tick={{fill:"var(--text3)",fontSize:11,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"var(--text3)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v,true)}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend formatter={v=><span style={{fontSize:11,color:"var(--text2)",fontFamily:"var(--font-mono)"}}>{v}</span>}/>
            <Bar dataKey="income"  name="Income"  fill="#4ade80" radius={[4,4,0,0]} maxBarSize={24}/>
            <Bar dataKey="expense" name="Expense" fill="#ff6b6b" radius={[4,4,0,0]} maxBarSize={24}/>
            <Bar dataKey="balance" name="Net"     fill="#e8c547" radius={[4,4,0,0]} maxBarSize={24}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}