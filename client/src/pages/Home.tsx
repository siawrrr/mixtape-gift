import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Copy,
  ExternalLink,
  Eye,
  Gift,
  GripVertical,
  Heart,
  Layers,
  Link2,
  Mail,
  Menu,
  Music,
  Package,
  Pencil,
  Play,
  Plus,
  RotateCw,
  Save,
  Search,
  Send,
  Sparkles,
  Star,
  Sticker,
  Trash2,
  Undo2,
  Upload,
  Volume2,
  VolumeX,
  Wand2,
  X,
  Zap,
} from "lucide-react";

type Tab = "body" | "label" | "songs" | "stickers" | "bedazzle" | "letter" | "background";
type View = "home" | "studio" | "gift" | "shelf";
type CassetteBody = { id: string; name: string; color: string; tape: string; finish: string; label: string; skin?: string };
type Song = { id: number; title: string; artist: string; side: "A" | "B"; duration: string; url?: string; artwork?: string };
type Deco = { id: number; type: "sticker" | "gem"; icon: string; name: string; x: number; y: number; rotate: number; scale: number; text?: string };

const bodies: CassetteBody[] = [
  { id: "skin-01", name: "Pink memory", color: "#e7a6b2", tape: "#5b3432", finish: "original", label: "#f9d9c6", skin: "/manus-storage/skin-01_2690c0b7.jpg" },
  { id: "skin-02", name: "Mint mock-up", color: "#d8e4c8", tape: "#493f36", finish: "original", label: "#e8efdc", skin: "/manus-storage/skin-02_827a7264.jpg" },
  { id: "skin-03", name: "Neo-tape", color: "#d6c4b5", tape: "#2d2626", finish: "original", label: "#eadfd5", skin: "/manus-storage/skin-03_c977edef.jpg" },
  { id: "skin-04", name: "Retro teal", color: "#248b86", tape: "#183a3b", finish: "original", label: "#e6b4bc", skin: "/manus-storage/skin-04_6c0516c9.jpg" },
  { id: "skin-05", name: "Side A pink", color: "#292928", tape: "#191919", finish: "original", label: "#e7a8be", skin: "/manus-storage/skin-05_710a69ef.jpg" },
  { id: "skin-06", name: "Poolside teal", color: "#55bfc2", tape: "#2e918f", finish: "original", label: "#e9f1d9", skin: "/manus-storage/skin-06_02fb8b6f.jpg" },
  { id: "skin-07", name: "Compact cream", color: "#e7ddc1", tape: "#443b31", finish: "original", label: "#f5e9c6", skin: "/manus-storage/skin-07_3fcc2205.jpg" },
  { id: "skin-08", name: "Audio life", color: "#292b2b", tape: "#30302f", finish: "original", label: "#ead7e1", skin: "/manus-storage/skin-08_8f165afb.jpg" },
  { id: "skin-09", name: "Sound track", color: "#d9b98a", tape: "#44362b", finish: "original", label: "#e9f0da", skin: "/manus-storage/skin-09_e01c0d55.jpg" },
  { id: "skin-10", name: "Green archive", color: "#9da85f", tape: "#3f3930", finish: "original", label: "#d8dbaa", skin: "/manus-storage/skin-10_dabf9226.jpg" },
  { id: "rose", name: "Rose blush", color: "#e9a5a5", tape: "#5b3432", finish: "matte", label: "#f9d9c6" },
  { id: "butter", name: "Butter note", color: "#e8cf8f", tape: "#5a453d", finish: "soft", label: "#f5e9b6" },
];

const starterSongs: Song[] = [
  { id: 1, title: "Pink + White", artist: "Frank Ocean", side: "A", duration: "3:04", url: "https://open.spotify.com/track/3xKsf9qdS1CyvXSMEid6g8" },
  { id: 2, title: "Bags", artist: "Clairo", side: "A", duration: "4:20", url: "https://open.spotify.com/track/6UFivO2zqqPFPoQYsEMuCc" },
  { id: 3, title: "Glue Song", artist: "beabadoobee", side: "A", duration: "2:15", url: "https://open.spotify.com/track/3VsuWSjtxgIV3uY6Jfba3u" },
  { id: 4, title: "Fade Into You", artist: "Mazzy Star", side: "B", duration: "4:55", url: "https://open.spotify.com/track/1LzNfuep1bnAUR9skqdHCK" },
];

const stickerOptions = [
  { icon: "♥", name: "heart" },
  { icon: "✿", name: "flower" },
  { icon: "✦", name: "sparkle" },
  { icon: "☁", name: "cloud" },
  { icon: "★", name: "star" },
  { icon: "♡", name: "love" },
  { icon: "✎", name: "note" },
  { icon: "〰", name: "wave" },
];

