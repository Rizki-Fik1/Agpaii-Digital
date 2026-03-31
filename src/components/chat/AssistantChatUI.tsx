"use client";

import React, { useState, useEffect, useRef } from "react";
import TopBar from "@/components/nav/topbar";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/utils/context/auth_context";
import { STUDENT_ROLE_ID, MITRA_ROLE_ID } from "@/constants/student-data";

interface IMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  isHtml?: boolean;
  options?: string[];
  whatsappLink?: boolean;
}

type FAQRole = "guru" | "siswa" | "mitra";

interface IFAQItem {
  question: string;
  answer: string;
  type?: FAQRole | string;
  role?: FAQRole | string;
}

const ADMIN_WA_NUMBER = "628567854448";
const ADMIN_LINK = `https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Admin%20AGPAII%20Digital,%20saya%20butuh%20bantuan.`;

interface Props {
  onClose?: () => void;
  isPopup?: boolean;
}

export default function AssistantChatUI({ onClose, isPopup = false }: Props) {
  const { auth, authLoading } = useAuth();
  
  const roleId = Number(auth?.role_id ?? auth?.role?.id ?? auth?.role);
  const isStudent = roleId === STUDENT_ROLE_ID;
  const isMitra = roleId === MITRA_ROLE_ID;
  const roleType: FAQRole = isStudent ? "siswa" : isMitra ? "mitra" : "guru";

  const [managedQuestions, setManagedQuestions] = useState<IFAQItem[]>([]);
  const [faqLoadDone, setFaqLoadDone] = useState(false);
  const hasManagedFaq = managedQuestions.length > 0;

  const activeQuestions = managedQuestions;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [initDone, setInitDone] = useState(false);

  const normalizeFAQPayload = (raw: any, targetRole: FAQRole): IFAQItem[] => {
    const source = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.items)
      ? raw.items
      : [];

    return source
      .map((item: any) => ({
        question: String(item?.question ?? item?.title ?? "").trim(),
        answer: String(item?.answer ?? item?.content ?? "").trim(),
        type: String(item?.type ?? item?.role ?? "").toLowerCase(),
      }))
      .filter((item: IFAQItem) => item.question && item.answer)
      .filter((item: IFAQItem) => {
        if (!item.type) return true;
        return item.type === targetRole || item.type === "umum";
      });
  };

  useEffect(() => {
    if (authLoading || !auth) return;

    let isCancelled = false;

    const loadManagedFAQ = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;

        const customEndpoint = process.env.NEXT_PUBLIC_ASSISTANT_FAQ_ENDPOINT;
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const baseUrl2 = process.env.NEXT_PUBLIC_API_BASE_URL2;
        const defaultAdminFaqEndpoint = "https://admin.agpaiidigital.org/api/assistant-faqs";

        const endpointCandidates = Array.from(new Set([
          customEndpoint
            ? `${customEndpoint}${customEndpoint.includes("?") ? "&" : "?"}type=${roleType}`
            : null,
          baseUrl ? `${baseUrl}/assistant-faqs?type=${roleType}` : null,
          baseUrl ? `${baseUrl}/assistant/faqs?type=${roleType}` : null,
          baseUrl2 ? `${baseUrl2}/api/assistant-faqs?type=${roleType}` : null,
          `${defaultAdminFaqEndpoint}?type=${roleType}`,
        ].filter(Boolean) as string[]));

        for (const url of endpointCandidates) {
          try {
            const res = await fetch(url, {
              headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : undefined,
            });

            if (!res.ok) continue;
            const json = await res.json();
            const normalized = normalizeFAQPayload(json, roleType);

            if (normalized.length > 0) {
              if (!isCancelled) {
                setManagedQuestions(normalized);
              }
              break;
            }
          } catch {
            // Silent fallback ke hardcoded agar UX tetap jalan.
          }
        }
      } finally {
        if (!isCancelled) {
          setFaqLoadDone(true);
        }
      }
    };

    loadManagedFAQ();

    return () => {
      isCancelled = true;
    };
  }, [authLoading, auth, roleType]);

  useEffect(() => {
    setInitDone(false);
    setMessages([]);
    setExpandedOptions({});
  }, [roleType]);

  useEffect(() => {
    if (authLoading || !auth || initDone || !faqLoadDone) return;

    setMessages([
      {
        id: "msg_intro",
        sender: "bot",
        text: hasManagedFaq
          ? "Halo! Selamat datang di AGPAII Digital 👋\n\nAku Asisten AGPAII yang siap bantu kamu. Kalau ada yang bingung soal aplikasi ini, pilih pertanyaan di bawah ya! 😊\n\nJika punya pertanyaan lain atau butuh bantuan lebih lanjut, kamu bisa langsung menghubungi Admin lewat WhatsApp. 👇"
          : "Halo! Selamat datang di AGPAII Digital 👋\n\nSaat ini daftar FAQ untuk akun kamu belum tersedia. Kamu tetap bisa tanya bebas, atau langsung hubungi Admin lewat WhatsApp ya. 👇",
        options: [
          ...activeQuestions.map((q) => q.question),
          "Hubungi Admin AGPAII (WhatsApp)",
        ],
      },
    ]);
    setInitDone(true);
  }, [authLoading, auth, activeQuestions, initDone, faqLoadDone, hasManagedFaq]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (textObj: string) => {
    if (!textObj.trim()) return;

    const textMsg = textObj.trim();

    setMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        sender: "user",
        text: textMsg,
      },
    ]);

    const foundQA = activeQuestions.find(
      (qa) => qa.question.toLowerCase() === textMsg.toLowerCase()
    );

    setTimeout(() => {
      const isAdminRequest = textMsg.toLowerCase().includes("admin") || textMsg.toLowerCase().includes("hubungi");

      if (foundQA) {
        const botMessages: IMessage[] = [
          {
            id: `bot_${Date.now()}`,
            sender: "bot",
            text: foundQA.answer,
          },
        ];

        if (foundQA.question.toLowerCase().includes("admin")) {
          botMessages[0] = {
            ...botMessages[0],
            whatsappLink: true,
          };
        }

        botMessages.push({
          id: `bot_followup_${Date.now()}`,
          sender: "bot",
          text: "Mau tanya yang lain? Silakan pilih lagi ya! 😊",
          options: [
            ...activeQuestions.map((q) => q.question),
            "Hubungi Admin AGPAII (WhatsApp)",
          ],
        });

        setMessages((prev) => [...prev, ...botMessages]);
      } else if (isAdminRequest) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: "bot",
            text: "Siap! Kamu bisa langsung hubungi tim Admin AGPAII lewat WhatsApp ya. Mereka siap bantu kamu! 💬👇",
            whatsappLink: true,
          },
          {
            id: `bot_followup_${Date.now()}`,
            sender: "bot",
            text: "Atau kalau mau tanya yang lain, pilih aja dari daftar ini ya! 😊",
            options: [
              ...activeQuestions.map((q) => q.question),
              "Hubungi Admin AGPAII (WhatsApp)",
            ],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: "bot",
            text: `Mohon maaf ya 🙏, sepertinya pertanyaan kamu ada diluar daftar nih. Tapi tenang, kamu bisa langsung tanya ke Admin AGPAII lewat WhatsApp! 👇`,
            isHtml: false,
            whatsappLink: true,
          } as any,
          {
            id: `bot_followup_${Date.now()}`,
            sender: "bot",
            text: "Atau kalau mau tanya yang lain, pilih aja dari daftar ini ya! 😊",
            options: [
              ...activeQuestions.map((q) => q.question),
              "Hubungi Admin AGPAII (WhatsApp)",
            ],
          },
        ]);
      }
    }, 500);
  };

  const handleQuickReply = (question: string) => {
    handleSend(question);
  };

  return (
    <div
      className={`${isPopup ? "h-full" : "min-h-screen"} flex flex-col w-full relative`}
      style={{ background: "linear-gradient(180deg, #F0F4F3 0%, #FAFBFC 100%)" }}
    >
      {isPopup ? (
        <div className="flex items-center gap-3 px-4 h-[4.21rem] bg-white border-b border-slate-200 sticky top-0 z-50">
          <button onClick={onClose} className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
             </svg>
          </button>
          <span className="font-semibold text-slate-800 text-[17px]">Asisten AGPAII</span>
        </div>
      ) : (
        <TopBar withBackButton>Asisten AGPAII</TopBar>
      )}

      <div className={`flex-1 overflow-y-auto p-4 md:px-6 space-y-3 pb-24 ${!isPopup ? 'pt-[5.5rem]' : ''}`}>
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="flex-shrink-0 mr-3 hidden sm:block">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#009788] to-teal-800 flex items-center justify-center shadow-sm">
                    <ChatBubbleLeftRightIcon className="size-4 text-white" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[85%] lg:max-w-[90%] px-4 py-2.5 shadow-sm text-sm ${
                  isUser
                    ? "bg-[#009788] text-white rounded-2xl rounded-br-sm"
                    : "bg-white text-slate-700 rounded-2xl rounded-tl-sm border border-slate-100"
                }`}
              >
                {m.isHtml && !isUser ? (
                  <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: m.text }} />
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                )}

                {m.options && !isUser && (() => {
                  const isExpanded = expandedOptions[m.id] || false;
                  const MOBILE_LIMIT = 3;
                  const visibleOptions = isExpanded ? m.options : m.options!.slice(0, MOBILE_LIMIT);
                  const hasMore = m.options!.length > MOBILE_LIMIT;

                  return (
                    <div className="mt-4 flex flex-col gap-2">
                      {visibleOptions.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickReply(opt)}
                          className={`text-left text-[12.5px] px-3 py-2 rounded-xl border font-medium transition-colors ${
                            opt.includes("Admin")
                              ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                              : "bg-teal-50 hover:bg-teal-100 text-[#009788] border-teal-200"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}

                      {hasMore && (
                        <button
                          onClick={() => setExpandedOptions((prev) => ({ ...prev, [m.id]: !isExpanded }))}
                          className="text-center text-[12px] text-slate-400 hover:text-slate-600 font-medium py-1.5 transition-colors"
                        >
                          {isExpanded ? "▲ Sembunyikan" : `▼ Lihat semua (${m.options!.length - MOBILE_LIMIT} lainnya)`}
                        </button>
                      )}
                    </div>
                  );
                })()}

                {(m as any).whatsappLink && !isUser && (
                  <a
                    href={ADMIN_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-[13px] shadow-sm transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Hubungi Admin via WhatsApp
                  </a>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

    </div>
  );
}
