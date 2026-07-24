"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiRequest, User } from "@/lib/portal";
import { usePortalLanguage } from "./PortalChrome";

type AuthMode = "login" | "register";

const text = {
  en: {
    loginEyebrow: "Welcome back",
    registerEyebrow: "Join the pilot",
    loginTitle: "Sign in to your account",
    registerTitle: "Create your account",
    loginText: "Access your saved sustainability content and account details.",
    registerText:
      "Create a pilot account to save content and take part in the feedback loop.",
    displayName: "Display name",
    email: "Email address",
    password: "Password",
    login: "Sign in",
    register: "Create account",
    noAccount: "New to the platform?",
    haveAccount: "Already have an account?",
    goRegister: "Go to registration",
    goLogin: "Go to sign in",
    privacy:
      "This is a student project beta. Do not reuse a sensitive password.",
  },
  zh: {
    loginEyebrow: "欢迎回来",
    registerEyebrow: "参与平台试点",
    loginTitle: "登录你的账号",
    registerTitle: "创建新账号",
    loginText: "登录后可查看收藏内容和账号信息。",
    registerText: "创建试点账号后，可收藏内容并参与平台反馈闭环。",
    displayName: "显示名称",
    email: "邮箱地址",
    password: "密码",
    login: "登录",
    register: "创建账号",
    noAccount: "第一次使用本平台？",
    haveAccount: "已经拥有账号？",
    goRegister: "前往注册页面",
    goLogin: "前往登录页面",
    privacy: "本账号系统用于学生项目测试，请勿复用其他重要账号的密码。",
  },
} as const;

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const { language } = usePortalLanguage();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const t = text[language];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setMessage("");

    try {
      const data = await apiRequest<{
        access_token: string;
        user: User;
        message: string;
      }>(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: JSON.stringify(
          mode === "login"
            ? { email, password }
            : { email, password, display_name: displayName },
        ),
      });
      window.localStorage.setItem("sx_token", data.access_token);
      window.localStorage.setItem("sx_user", JSON.stringify(data.user));
      setMessage(data.message);
      window.setTimeout(() => {
        window.location.href = "/account";
      }, 500);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setWorking(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <section className="authRouteLayout">
      <div className="authRouteIntro">
        <p className="eyebrow">
          {isLogin ? t.loginEyebrow : t.registerEyebrow}
        </p>
        <h1>{isLogin ? t.loginTitle : t.registerTitle}</h1>
        <p>{isLogin ? t.loginText : t.registerText}</p>
        <div className="authSwitchCard">
          <span>{isLogin ? t.noAccount : t.haveAccount}</span>
          <Link href={isLogin ? "/account/register" : "/account/login"}>
            {isLogin ? t.goRegister : t.goLogin}
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>

      <form className="authCard authStandalone" onSubmit={submit}>
        {!isLogin && (
          <label>
            <span>{t.displayName}</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>
        )}
        <label>
          <span>{t.email}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          <span>{t.password}</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={8}
            required
          />
        </label>
        <button type="submit" disabled={working}>
          {isLogin ? t.login : t.register}
          <span aria-hidden="true"> &rarr;</span>
        </button>
        {message && <p className="authMessage">{message}</p>}
        <p className="privacyNote">{t.privacy}</p>
      </form>
    </section>
  );
}