const gemOptions = [
  { icon: "◆", name: "ruby" },
  { icon: "✦", name: "diamond" },
  { icon: "●", name: "pearl" },
  { icon: "✧", name: "glitter" },
  { icon: "♥", name: "tiny heart" },
  { icon: "✺", name: "star gem" },
];

const backgrounds = [
  { id: "desk", label: "Craft desk", className: "bg-desk" },
  { id: "pink", label: "Pink paper", className: "bg-pink" },
  { id: "blue", label: "Poolside", className: "bg-blue" },
  { id: "night", label: "Late night", className: "bg-night" },
  { id: "checker", label: "Diner check", className: "bg-checker" },
];

const randomTitles = ["RAINY NIGHT MIXTAPE", "SUMMER 2007", "SONGS FOR THE TRAIN", "A LITTLE SOMETHING", "LOVE LETTER VOL. 01"];

function AppButton({ children, onClick, variant = "primary", className = "", type = "button" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "outline" | "ghost" | "small" | "dark"; className?: string; type?: "button" | "submit" }) {
  return <button type={type} onClick={onClick} className={`app-button ${variant} ${className}`}>{children}</button>;
}

function MiniTape({ body, flipped = false, open = false, onClick }: { body: CassetteBody; flipped?: boolean; open?: boolean; onClick?: () => void }) {
  return (
    <button aria-label="Interactive cassette preview" className={`tape-wrap ${flipped ? "is-flipped" : ""} ${open ? "is-open" : ""}`} onClick={onClick}>
      <div className={`cassette ${body.skin ? "cassette-with-skin" : ""}`} style={{ "--tape-body": body.color, "--tape-reel": body.tape, "--tape-label": body.label } as React.CSSProperties}>
        {body.skin ? <img className="cassette-skin-image" src={body.skin} alt={body.name} /> : <>
          <div className="cassette-shine" />
          <div className="screw screw-one" /><div className="screw screw-two" /><div className="screw screw-three" /><div className="screw screw-four" />
          <div className="window"><div className="tape-strip" /><div className="reel reel-left"><span /></div><div className="reel reel-right"><span /></div></div>
          <div className="cassette-label">
            <span className="label-kicker">REC. 28•09•26</span>
            <strong>SONGS THAT<br />REMIND ME OF YOU</strong>
            <span className="label-foot">SIDE A / SIDE B&nbsp;&nbsp; VOL. 01</span>
          </div>
          <div className="cassette-notch notch-left" /><div className="cassette-notch notch-right" />
        </>}
      </div>
    </button>
  );
}

function Header({ view, setView, onCreate }: { view: View; setView: (view: View) => void; onCreate: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="site-header">
      <button className="brand" onClick={() => setView("home")} aria-label="Go home">
        <span className="brand-mark"><Music size={16} /></span><span>mixtape<span className="brand-dot">.</span>gift</span>
      </button>
      <nav className={`main-nav ${mobileOpen ? "open" : ""}`}>
        <button className={view === "home" ? "active" : ""} onClick={() => { setView("home"); setMobileOpen(false); }}>home</button>
        <button onClick={() => { setView("shelf"); setMobileOpen(false); }}>my cassettes</button>
        <button onClick={() => { document.getElementById("how")?.scrollIntoView({ behavior: "smooth" }); setMobileOpen(false); }}>how it works</button>
      </nav>
      <div className="header-actions"><button className="sound-pill" aria-label="Sound is off"><VolumeX size={14} /> sound off</button><AppButton variant="small" onClick={onCreate}><Plus size={14} /> make a cassette</AppButton></div>
      <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
    </header>
  );
}

function Hero({ onCreate, onExplore }: { onCreate: () => void; onExplore: () => void }) {
  return (
    <section className="hero section-pad">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> a little something, made by you <span className="eyebrow-heart">♡</span></div>
        <h1>Make a<br /><em>mixtape.</em></h1>
        <p className="hero-lede">Songs, stickers, memories<br className="desktop-break" /> and a little piece of you.</p>
        <div className="hero-actions"><AppButton onClick={onCreate}>make a cassette <ArrowRight size={16} /></AppButton><AppButton variant="outline" onClick={onExplore}>explore the magic <Sparkles size={15} /></AppButton></div>
        <div className="hero-footnote"><span>no audio files. just feelings.</span><span className="doodle-arrow">↗</span></div>
      </div>
      <div className="hero-stage">
        <div className="hero-sticker sticker-top">made<br />with<br /><b>love</b></div>
        <div className="hero-note note-one">for late<br />night drives <span>⌁</span></div>
        <div className="hero-tape-shadow" />
        <div className="hero-tape"><MiniTape body={bodies[0]} /></div>
        <div className="hero-sparkle s-one">✦</div><div className="hero-sparkle s-two">✧</div><div className="hero-sparkle s-three">⋆</div>
        <div className="hero-label-tag"><span>01</span><span>the songs<br />i couldn't say</span></div>
      </div>
      <div className="hero-scroll"><span>scroll to wander</span><div className="scroll-line" /></div>
    </section>
  );
}

