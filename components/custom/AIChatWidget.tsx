"use client";

import { useI18n } from "@/context/I18nContext";
import { Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type ChatIntent =
  | "PRODUCT_SEARCH"
  | "PRODUCT_LIST"
  | "STORE_INFO"
  | "GENERAL"
  | "UNSAFE";

type ProductTranslation = {
  locale: string;
  name: string;
  description?: string | null;
  slug?: string | null;
};

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  price: number;
  image_url?: string[] | null;
  categories?: Category | null;
  product_translations?: ProductTranslation[];
  similarity?: number;
  rerankScore?: number;
};

type AIResponse = {
  success: boolean;
  data: {
    answer: string;
    intent: ChatIntent;
    products: Product[];
  };
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: ChatIntent;
  products?: Product[];
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { locale } = useI18n();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `
Xin chào! 👋 Tôi có thể giúp bạn tìm bánh, xem menu hoặc trả lời các câu hỏi về cửa hàng.

Hello! 👋 I can help you find cakes, browse the menu, or answer questions about our store.

🌐 Bạn có thể chuyển đổi ngôn ngữ bằng nút ngôn ngữ trên thanh điều hướng.
🌐 You can switch languages using the language toggle in the navbar.
    `.trim(),
      intent: "GENERAL",
      products: [],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Focus input when open chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const getErrorMessage = (locale: "vi" | "en") => {
    return locale === "en"
      ? "Sorry, I can't answer right now. Please try again later."
      : "Xin lỗi, hiện tại tôi không thể trả lời. Vui lòng thử lại sau.";
  };

  const sendMessage = async (e?: FormEvent) => {
    e?.preventDefault();

    const message = input.trim();

    if (!message || isLoading) {
      return;
    }

    // User message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // call api
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const result: AIResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Failed to get AI response");
      }

      let answer = result.data.answer;

      // Hard response for unsafe requests
      if (result.data.intent === "UNSAFE") {
        answer =
          locale === "vi"
            ? "Xin lỗi, tôi không thể cung cấp thông tin nội bộ hoặc thông tin bảo mật của hệ thống."
            : "Sorry, I can't provide internal or confidential system information.";
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        intent: result.data.intent,
        products: result.data.products ?? [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Chat error:", error);

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: getErrorMessage(locale),
        intent: "GENERAL",
        products: [],
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* =========================
          CHAT WINDOW
      ========================== */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 z-[9999]
            
            flex h-[550px] sm:h-[600px] w-[calc(100vw-32px)] max-w-[400px] flex-col
            
            overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl
          "
        >
          {/* =========================
              HEADER
          ========================== */}
          <div className="flex items-center justify-between bg-black px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              {/* AI Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl">
                🤖
              </div>

              <div>
                <h3 className="font-semibold">
                  {locale === "vi" ? "Trợ lý Petit" : "Petit Assistant"}
                </h3>

                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  {locale === "en" ? "Online" : "Trực tuyến"}
                </div>
              </div>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-xl
                transition
                hover:bg-white/10
              "
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* =========================
              MESSAGES
          ========================== */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {/* Message bubble */}
                  <div
                    className={`
                      rounded-2xl
                      px-4
                      py-3
                      text-sm
                      leading-relaxed
                      ${
                        message.role === "user"
                          ? "rounded-br-md bg-black text-white"
                          : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                      }
                    `}
                  >
                    <MessageContent content={message.content} />
                  </div>

                  {/* Products */}
                  {message.role === "assistant" &&
                    message.products &&
                    message.products.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {message.products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* =========================
                LOADING
            ========================== */}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="
                    rounded-2xl
                    rounded-bl-md
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                  "
                >
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                    <span
                      className="
                        h-2
                        w-2
                        animate-bounce
                        rounded-full
                        bg-gray-400
                        [animation-delay:150ms]
                      "
                    />
                    <span
                      className="
                        h-2
                        w-2
                        animate-bounce
                        rounded-full
                        bg-gray-400
                        [animation-delay:300ms]
                      "
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* =========================
              INPUT
          ========================== */}
          <form
            onSubmit={sendMessage}
            className="border-t border-gray-200 bg-white p-3"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder={
                  locale === "en"
                    ? "Ask about our cakes..."
                    : "Hỏi về các loại bánh..."
                }
                className="
                  h-11 flex-1 rounded-full border border-gray-300 bg-gray-50
                  px-4
                  text-sm
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-black
                  focus:bg-white
                "
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-black
                  text-white
                  transition
                  hover:bg-gray-800
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================
          FLOATING CHAT BUTTON
      ========================== */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          fixed
          bottom-6
          right-4
          z-[9999]
          
          flex
          h-14
          w-14
          items-center
          justify-center
          
          rounded-full
          bg-black
          text-2xl
          text-white
          shadow-xl
          
          transition
          duration-200
          hover:scale-105
          hover:bg-gray-800
          active:scale-95
        "
        aria-label="Open AI chat"
      >
        {isOpen ? "×" : "💬"}
      </button>
    </>
  );
}

/* =========================================================
   MESSAGE CONTENT
========================================================= */

function MessageContent({ content }: { content: string }) {
  /**
   * Render một chút Markdown cơ bản.
   *
   * Ví dụ:
   * **10:00 AM**
   *
   * sẽ được render thành:
   * 10:00 AM
   */

  const parts = content.split(/(\*\*.*?\*\*)/g);

  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }

        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ product }: { product: Product }) {
  const { locale } = useI18n();

  const vietnameseTranslation = product.product_translations?.find(
    (item) => item.locale === "vi",
  );

  const englishTranslation = product.product_translations?.find(
    (item) => item.locale === "en",
  );

  // Ưu tiên ngôn ngữ hiện tại
  const translation =
    locale === "vi"
      ? (vietnameseTranslation ?? englishTranslation)
      : (englishTranslation ?? vietnameseTranslation);

  const productName = translation?.name ?? "Product";

  const description = translation?.description ?? "";

  const image = product.image_url?.[0] ?? null;
  const slug = translation?.slug ?? product.id;

  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm">
      {/* Image */}
      {image && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={image}
            alt={productName}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Product name */}
        <h4 className="truncate text-sm font-semibold text-gray-900">
          {productName}
        </h4>

        {/* Description */}
        {description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-gray-500">
            {description}
          </p>
        )}

        {/* Bottom */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className="text-sm font-semibold text-gray-900">
            {product.price.toLocaleString("vi-VN")} VNĐ
          </span>

          <Link
            href={`/menu/${slug}`}
            className="
              shrink-0
              rounded-full
              bg-black
              px-3
              py-1.5
              text-xs
              font-medium
              text-white
              transition
              hover:bg-gray-800
              active:scale-95
            "
          >
            {locale === "vi" ? "Xem bánh" : "View detail"}
          </Link>
        </div>
      </div>
    </div>
  );
}
