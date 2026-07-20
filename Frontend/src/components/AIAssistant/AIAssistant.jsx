import { useState, useRef, useEffect } from "react";
import "./AIAssistant.css";

const BASE_URL = "http://localhost:8080/api/v1.0";

const SUGGESTED_QUESTIONS = [
    "📈 Highest Selling Product",
    "📦 Lowest Stock",
    "💰 Today's Revenue",
    "➕ More"
];

const AIAssistant = ({ dashboardData, inventoryData }) => {
    const [open, setOpen]         = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true); // just added
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Hi! I'm your CartIQ AI assistant. Ask me anything about your sales, inventory, or orders — or pick a question below." ,
    time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    }
    ]);
    const [input, setInput]       = useState("");
    const [loading, setLoading]   = useState(false);
    const bottomRef               = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    const buildContext = () => {
        if (!dashboardData) return "No dashboard data available.";
        const d   = dashboardData;
        const inv = inventoryData || [];

        const lowestStock = [...inv].sort((a,b) =>
            (a.stockQuantity ?? 999) - (b.stockQuantity ?? 999))[0];
        const outOfStock = inv.filter(i => (i.stockQuantity ?? 1) <= 0)
            .map(i => i.name).join(", ") || "None";
        const lowStock = inv.filter(i => (i.stockQuantity ?? 1) > 0 && (i.stockQuantity ?? 1) <= 5)
            .map(i => `${i.name} (${i.stockQuantity} left)`).join(", ") || "None";

        return `
SALES SUMMARY:
- Today's Sales: ₹${d.todaySales?.toFixed(2) || 0}
- Today's Orders: ${d.todayOrderCount || 0}
- Month Sales: ₹${d.monthSales?.toFixed(2) || 0}
- Month Orders: ${d.monthOrderCount || 0}

PAYMENT BREAKDOWN:
${d.paymentBreakdown?.map(p => `- ${p.method}: ${p.count} orders totalling ₹${p.totalAmount?.toFixed(2)}`).join('\n') || "No data"}

7-DAY TREND:
${d.weeklyTrend?.map(t => `- ${t.date}: ₹${t.totalAmount?.toFixed(2)} (${t.orderCount} orders)`).join('\n') || "No data"}

RECENT ORDERS (last 5):
${d.recentOrders?.slice(0,5).map(o => `- ${o.customerName}: ₹${o.grandTotal} via ${o.paymentMethod} — ${o.paymentDetails?.status}`).join('\n') || "No data"}

INVENTORY (all items):
${inv.map(i => `- ${i.name} | Category: ${i.categoryName} | Price: ₹${i.price} | Stock: ${i.stockQuantity ?? 'unknown'}`).join('\n') || "No inventory data"}

STOCK ALERTS:
- Out of stock items: ${outOfStock}
- Low stock items (≤5): ${lowStock}
- Lowest stock item: ${lowestStock ? `${lowestStock.name} with ${lowestStock.stockQuantity} units` : "N/A"}
        `.trim();
    };

    const sendMessage = async (text) => {
        setShowSuggestions(false); // just addedd
        const userText = (text || input).trim();
        if (!userText || loading) return;
        setInput("");
        setMessages(prev => [...prev, { role: "user", 
            text: userText,
            time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
     }
    ]);
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${BASE_URL}/ai/ask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    question: userText,
                    context: buildContext()
                })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant",
                 text: data.answer ,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }]);
        } catch (e) {
            console.error("AI error:", e);
            setMessages(prev => [...prev, {
                role: "assistant",
                text: " Unable to contact the AI service. Please check the backend logs.",
                 time: new Date().toLocaleTimeString([], {
                 hour: "2-digit",
                 minute: "2-digit"
             })
            }
        ]);
        } finally {
            setLoading(false);
        }
    };

    console.log(messages); // just added
    return (
        <>
            {/* FAB — bigger robot icon */}
            <button className="ai-fab" onClick={() => setOpen(o => !o)} title="CartIQ AI Assistant">
                {open
                    ? <i className="bi bi-x-lg" style={{ fontSize: "1.4rem" }}></i>
                    : <i className="bi bi-robot" style={{ fontSize: "1.8rem" }}></i>
                }
            </button>

            {open && (
                <div className="ai-panel">
                    <div className="ai-header">
                        <div className="ai-header-icon">
                            <i className="bi bi-robot"></i>
                        </div>
                        <div>
                            <div className="ai-header-title">CartIQ AI Assistant</div>
                            <div className="ai-header-sub">Powered by Gemini</div>
                        </div>
                        <button className="ai-close" onClick={() => setOpen(false)}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <div className="ai-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`ai-msg ${m.role}`}>
                                {m.role === "assistant" && (
                                    <div className="ai-avatar">
                                        <i className="bi bi-robot"></i>
                                    </div>
                                )}
                                <div className="ai-bubble">{m.text}
                                     <div className="ai-time">
                                        {m.time}
                                      </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="ai-msg assistant">
                                <div className="ai-avatar"><i className="bi bi-robot"></i></div>
                                <div className="ai-bubble ai-typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef}></div>
                    </div>
                {showSuggestions && ( // just added
                    <div className="ai-suggestions">
                        {SUGGESTED_QUESTIONS.map((q, i) => (
                            <button key={i} className="ai-suggest-btn"
                                onClick={() => sendMessage(q)}
                                disabled={loading}>
                                {q}
                            </button>
                        ))}
                    </div>)}

                    <div className="ai-input-row">
                        <input className="ai-input"
                            placeholder="Ask about sales, stock, orders..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && sendMessage()}
                            disabled={loading} />
                        <button className="ai-send-btn"
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}>
                            <i className="bi bi-send-fill"></i>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAssistant;
