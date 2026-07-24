"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@/lib/portal";
import { usePortalLanguage } from "./PortalChrome";

const text = {
  en: {
    eyebrow: "Your sustainability space",
    title: "Account centre",
    intro:
      "Sign in or register on a dedicated page. Once signed in, you can save articles and manage your participation.",
    login: "Sign in",
    loginText: "Return to an existing pilot account.",
    register: "Create account",
    registerText: "Register a new account for the platform test.",
    signedIn: "You are signed in",
    role: "Account type",
    favorites: "View saved content",
    signOut: "Sign out",
  },
  zh: {
    eyebrow: "你的可持续发展空间",
    title: "个人中心",
    intro:
      "登录和注册现已分别使用独立页面。登录后可以收藏文章并管理参与记录。",
    login: "登录",
    loginText: "使用已有试点账号进入平台。",
    register: "创建账号",
    registerText: "为本次平台测试注册新账号。",
    signedIn: "你已登录",
    role: "账号类型",
    favorites: "查看收藏内容",
    signOut: "退出登录",
  },
} as const;

export default function AccountOverview() {
  const { language } = usePortalLanguage();
  const [user, setUser] = useState<User | null>(null);
  const t = text[language];

  useEffect(() => {
    const timer = window.setTimeout(() => {
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

  function signOut() {
    window.localStorage.removeItem("sx_token");
    window.localStorage.removeItem("sx_user");
    setUser(null);
    window.location.reload();
  }

  return (
    <section className="accountOverview">
      <div className="accountOverviewIntro">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </div>

      {user ? (
        <article className="profileCard routePanel">
          <span className="profileAvatar">
            {user.display_name.slice(0, 1).toUpperCase()}
          </span>
          <p className="eyebrow">{t.signedIn}</p>
          <h2>{user.display_name}</h2>
          <p>{user.email}</p>
          <dl>
            <div>
              <dt>{t.role}</dt>
              <dd>{user.role}</dd>
            </div>
          </dl>
          <Link className="primaryCta" href="/search">
            {t.favorites} <span aria-hidden="true">&rarr;</span>
          </Link>
          <button className="secondaryButton" type="button" onClick={signOut}>
            {t.signOut}
          </button>
        </article>
      ) : (
        <div className="accountChoiceGrid">
          <Link className="accountChoice" href="/account/login">
            <span>01</span>
            <h2>{t.login}</h2>
            <p>{t.loginText}</p>
            <strong aria-hidden="true">&rarr;</strong>
          </Link>
          <Link className="accountChoice" href="/account/register">
            <span>02</span>
            <h2>{t.register}</h2>
            <p>{t.registerText}</p>
            <strong aria-hidden="true">&rarr;</strong>
          </Link>
        </div>
      )}
    </section>
  );
}