function HowItWorks({ onCreate }: { onCreate: () => void }) {
  return (
    <section id="how" className="how section-pad">
      <div className="section-heading"><div><span className="kicker">the ritual</span><h2>Made for the<br /><em>meaningful</em> stuff.</h2></div><p>It takes three tiny steps<br />to make something big.</p></div>
      <div className="steps">
        {[{ no: "01", icon: <Music size={23} />, title: "pick your songs", copy: "Add Spotify links, choose a side, and build the soundtrack." }, { no: "02", icon: <Sticker size={23} />, title: "make it yours", copy: "Dress up the tape with stickers, doodles, colors and little surprises." }, { no: "03", icon: <Gift size={23} />, title: "give it away", copy: "Write a note, wrap it up, and send a tiny piece of your heart." }].map((step) => <div className="step-card" key={step.no}><span className="step-no">{step.no}</span><div className="step-icon">{step.icon}</div><h3>{step.title}</h3><p>{step.copy}</p><span className="step-dash">—</span></div>)}
      </div>
      <div className="how-cta"><span>your next favorite gift is one click away</span><AppButton variant="dark" onClick={onCreate}>start making <ArrowRight size={15} /></AppButton></div>
    </section>
  );
}

function Footer() {
  return <footer className="footer section-pad"><div className="footer-brand"><span className="brand-mark"><Music size={15} /></span><strong>mixtape.gift</strong><p>Digital mixtapes for<br />people who feel a lot.</p></div><div className="footer-links"><span>made with a little chaos + a lot of love</span><span>© 2026 / keep rewinding</span></div><div className="footer-doodle">✷</div></footer>;
}

function CassetteCanvas({ body, decorations, selectedDeco, setSelectedDeco, labelTitle, recipient }: { body: CassetteBody; decorations: Deco[]; selectedDeco: number | null; setSelectedDeco: (id: number | null) => void; labelTitle: string; recipient: string }) {
  return <div className="canvas-wrap"><div className="canvas-grid" /><div className="canvas-ruler ruler-top">01&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;02&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;03&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;04&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;05</div><div className="canvas-ruler ruler-side">A<br /><br />B<br /><br />C<br /><br />D<br /><br />E</div><div className="canvas-note">drag your little<br />bits around ↗</div><div className="studio-tape-position"><MiniTape body={body} /></div><div className="studio-label-copy"><span>{recipient ? `for ${recipient}` : "for someone special"}</span><b>{labelTitle || "songs that remind me of you"}</b></div>{decorations.map((deco) => <button key={deco.id} aria-label={`Select ${deco.name}`} className={`canvas-deco ${deco.type} ${selectedDeco === deco.id ? "selected" : ""}`} style={{ left: `${deco.x}%`, top: `${deco.y}%`, transform: `rotate(${deco.rotate}deg) scale(${deco.scale})` }} onClick={() => setSelectedDeco(selectedDeco === deco.id ? null : deco.id)}>{deco.text || deco.icon}</button>)}</div>;
}

