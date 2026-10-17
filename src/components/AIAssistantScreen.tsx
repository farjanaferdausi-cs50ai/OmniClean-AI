import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  Trash2,
  CheckCircle2,
  CornerDownLeft,
  Flame,
  Clock,
  Layers,
  StopCircle,
} from 'lucide-react';
import { ChatMessage, SavedScan, FactoryRecord } from '../types';

interface AIAssistantScreenProps {
  scans: SavedScan[];
  factoryRecords: FactoryRecord[];
}

const SUGGESTED_QUESTIONS = [
  'Which waste grew most this week?',
  'What does the BigQuery summary show for our 30-day recycling rate and hotspots?',
  'How can we cut fabric waste in the cutting department?',
  'What is our current overall recycling rate and CO2e offset?',
  'Are chemical containers and broken needles considered hazardous?',
  'How can cotton and fabric scrap waste be safely segregated?',
];

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({
  scans,
  factoryRecords,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hello! I am the **OmniClean AI Waste Assistant** with live streaming and data grounding.\n\nI have direct access to your saved scans, factory line logs, and BigQuery enterprise summaries. Ask me about waste volumes, circular jhoot recovery, resource intensity, or hazardous segregation protocols!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [bqSummary, setBqSummary] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch('/api/bq/summary?days=30')
      .then((res) => res.json())
      .then((data) => setBqSummary(data))
      .catch(() => setBqSummary(null));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build compact JSON summary for the backend system prompt
  const buildDataSummary = () => {
    const totalScans = scans.length;
    const totalScanWeight = scans.reduce((acc, s) => acc + s.total_weight_kg, 0);
    const totalRecyclableScanWeight = scans.reduce((acc, s) => acc + s.recyclable_weight_kg, 0);
    const totalCo2e = scans.reduce((acc, s) => acc + s.co2e_avoided_kg, 0);

    // Calculate scan date range
    const scanDates = scans.map((s) => s.timestamp.split('T')[0]).sort();
    const scanDateRange = scanDates.length
      ? `${scanDates[0]} to ${scanDates[scanDates.length - 1]}`
      : 'No scans recorded';

    const factoryTotalWeight = factoryRecords.reduce((acc, r) => acc + r.weight_kg, 0);
    const factoryRecycledWeight = factoryRecords.reduce((acc, r) => acc + r.recycled_weight_kg, 0);
    const factoryPieces = factoryRecords.reduce((acc, r) => acc + r.production_pieces, 0);

    const factoryDates = factoryRecords.map((r) => r.date).filter(Boolean).sort();
    const factoryDateRange = factoryDates.length
      ? `${factoryDates[0]} to ${factoryDates[factoryDates.length - 1]}`
      : 'No factory records';

    const depts: Record<string, { weightKg: number; recycledKg: number; pieces: number }> = {};
    factoryRecords.forEach((r) => {
      if (!depts[r.department]) depts[r.department] = { weightKg: 0, recycledKg: 0, pieces: 0 };
      depts[r.department].weightKg += r.weight_kg;
      depts[r.department].recycledKg += r.recycled_weight_kg;
      depts[r.department].pieces += r.production_pieces;
    });

    const categoryScansSummary: Record<string, number> = {};
    scans.forEach((s) => {
      s.items.forEach((item) => {
        categoryScansSummary[item.category] =
          (categoryScansSummary[item.category] || 0) + (Number(item.est_weight_kg) || 0);
      });
    });

    return {
      scansDataset: {
        totalScansCount: totalScans,
        dateRange: scanDateRange,
        totalWeightKg: Number(totalScanWeight.toFixed(2)),
        recyclableWeightKg: Number(totalRecyclableScanWeight.toFixed(2)),
        co2eAvoidedKg: Number(totalCo2e.toFixed(2)),
        categoryBreakdownKg: categoryScansSummary,
        recentScans: scans.slice(0, 10).map((s) => ({
          date: s.timestamp.split('T')[0],
          items: s.items.map((i) => `${i.name} (${i.category}, ${i.est_weight_kg}kg)`).join(', '),
          hazardous: s.items.some((i) => i.hazardous),
        })),
      },
      factoryDataset: {
        totalRowsLogged: factoryRecords.length,
        dateRange: factoryDateRange,
        totalFactoryScrapKg: Number(factoryTotalWeight.toFixed(1)),
        recycledScrapKg: Number(factoryRecycledWeight.toFixed(1)),
        recyclingRatePct:
          factoryTotalWeight > 0 ? Math.round((factoryRecycledWeight / factoryTotalWeight) * 100) : 0,
        totalPiecesProduced: factoryPieces,
        wastePer1000PiecesKpi:
          factoryPieces > 0 ? Number(((factoryTotalWeight / factoryPieces) * 1000).toFixed(1)) : 0,
        departmentBreakdown: depts,
        anomaliesCount: factoryRecords.filter((r) => r.is_anomaly).length,
      },
      bigQuerySummary: bqSummary
        ? {
            connected: bqSummary.connected,
            dataSource: bqSummary.dataSource,
            period: `${bqSummary.periodStart} to ${bqSummary.periodEnd}`,
            overallRecyclingRatePct: bqSummary.overallRecyclingRatePct,
            wasteByType: bqSummary.wasteByType,
            resourceEfficiency: bqSummary.resourceEfficiency,
            topHotspots: bqSummary.topHotspots,
          }
        : null,
    };
  };

  const handleSendMessage = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepare assistant placeholder message for streaming
    const assistantMsgId = `ast-${Date.now() + 1}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setInputQuery('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const summary = buildDataSummary();
      // Keep last 6 messages as context (excluding the active empty placeholder)
      const contextMessages = messages.slice(-6);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: query,
          dataSummary: summary,
          conversationHistory: contextMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataContent = line.slice(6).trim();
            if (dataContent === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, text: accumulatedText, is_demo: parsed.is_demo }
                      : m
                  )
                );
              } else if (parsed.error) {
                accumulatedText += `\n\n*(Notice: ${parsed.error})*`;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsgId ? { ...m, text: accumulatedText } : m))
                );
              }
            } catch {
              // Ignore partial JSON parse chunks
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('Streaming chat error:', err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text:
                    m.text.trim() ||
                    "I had trouble connecting to the backend assistant stream. Please ensure the dev server is active or try asking again.",
                }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Chat conversation reset. What would you like to examine in your waste data?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              OmniClean AI Streaming Assistant
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Token Streaming & Grounded
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Maintains the last 6 messages as context. Always cites the exact scans, weights, and dates used.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Conversation
        </button>
      </div>

      {/* Suggested Questions Chips */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          Suggested Questions:
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isStreaming}
              className="text-xs text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition-all text-left disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200/70 text-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Render Text */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.text ? (
                    msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('•') || paragraph.startsWith('-') || paragraph.startsWith('1.')) {
                        return (
                          <div key={pIdx} className="pl-1 space-y-1">
                            {paragraph.split('\n').map((line, lIdx) => (
                              <p key={lIdx} className="leading-relaxed">
                                {line}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return <p key={pIdx}>{paragraph}</p>;
                    })
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 py-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-100" />
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-200" />
                    </div>
                  )}
                </div>

                <div
                  className={`mt-2 text-[10px] flex items-center justify-between ${
                    isUser ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.is_demo && (
                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">
                      demo fallback
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask a question citing your waste data (e.g., 'What was our total scrap in Cutting?')..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isStreaming}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        {isStreaming ? (
          <button
            onClick={handleStopStream}
            className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-xs active:scale-95 shrink-0 flex items-center gap-1 text-xs font-semibold"
            title="Stop generating response"
          >
            <StopCircle className="w-4 h-4" /> Stop
          </button>
        ) : (
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isStreaming}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xs disabled:opacity-40 active:scale-95 shrink-0"
            title="Send Question"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
