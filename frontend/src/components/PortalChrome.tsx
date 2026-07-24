"use client";

import Link from "next/link";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Language, User } from "@/lib/portal";

const navigation = [
  { path: "/", en: "Home", zh: "首页" },
  { path: "/news", en: "News", zh: "校园动态" },
  { path: "/blogs", en: "Blogs", zh: "专题文章" },
  { path: "/get-involved", en: "Get Involved", zh: "参与行动" },
  { path: "/topics", en: "SDG Topics", zh: "可持续发展目标" },
  { path: "/about", en: "About Us", zh: "关于平台" },
] as const;

const chromeText = {
  en: {
    account: "Sign in / Register",
    search: "Search",
    footerTitle: "XJTLU Sustainability Knowledge Platform",
    beta: "Student Project Beta",
    disclaimer:
      "Pilot site for research and user testing. Content is for testing purposes and does not represent official XJTLU communications.",
  },
  zh: {
    account: "登录 / 注册",
    search: "搜索",
    footerTitle: "西交利物浦大学可持续发展知识平台",
    beta: "学生项目测试版",
    disclaimer:
      "本网站仅用于项目研究和用户测试，所展示内容不代表西交利物浦大学官方信息发布。",
  },
} as const;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => undefined,
});

export function usePortalLanguage() {
  return useContext(LanguageContext);
}

export function BrandMark() {
  return (
    <span className="brandMark">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" />
        <path d="M32 12v40M32 43c-12-6-16-17-9-27 9 4 14 12 9 27ZM32 37c9-11 17-14 25-8-3 10-11 14-25 8Z" />
      </svg>
    </span>
  );
}

export default function PortalChrome({
  activePath,
  children,
}: {
  activePath: string;
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>("en");
  const [user, setUser] = useState<User | null>(null);
  const t = chromeText[language];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedLanguage = window.localStorage.getItem("sx_language");
      if (savedLanguage === "en" || savedLanguage === "zh") {
        setLanguageState(savedLanguage);
      }

      const savedUser = window.localStorage.getItem("sx_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          window.localStorage.removeItem("sx_user");
        }
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("sx_language", nextLanguage);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <main>
        <header className="siteHeader">
          <Link className="brand" href="/" aria-label="Sustainable XJTLU home">
            <BrandMark />
            <span>
              Sustainable
              <br />
              XJTLU
            </span>
          </Link>

          <nav className="mainNav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link
                className={activePath === item.path ? "active" : ""}
                href={item.path}
                key={item.path}
              >
                {language === "en" ? item.en : item.zh}
              </Link>
            ))}
          </nav>

          <div className="headerTools">
            <Link className="searchIcon" href="/search" aria-label={t.search}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 5 5" />
              </svg>
            </Link>
            <button
              className="languageToggle"
              type="button"
              onClick={() => setLanguage(language === "en" ? "zh" : "en")}
              aria-label={
                language === "en" ? "切换为中文" : "Switch to English"
              }
            >
              {language === "en" ? "中文" : "EN"}
            </button>
            <Link className="accountLink" href="/account">
              {user ? user.display_name : t.account}
            </Link>
          </div>
        </header>

        {children}

        <footer className="siteFooter">
          <Link className="footerBrand" href="/" aria-label="Back to home">
            <BrandMark />
            <span>
              <strong>{t.footerTitle}</strong>
              <small>{t.beta}</small>
            </span>
          </Link>
          <p>{t.disclaimer}</p>
          <nav aria-label="Footer navigation">
            <Link href="/">{language === "en" ? "Home" : "首页"}</Link>
            <Link href="/topics">
              {language === "en" ? "SDG Topics" : "可持续发展目标"}
            </Link>
            <Link href="/about">
              {language === "en" ? "About Us" : "关于平台"}
            </Link>
            <Link href="/account">
              {language === "en" ? "Account" : "个人中心"}
            </Link>
          </nav>
        </footer>
      </main>
    </LanguageContext.Provider>
  );
}