function Studio({ onBack, onGift }: { onBack: () => void; onGift: (songs: Song[], title: string, recipient: string, letter: string, body: CassetteBody, decorations: Deco[]) => void }) {
  const [tab, setTab] = useState<Tab>("body");
  const [body, setBody] = useState(bodies[0]);
  const [title, setTitle] = useState("songs that remind me of you");
  const [recipient, setRecipient] = useState("Maya");
  const [sender, setSender] = useState("your favorite person");
  const [occasion, setOccasion] = useState("just because");
  const [letter, setLetter] = useState("Hey Maya,\n\nI didn't really know how to say this, so I made you a cassette instead.\n\nListen to Side A when you miss me.\n\nLove,\nMe ♡");
  const [songs, setSongs] = useState<Song[]>(starterSongs);
  const [spotifyLink, setSpotifyLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [decorations, setDecorations] = useState<Deco[]>([
    { id: 1, type: "sticker", icon: "♥", name: "heart", x: 30, y: 23, rotate: -12, scale: 1 },
    { id: 2, type: "sticker", icon: "✦", name: "sparkle", x: 71, y: 69, rotate: 13, scale: 1 },
    { id: 3, type: "gem", icon: "◆", name: "ruby", x: 77, y: 30, rotate: 18, scale: 0.9 },
  ]);
  const [selectedDeco, setSelectedDeco] = useState<number | null>(null);
  const [background, setBackground] = useState("desk");
  const [soundOn, setSoundOn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const totalDuration = useMemo(() => songs.reduce((acc, song) => acc + (song.duration === "3:04" ? 184 : song.duration === "4:20" ? 260 : song.duration === "2:15" ? 135 : 295), 0), [songs]);
  const mins = Math.floor(totalDuration / 60);
  const secs = String(totalDuration % 60).padStart(2, "0");

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200); };
  const pushHistory = (message: string) => setHistory((items) => [message, ...items].slice(0, 5));
  const addDeco = (option: { icon: string; name: string; text?: string }, type: "sticker" | "gem") => { const id = Date.now(); setDecorations((items) => [...items, { id, type, icon: option.icon, name: option.name, text: option.text, x: 20 + Math.random() * 60, y: 20 + Math.random() * 60, rotate: -15 + Math.random() * 30, scale: type === "gem" ? 0.7 + Math.random() * 0.4 : 0.8 + Math.random() * 0.35 }]); setSelectedDeco(id); pushHistory(`added ${option.name}`); notify(`${option.name} placed on the tape`); };
  const randomize = () => { const nextBody = bodies[Math.floor(Math.random() * bodies.length)]; const nextTitle = randomTitles[Math.floor(Math.random() * randomTitles.length)]; setBody(nextBody); setTitle(nextTitle); setBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)].id); setDecorations(stickerOptions.slice(0, 3).map((item, index) => ({ id: Date.now() + index, type: "sticker", icon: item.icon, name: item.name, x: 25 + index * 24, y: 25 + (index % 2) * 42, rotate: -10 + index * 8, scale: 0.9 }))); notify("a little surprise, coming right up ✦"); };
  const addSong = async (song?: Song) => {
    if (songs.length >= 8) { notify("your tape is full of feelings"); return; }
    let next = song;
    if (!next && spotifyLink.trim()) {
      notify("looking up that Spotify link…");
      try {
        const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyLink.trim())}`);
        if (!response.ok) throw new Error("Spotify lookup failed");
        const metadata = await response.json();
        let title = metadata.title || "Untitled track";
        let artist = metadata.author_name && !/spotify/i.test(metadata.author_name) ? metadata.author_name : "";
        let artwork = metadata.thumbnail_url;
        if (!artist || artist === "Spotify artist") {
          try {
            const pageResponse = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(spotifyLink.trim())}`);
            const pageMetadata = await pageResponse.json();
            const description = pageMetadata?.data?.description || "";
            const parts = description.split(" · ");
            if (parts[0]) artist = parts[0];
            if (pageMetadata?.data?.title) title = pageMetadata.data.title;
            if (pageMetadata?.data?.image?.url) artwork = pageMetadata.data.image.url;
          } catch {
            // Keep the Spotify oEmbed title when the secondary metadata service is unavailable.
          }
        }
        next = { id: Date.now(), title, artist: artist || "Artist unavailable", side: songs.filter((s) => s.side === "A").length < 4 ? "A" : "B", duration: "3:30", url: spotifyLink.trim(), artwork };
        notify(`${next.title} by ${next.artist} added ✦`);
      } catch {
        next = { id: Date.now(), title: "Spotify link added", artist: "Metadata unavailable", side: songs.filter((s) => s.side === "A").length < 4 ? "A" : "B", duration: "3:30", url: spotifyLink.trim() };
        notify("Spotify kept the link, but metadata was unavailable");
      }
    }
    if (!next) next = { id: Date.now(), title: "New favorite", artist: "Add an artist", side: songs.filter((s) => s.side === "A").length < 4 ? "A" : "B", duration: "3:30" };
    setSongs((items) => [...items, next!]); setSpotifyLink(""); pushHistory(`added ${next.title}`);
  };
  const moveSong = (index: number, direction: number) => { setSongs((items) => { const copy = [...items]; const nextIndex = index + direction; if (nextIndex < 0 || nextIndex >= copy.length) return copy; [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]]; return copy; }); };
  const deleteSong = (id: number) => { setSongs((items) => items.filter((song) => song.id !== id)); notify("song removed"); };
  const addStickerText = () => { addDeco({ icon: "FOR YOU", name: "for you", text: "FOR YOU" }, "sticker"); };

  const selectedItem = decorations.find((item) => item.id === selectedDeco);
  const tabItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "body", label: "body", icon: <Package size={15} /> }, { id: "label", label: "label", icon: <Pencil size={15} /> }, { id: "songs", label: "songs", icon: <Music size={15} /> }, { id: "stickers", label: "stickers", icon: <Sticker size={15} /> }, { id: "bedazzle", label: "bedazzle", icon: <Sparkles size={15} /> }, { id: "letter", label: "letter", icon: <Mail size={15} /> }, { id: "background", label: "background", icon: <Layers size={15} /> },
  ];

  return <div className="studio-page">
    <div className="studio-topbar"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> back to the desk</button><div className="studio-title"><span className="kicker">the mixtape studio</span><strong>make it a little more you.</strong></div><div className="studio-top-actions"><button className={`icon-button ${soundOn ? "selected" : ""}`} onClick={() => setSoundOn(!soundOn)}>{soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}</button><button className="icon-button" onClick={() => { setSaved(true); notify("saved to your little shelf"); }}><Save size={16} /></button><AppButton variant="small" onClick={() => onGift(songs, title, recipient, letter, body, decorations)}>give cassette <Gift size={14} /></AppButton></div></div>
    <div className="studio-stepper"><span className="done"><Check size={12} /> pick a tape</span><span className="current"><span>02</span> make it yours</span><span><span>03</span> give it away</span></div>
    <main className="studio-layout">
      <aside className="tool-rail"><div className="rail-label">make<br />some<br />magic</div>{tabItems.map((item) => <button key={item.id} className={`tool-tab ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}><span className="tool-icon">{item.icon}</span><span>{item.label}</span>{item.id === "songs" && <b>{songs.length}</b>}</button>)}<div className="rail-bottom"><button className="rail-mini" onClick={randomize}><Wand2 size={16} /><span>surprise<br />me</span></button><div className="rail-undo"><button onClick={() => notify(history.length ? `undo ${history[0]}` : "nothing to undo")}><Undo2 size={14} /></button><button onClick={() => notify("redo is waiting patiently")}>↪</button></div></div></aside>
      <section className={`studio-canvas ${backgrounds.find((item) => item.id === background)?.className || "bg-desk"}`}><div className="canvas-header"><span>untitled mixtape / vol. 01</span><span className="canvas-status"><span className="status-dot" /> auto-saved {saved ? "just now" : "a few seconds ago"}</span></div><CassetteCanvas body={body} decorations={decorations} selectedDeco={selectedDeco} setSelectedDeco={setSelectedDeco} labelTitle={title} recipient={recipient} /><div className="canvas-footer"><button onClick={() => setSelectedDeco(null)}><Eye size={14} /> preview</button><span>click the tape to flip it</span><span>canvas 05 × 07</span></div></section>
      <aside className="control-panel"><div className="panel-heading"><div><span className="kicker">edit your tape</span><h2>{tab === "body" ? "choose your body" : tab === "label" ? "write the label" : tab === "songs" ? "fill the sides" : tab === "stickers" ? "stick it on" : tab === "bedazzle" ? "make it shine" : tab === "letter" ? "write a letter" : "set the scene"}</h2></div><button className="close-panel" onClick={() => setTab("body")}><ChevronRight size={16} /></button></div>
        {tab === "body" && <div className="panel-content"><p className="panel-copy">Start with the feeling. Every tape has a slightly different little personality.</p><div className="body-grid">{bodies.map((item) => <button key={item.id} className={`body-option ${body.id === item.id ? "selected" : ""}`} onClick={() => { setBody(item); notify(`${item.name} is on the desk`); }}><span className="body-swatch" style={{ background: item.color }}>{item.skin ? <img src={item.skin} alt="" className="body-skin-thumb" /> : <><span className="swatch-window" style={{ background: item.tape }} /><span className="swatch-label" style={{ background: item.label }} /></>}</span><span>{item.name}</span>{body.id === item.id && <Check size={13} />}</button>)}</div><div className="finish-row"><span>finish</span><div className="finish-chips"><button className="chip selected">matte</button><button className="chip">gloss</button><button className="chip">frosted</button></div></div><div className="panel-callout"><Sparkles size={16} /><span><strong>tip from the craft desk</strong><br />a little imperfection makes it feel yours.</span></div></div>}
        {tab === "label" && <div className="panel-content form-stack"><label>cassette title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="songs that remind me of you" /></label><label>made for<input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="their name" /></label><label>made by<input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="your name" /></label><div className="two-fields"><label>occasion<select value={occasion} onChange={(e) => setOccasion(e.target.value)}><option>just because</option><option>birthday</option><option>friendship</option><option>love</option><option>missing you</option><option>thank you</option></select></label><label>volume<input defaultValue="01" /></label></div><div className="label-preview"><span>REC. 28•09•26</span><strong>{title || "your title here"}</strong><em>made by {sender || "you"}</em></div><div className="label-tip"><Bookmark size={14} /> slight tilt: on <span>↗</span></div></div>}
        {tab === "songs" && <div className="panel-content song-panel"><div className="spotify-add"><div className="spotify-head"><span className="spotify-logo">●</span><strong>add from Spotify</strong><span className="spotify-beta">public lookup</span></div><div className="link-input"><Link2 size={14} /><input value={spotifyLink} onChange={(e) => setSpotifyLink(e.target.value)} placeholder="paste a Spotify track link" /><button onClick={() => addSong()}><Plus size={14} /> add</button></div><p>We save the link, never the audio. <CircleHelp size={13} /></p></div><div className="song-search"><Search size={14} /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="search your little heart out" /></div>{searchTerm && <div className="search-result"><div className="album-art art-sun">☼</div><div><strong>{searchTerm}</strong><span>search result / Spotify link</span></div><button onClick={() => addSong({ id: Date.now(), title: searchTerm, artist: "your search result", side: "A", duration: "3:30", url: "https://open.spotify.com" })}><Plus size={15} /></button></div>}<div className="side-heading"><span>side a <b>{songs.filter((s) => s.side === "A").length}</b></span><span>18:42 / 22:30</span></div><div className="song-list">{songs.map((song, index) => <div className="song-row" key={song.id}><GripVertical size={13} className="drag-handle" /><span className="track-no">{String(index + 1).padStart(2, "0")}</span><div className={`album-art ${song.artwork ? "has-artwork" : ""}`} style={song.artwork ? { backgroundImage: `url(${song.artwork})` } : undefined}>{song.artwork ? null : (index % 2 === 0 ? "✦" : "◒")}</div><div className="song-meta"><strong>{song.title}</strong><span>{song.artist}</span></div><span className="song-duration">{song.duration}</span><button className="song-move" onClick={() => moveSong(index, -1)}><ChevronUpTiny /></button><button className="song-move" onClick={() => moveSong(index, 1)}><ChevronDown size={12} /></button><button className="song-delete" onClick={() => deleteSong(song.id)}><Trash2 size={13} /></button></div>)}</div><div className="song-side-row"><span>side b <b>{songs.filter((s) => s.side === "B").length}</b></span><button onClick={() => { const id = songs.find((s) => s.side === "A")?.id; if (id) setSongs((items) => items.map((s) => s.id === id ? { ...s, side: "B" } : s)); }}>move a song here <ArrowRight size={13} /></button></div><div className="capacity"><span>tape length <strong>C45</strong></span><span><b>{mins}:{secs}</b> / 45:00</span></div></div>}
        {tab === "stickers" && <div className="panel-content"><p className="panel-copy">The good stuff. Drag a sticker from the drawer onto your tape.</p><div className="drawer-label">love notes & little things</div><div className="sticker-drawer">{stickerOptions.map((item) => <button className="sticker-option" key={item.name} onClick={() => addDeco(item, "sticker")}><span>{item.icon}</span><small>{item.name}</small></button>)}<button className="sticker-option text-sticker" onClick={addStickerText}><span>FOR<br />YOU</span><small>message</small></button></div><div className="selected-tools"><span>selected layer</span>{selectedDeco ? <>
          {selectedItem?.type === "sticker" && selectedItem.text !== undefined && <label className="sticker-edit-label">sticker message<input className="sticker-message-input" value={selectedItem.text} onChange={(e) => setDecorations((items) => items.map((item) => item.id === selectedDeco ? { ...item, text: e.target.value, icon: e.target.value || "FOR YOU" } : item))} /></label>}
          <div className="sticker-rotate-row"><RotateCw size={14} /><span>rotate</span><input aria-label="Rotate selected sticker" type="range" min="-180" max="180" value={selectedItem?.rotate ?? 0} onChange={(e) => setDecorations((items) => items.map((item) => item.id === selectedDeco ? { ...item, rotate: Number(e.target.value) } : item))} /><output>{Math.round(selectedItem?.rotate ?? 0)}°</output></div>
          <button onClick={() => { setDecorations((items) => items.map((item) => item.id === selectedDeco ? { ...item, rotate: item.rotate - 15 } : item)); }}><RotateCw size={14} /> -15°</button><button onClick={() => { setDecorations((items) => items.map((item) => item.id === selectedDeco ? { ...item, rotate: item.rotate + 15 } : item)); }}><RotateCw size={14} /> +15°</button><button onClick={() => { setDecorations((items) => items.map((item) => item.id === selectedDeco ? { ...item, scale: item.scale + 0.1 } : item)); }}><Plus size={14} /> scale</button><button onClick={() => { setDecorations((items) => items.filter((item) => item.id !== selectedDeco)); setSelectedDeco(null); }}><Trash2 size={14} /> delete</button>
        </> : <em>click a sticker on the canvas</em>}</div><div className="layer-row"><button onClick={() => notify("brought it forward")}>bring forward</button><button onClick={() => notify("sent it back")}>send back</button><button onClick={() => notify("duplicated the selected layer")}>duplicate</button></div></div>}
        {tab === "bedazzle" && <div className="panel-content"><p className="panel-copy">Tiny physical-feeling sparkle, placed imperfectly on purpose.</p><div className="gem-tray">{gemOptions.map((item) => <button key={item.name} onClick={() => addDeco(item, "gem")}><span>{item.icon}</span><small>{item.name}</small></button>)}</div><div className="bedazzle-card"><div className="gem-orbit"><span>✦</span><span>◆</span><span>●</span></div><strong>bedazzle responsibly</strong><p>A few well-placed gems go a long way. Unless it's your tape — then more is more.</p></div><div className="selected-tools"><span>selected gem</span><em>{selectedDeco ? "ready to tweak" : "click a gem on the canvas"}</em></div></div>}
        {tab === "letter" && <div className="panel-content letter-panel"><div className="letter-paper"><span className="letter-date">28 / 09 / 26</span><textarea value={letter} onChange={(e) => setLetter(e.target.value)} /><span className="letter-corner">♡</span></div><div className="letter-controls"><span>paper: <b>soft cream</b></span><span>ink: <b>blue black</b></span></div><button className="postcard-button" onClick={() => notify("letter tucked in with the tape")}>✉ tuck it in</button><p className="panel-note">Your letter is optional. The best ones usually start with “I didn't know how to say this…”</p></div>}
        {tab === "background" && <div className="panel-content"><p className="panel-copy">Set the mood around the little object. The tape stays the star.</p><div className="background-grid">{backgrounds.map((item) => <button key={item.id} className={`background-option ${item.className} ${background === item.id ? "selected" : ""}`} onClick={() => setBackground(item.id)}><span>{item.id === "desk" ? "✎" : item.id === "pink" ? "♡" : item.id === "blue" ? "☁" : item.id === "night" ? "✦" : "▦"}</span><small>{item.label}</small>{background === item.id && <Check size={13} />}</button>)}</div><label className="upload-box"><Upload size={16} /><span>upload your own background</span><small>jpg, png / optional</small><input type="file" accept="image/*" onChange={() => notify("custom background ready for your next version")} /></label><div className="background-note"><span>✷</span> keep it cozy — busy backgrounds can steal the show.</div></div>}
        <div className="panel-bottom"><span>{tab === "songs" ? `${songs.length} songs / ${mins}:${secs}` : tab === "letter" ? `${letter.length} characters` : "changes are saved"}</span><button onClick={() => notify("fresh start coming right up")}><RotateCw size={13} /> reset</button></div>
      </aside>
    </main>
    {toast && <div className="toast"><Check size={14} /> {toast}</div>}
  </div>;
}

function ChevronUpTiny() { return <ChevronUpIcon />; }
function ChevronUpIcon() { return <span className="chevron-up">⌃</span>; }

function GiftView({ data, onBack }: { data: { songs: Song[]; title: string; recipient: string; letter: string; body: CassetteBody; decorations: Deco[] }; onBack: () => void }) {
  const [opened, setOpened] = useState(false);
  const [cassetteOpen, setCassetteOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [toast, setToast] = useState("");
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 2200); };
  const openSpotify = (url?: string) => { if (url) window.open(url, "_blank", "noopener,noreferrer"); else notify("Spotify link coming from the maker"); };
  return <div className={`gift-page ${opened ? "opened" : ""}`}><div className="gift-grain" /><header className="gift-header"><button className="brand" onClick={onBack}><span className="brand-mark"><Music size={16} /></span><span>mixtape<span className="brand-dot">.</span>gift</span></button><span className="gift-mark">a little something for {data.recipient || "you"} ♡</span><button className="sound-pill"><VolumeX size={14} /> sound off</button></header>{!opened ? <main className="gift-envelope"><div className="mail-stamp">FOR<br /><b>{data.recipient || "YOU"}</b></div><div className="gift-postmark">✦ 28 · 09 · 26 ✦</div><span className="gift-kicker">you got something</span><h1>A mixtape,<br /><em>made just for you.</em></h1><p>There are songs in here.<br />And maybe a few things left unsaid.</p><button className="open-gift" onClick={() => setOpened(true)}><span>open gift</span><Gift size={19} /></button><span className="gift-from">from {"your favorite person"} <Heart size={12} fill="currentColor" /></span></main> : <main className="gift-open-state"><div className="gift-intro"><span className="gift-kicker">the envelope is open</span><h1>here's your<br /><em>little mixtape.</em></h1><p>Take your time. It was made slowly.</p></div><div className="gift-object"><div className="gift-wrap-shadow" /><div className="gift-bow">⌁</div><div className="gift-cassette"><MiniTape body={data.body} flipped={cassetteOpen} open={cassetteOpen} onClick={() => setCassetteOpen(!cassetteOpen)} />{data.decorations.slice(0, 2).map((d) => <span key={d.id} className="gift-deco" style={{ left: `${d.x}%`, top: `${d.y}%` }}>{d.icon}</span>)}</div><span className="gift-object-note">{cassetteOpen ? "side a / side b" : "tap the tape to open"}</span></div><div className="gift-actions"><button className="gift-action-card" onClick={() => { setCassetteOpen(true); notify("the reels are turning ✦"); }}><span className="action-icon"><Music size={20} /></span><span><strong>open cassette</strong><small>reveal the tracklist</small></span><ArrowRight size={15} /></button><button className={`gift-action-card ${letterOpen ? "active" : ""}`} onClick={() => setLetterOpen(!letterOpen)}><span className="action-icon"><Mail size={20} /></span><span><strong>{letterOpen ? "close letter" : "read letter"}</strong><small>a few words for you</small></span><ArrowRight size={15} /></button></div>{cassetteOpen && <div className="recipient-tracklist"><div className="recipient-heading"><span className="gift-kicker">the songs</span><h2>{data.title}</h2><span className="recipient-rule" /></div><div className="recipient-columns"><div><span className="side-label">side a</span>{data.songs.filter((s) => s.side === "A").map((song, i) => <button className="recipient-song" key={song.id} onClick={() => openSpotify(song.url)}><span>{String(i + 1).padStart(2, "0")}</span><strong>{song.title}</strong><small>{song.artist}</small><ExternalLink size={13} /></button>)}</div><div><span className="side-label">side b</span>{data.songs.filter((s) => s.side === "B").map((song, i) => <button className="recipient-song" key={song.id} onClick={() => openSpotify(song.url)}><span>{String(i + 1).padStart(2, "0")}</span><strong>{song.title}</strong><small>{song.artist}</small><ExternalLink size={13} /></button>)}{data.songs.filter((s) => s.side === "B").length === 0 && <span className="empty-side">a blank side, waiting for a sequel.</span>}</div></div><p className="spotify-note"><span className="spotify-logo">●</span> taps open in Spotify · no audio is stored here</p></div>}{letterOpen && <div className="recipient-letter"><div className="letter-tape">WASHI TAPE</div><span className="letter-date">28 / 09 / 26</span><div className="recipient-letter-copy">{data.letter.split("\n").map((line, i) => <p key={i}>{line || "\u00a0"}</p>)}</div><span className="letter-heart">♡</span></div>}<div className="gift-bottom"><button onClick={onBack}><ArrowLeft size={14} /> make one of your own</button><button onClick={() => { navigator.clipboard?.writeText(window.location.href); notify("link copied — pass it on"); }}><Copy size={14} /> share this gift</button></div></main>}{toast && <div className="toast gift-toast"><Check size={14} /> {toast}</div>}</div>;
}

function Shelf({ onBack, onCreate }: { onBack: () => void; onCreate: () => void }) {
  return <div className="shelf-page"><Header view="shelf" setView={(view) => view === "home" && onBack()} onCreate={onCreate} /><main className="shelf-main"><div className="shelf-heading"><div><span className="kicker">the little archive</span><h1>my cassette<br /><em>collection.</em></h1></div><AppButton onClick={onCreate}><Plus size={15} /> make a new one</AppButton></div><div className="shelf-grid">{[bodies[0], bodies[2], bodies[4]].map((body, index) => <div className="shelf-card" key={body.id}><div className="shelf-card-top"><span>00{index + 1}</span><span>{index === 0 ? "just now" : index === 1 ? "12 days ago" : "last summer"}</span></div><MiniTape body={body} /><div className="shelf-card-copy"><strong>{["songs that remind me of you", "summer 2007", "for rainy nights"][index]}</strong><span>made for {index === 0 ? "Maya" : index === 1 ? "Jules" : "my future self"}</span><small>♡ {index === 0 ? "4" : "7"} songs</small></div></div>)}</div><div className="shelf-empty"><span>✷</span><p>Every good collection starts with one.</p><button onClick={onCreate}>add another little story <ArrowRight size={14} /></button></div></main></div>;
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [giftData, setGiftData] = useState({ songs: starterSongs, title: "songs that remind me of you", recipient: "Maya", letter: "Hey Maya,\n\nI didn't really know how to say this, so I made you a cassette instead.\n\nListen to Side A when you miss me.\n\nLove,\nMe ♡", body: bodies[0], decorations: [] as Deco[] });
  if (view === "studio") return <Studio onBack={() => setView("home")} onGift={(songs, title, recipient, letter, body, decorations) => { setGiftData({ songs, title, recipient, letter, body, decorations }); setView("gift"); }} />;
  if (view === "gift") return <GiftView data={giftData} onBack={() => setView("home")} />;
  if (view === "shelf") return <Shelf onBack={() => setView("home")} onCreate={() => setView("studio")} />;
  return <div className="home-page"><Header view="home" setView={setView} onCreate={() => setView("studio")} /><Hero onCreate={() => setView("studio")} onExplore={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })} /><HowItWorks onCreate={() => setView("studio")} /><Footer /></div>;
}
