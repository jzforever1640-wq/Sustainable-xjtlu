"use client";

import { useMemo, useState } from "react";

type Content = { type: "News" | "Blog" | "Activity"; title: string; summary: string; topic: string; date: string };

const topics = [
  ["Environment", "leaf"], ["Sustainable Campus", "building"], ["Education", "cap"],
  ["Community", "people"], ["Climate Action", "globe"], ["Energy", "bolt"],
];

const content: Content[] = [
  { type: "News", title: "XJTLU community recognised for a greener campus", summary: "New student-led initiatives are creating measurable change across the university.", topic: "Sustainable Campus", date: "12 Jul 2026" },
  { type: "Activity", title: "Campus Repair Café", summary: "Bring a well-loved item and learn how to give it a longer life.", topic: "Community", date: "08 Aug 2026" },
  { type: "Blog", title: "Finding more nature in the middle of campus", summary: "How biodiversity can thrive alongside a growing university.", topic: "Environment", date: "18 Jun 2026" },
  { type: "Blog", title: "What does learning for the future look like?", summary: "Connecting ideas, disciplines and people around shared challenges.", topic: "Education", date: "06 Jun 2026" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All");
  const [language, setLanguage] = useState<"EN" | "中文">("EN");
  const [menuOpen, setMenuOpen] = useState(false);
  const filtered = useMemo(() => content.filter((item) =>
    (topic === "All" || item.topic === topic) &&
    `${item.title} ${item.summary} ${item.topic}`.toLowerCase().includes(query.toLowerCase()),
  ), [query, topic]);

  return <main>
    <header className="header">
      <a className="brand" href="#top"><span className="brandMark">✦</span><span>Sustainable<br/><b>XJTLU</b></span></a>
      <button className="menuButton" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">☰</button>
      <nav className={menuOpen ? "nav show" : "nav"}>
        <a href="#top">Home</a><a href="#stories">News</a><a href="#stories">Blogs</a><a href="#get-involved">Get involved</a><a href="#topics">SDG Topics</a><a href="#about">About us</a>
      </nav>
      <div className="tools"><a href="#search" aria-label="Search">⌕</a><button onClick={() => setLanguage(language === "EN" ? "中文" : "EN")}>{language}</button></div>
    </header>

    <section className="hero" id="top">
      <div className="heroCopy"><p className="eyebrow">University sustainability</p><h1>Sustainable <span>XJTLU</span></h1><p>Discover how our university community drives positive change through education, research, and action.</p><a className="primary" href="#get-involved">Get involved <b>→</b></a></div>
      <div className="heroArt"><h2>Together for<br/>a better world.</h2><div className="sun"/><div className="cloud one"/><div className="cloud two"/><div className="campus"><i/><i/><i/><i/><i/><i/></div><div className="treeLine"><span/><span/><span/><span/><span/></div></div>
    </section>

    <section className="section" id="topics"><div className="sectionHead"><div><p className="eyebrow">Shared challenges, shared progress</p><h2>Explore by SDG Topics</h2></div><a href="#search">View all topics →</a></div><div className="topicGrid">{topics.map(([name, icon]) => <button key={name} className={topic === name ? "topic selected" : "topic"} onClick={() => { setTopic(topic === name ? "All" : name); document.getElementById("search")?.scrollIntoView({behavior:"smooth"}); }}><span className={`topicIcon ${icon}`}>{icon === "leaf" ? "⌁" : icon === "building" ? "▥" : icon === "cap" ? "⌂" : icon === "people" ? "◌" : icon === "globe" ? "◎" : "ϟ"}</span><b>{name}</b></button>)}</div></section>

    <section className="section featureGrid" id="get-involved"><article><span>01</span><h3>News</h3><p>Latest updates and announcements on sustainability at XJTLU.</p><a href="#stories">Explore news →</a></article><article><span>02</span><h3>Blogs</h3><p>Insights and stories from our community on sustainable living and innovation.</p><a href="#stories">Explore blogs →</a></article><article><span>03</span><h3>Get involved</h3><p>Join activities, projects and initiatives to make a real impact.</p><a href="#stories">Explore opportunities →</a></article></section>

    <section className="section searchSection" id="search"><div className="searchIntro"><p className="eyebrow">Discover more</p><h2>Search our content</h2><p>Find news, blogs, activities and more related to sustainability at XJTLU.</p></div><div className="searchControls"><label><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stories, activities and topics"/></label><select value={topic} onChange={(e) => setTopic(e.target.value)}><option>All</option>{topics.map(([name]) => <option key={name}>{name}</option>)}</select></div></section>

    <section className="section stories" id="stories"><div className="sectionHead"><div><p className="eyebrow">From the community</p><h2>{topic === "All" ? "Latest stories" : topic}</h2></div><span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span></div><div className="storyGrid">{filtered.map((item, index) => <article key={item.title} className="story"><div className={`storyArt art${index + 1}`}><small>{item.type}</small><strong>0{index + 1}</strong></div><div><span className="tag">{item.topic}</span><h3>{item.title}</h3><p>{item.summary}</p><time>{item.date}</time><a href="#about">Read story →</a></div></article>)}</div>{!filtered.length && <p className="empty">No matching content yet. Try another search or topic.</p>}</section>

    <section className="about" id="about"><div><p className="eyebrow">Built for action</p><h2>One place to discover, participate and improve.</h2></div><p>This preview represents the rewritten Sustainable XJTLU platform: a clear public interface today, ready to connect with the Flask API, PostgreSQL content library and future SDG intelligence pipeline.</p></section>
    <footer><a className="brand" href="#top"><span className="brandMark">✦</span><span>Sustainable<br/><b>XJTLU</b></span></a><span>Preview of the new platform architecture · 2026</span></footer>
  </main>;
}
