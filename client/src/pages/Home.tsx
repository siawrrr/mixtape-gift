import { useEffect, useMemo, useRef, useState } from "react";
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

type Tab = "body" | "label" | "songs" | "stickers" | "bedazzle" | "effects" | "letter" | "background";
type View = "home" | "studio" | "gift" | "shelf";
type SkinCategory = "Vintage" | "Rock" | "Gothic" | "Y2K" | "Dreamy" | "Punk" | "Minimal";
type CassetteBody = { id: string; name: string; color: string; tape: string; finish: string; label: string; category?: SkinCategory; skin?: string };
type Song = { id: number; title: string; artist: string; side: "A" | "B"; duration: string; url?: string; artwork?: string };
type Deco = { id: number; type: "sticker" | "gem"; icon: string; name: string; x: number; y: number; rotate: number; scale: number; text?: string };
type Effect = { id: string; label: string; intensity: number };
type CassetteRecord = { id: string; title: string; recipient: string; letter: string; body: CassetteBody; songs: Song[]; decorations: Deco[]; effects: Effect[]; createdAt: string; updatedAt: string; favorite?: boolean; tags?: string[]; playCount?: number };

async function fetchSpotifyTrackMetadata(url: string): Promise<Pick<Song, "title" | "artist" | "duration" | "artwork">> {
  const oembedResponse = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
  if (!oembedResponse.ok) throw new Error("Spotify oEmbed lookup failed");
  const oembed = await oembedResponse.json();
  let title = oembed.title || "Untitled track";
  let artist = "";
  let artwork = oembed.thumbnail_url as string | undefined;
  let duration = "3:30";

  // Spotify oEmbed intentionally omits the artist. Its public embed entity
  // includes the same title, artists, artwork, and duration shown in Spotify.
  try {
    const trackId = url.match(/track[/:]([A-Za-z0-9]+)/)?.[1];
    if (trackId) {
      const embedResponse = await fetch(`https://open.spotify.com/embed/track/${trackId}`);
      if (embedResponse.ok) {
        const html = await embedResponse.text();
        const nextData = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
        const entity = nextData ? JSON.parse(nextData)?.props?.pageProps?.state?.data?.entity : undefined;
        if (entity) {
          title = entity.title || entity.name || title;
          artist = entity.artists?.map((item: { name?: string }) => item.name).filter(Boolean).join(", ") || "";
          duration = entity.duration ? `${Math.floor(entity.duration / 60000)}:${String(Math.floor(entity.duration / 1000) % 60).padStart(2, "0")}` : duration;
          artwork = entity.album?.images?.[0]?.url || artwork;
        }
        if (!artist) artist = html.match(/class="[^"]*text-link[^"]*">([^<]+)<\/a>/)?.[1] || "";
      }
    }
  } catch {
    // Keep oEmbed title/artwork if the embed page is temporarily unavailable.
  }
  if (!artist) {
    const pageResponse = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    if (pageResponse.ok) {
      const pageMetadata = await pageResponse.json();
      artist = pageMetadata?.data?.author || "";
      title = pageMetadata?.data?.title || title;
      artwork = pageMetadata?.data?.image?.url || artwork;
    }
  }
  if (!artist) throw new Error("Spotify artist metadata unavailable");
  return { title, artist, duration, artwork };
}

const bodies: CassetteBody[] = [
  { id: "skin-01", name: "Cherry pop", color: "#ef9aa9", tape: "#6b303d", finish: "original", label: "#ffd7d6" },
  { id: "skin-02", name: "Matcha doodle", color: "#c9dfb5", tape: "#3e5140", finish: "original", label: "#eff6d5" },
  { id: "skin-03", name: "Y2K chrome", color: "#cbd1d8", tape: "#424b58", finish: "original", label: "#f0f2f5" },
  { id: "skin-04", name: "Pool club", color: "#62c7ca", tape: "#1b5d63", finish: "original", label: "#d9f4e8" },
  { id: "skin-05", name: "Cowgirl pink", color: "#303033", tape: "#18181c", finish: "original", label: "#f3aabd" },
  { id: "skin-06", name: "Blueberry gel", color: "#9db9ed", tape: "#3d4e83", finish: "original", label: "#dfe7ff" },
  { id: "skin-07", name: "Vanilla bow", color: "#ead9ad", tape: "#6a5037", finish: "original", label: "#fff1bf" },
  { id: "skin-08", name: "Midnight club", color: "#303547", tape: "#171a29", finish: "original", label: "#d5b9ed" },
  { id: "skin-09", name: "Tangerine crush", color: "#efb269", tape: "#873d2f", finish: "original", label: "#ffe7a9" },
  { id: "skin-10", name: "Olive archive", color: "#a9b86e", tape: "#414a32", finish: "original", label: "#e7edb5" },
  { id: "rose", name: "Rose blush", color: "#e9a5a5", tape: "#5b3432", finish: "matte", label: "#f9d9c6" },
  { id: "butter", name: "Butter note", color: "#e8cf8f", tape: "#5a453d", finish: "soft", label: "#f5e9b6" },
  { id: "vintage-cream", name: "Cream cassette", color: "#d8c8a7", tape: "#675547", finish: "worn", label: "#f3e6bd", category: "Vintage" },
  { id: "vintage-orange", name: "Dusty orange", color: "#c8794d", tape: "#542f2c", finish: "worn", label: "#edc28b", category: "Vintage" },
  { id: "rock-metal", name: "Black metal", color: "#46484c", tape: "#17191d", finish: "chrome", label: "#aeb5ba", category: "Rock" },
  { id: "rock-red", name: "Redline riot", color: "#a53e42", tape: "#2c1b20", finish: "matte", label: "#e8d2c1", category: "Rock" },
  { id: "gothic-burgundy", name: "Burgundy rose", color: "#4e2638", tape: "#1e1822", finish: "velvet", label: "#c99da7", category: "Gothic" },
  { id: "gothic-silver", name: "Silver thorn", color: "#77717d", tape: "#292630", finish: "chrome", label: "#d7c9d7", category: "Gothic" },
  { id: "y2k-clear", name: "Bubble plastic", color: "#9ad7d5", tape: "#526b92", finish: "clear", label: "#dff5f2", category: "Y2K" },
  { id: "y2k-lilac", name: "Holo lilac", color: "#c6a8dc", tape: "#544d86", finish: "iridescent", label: "#f2d5f2", category: "Y2K" },
  { id: "dreamy-cloud", name: "Cloud nine", color: "#b9d9e7", tape: "#5c7594", finish: "pearl", label: "#eef7f1", category: "Dreamy" },
  { id: "dreamy-lavender", name: "Lavender sleep", color: "#cbbbdc", tape: "#5b4b75", finish: "soft", label: "#f3e6f0", category: "Dreamy" },
  { id: "punk-copy", name: "Photocopy punk", color: "#e7e1d2", tape: "#27262b", finish: "paper", label: "#f8f1d6", category: "Punk" },
  { id: "minimal-white", name: "Clean slate", color: "#e7e4dc", tape: "#5b6065", finish: "matte", label: "#fcf9ee", category: "Minimal" },
];

const skinCategories: Array<"All" | SkinCategory> = ["All", "Vintage", "Rock", "Gothic", "Y2K", "Dreamy", "Punk", "Minimal"];
const skinCategoryFor = (body: CassetteBody): SkinCategory => body.category || (body.id.startsWith("skin-") ? "Y2K" : body.id === "rose" || body.id === "butter" ? "Dreamy" : "Minimal");

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
const collectionKey = "mixtape-gift.collection.v1";
const draftKey = "mixtape-gift.draft.v1";
const readCollection = (): CassetteRecord[] => { try { return JSON.parse(localStorage.getItem(collectionKey) || "[]"); } catch { return []; } };
const writeCollection = (items: CassetteRecord[]) => localStorage.setItem(collectionKey, JSON.stringify(items));

function AppButton({ children, onClick, variant = "primary", className = "", type = "button" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "outline" | "ghost" | "small" | "dark"; className?: string; type?: "button" | "submit" }) {
  return <button type={type} onClick={onClick} className={`app-button ${variant} ${className}`}>{children}</button>;
}

function MiniTape({ body, flipped = false, open = false, onClick }: { body: CassetteBody; flipped?: boolean; open?: boolean; onClick?: () => void }) {
  return (
    <button aria-label="Interactive cassette preview" className={`tape-wrap ${flipped ? "is-flipped" : ""} ${open ? "is-open" : ""}`} onClick={onClick}>
      <div className={`cassette cassette-${body.id}`} style={{ "--tape-body": body.color, "--tape-reel": body.tape, "--tape-label": body.label } as React.CSSProperties}>
        <div className="cassette-skin-accent" aria-hidden="true" />
          <div className="cassette-shine" />
          <div className="screw screw-one" /><div className="screw screw-two" /><div className="screw screw-three" /><div className="screw screw-four" />
          <div className="window"><div className="tape-strip" /><div className="reel reel-left"><span /></div><div className="reel reel-right"><span /></div></div>
          <div className="cassette-label">
            <span className="label-kicker">REC. 28•09•26</span>
            <strong>SONGS THAT<br />REMIND ME OF YOU</strong>
            <span className="label-foot">SIDE A / SIDE B&nbsp;&nbsp; VOL. 01</span>
          </div>
          <div className="cassette-notch notch-left" /><div className="cassette-notch notch-right" />
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

function CassetteCanvas({ body, decorations, selectedDeco, setSelectedDeco, setDecorations, setTab, labelTitle, recipient, flipped, onFlip }: { body: CassetteBody; decorations: Deco[]; selectedDeco: number | null; setSelectedDeco: (id: number | null) => void; setDecorations: React.Dispatch<React.SetStateAction<Deco[]>>; setTab: (tab: Tab) => void; labelTitle: string; recipient: string; flipped: boolean; onFlip: () => void }) {
  return <div className="canvas-wrap"><div className="canvas-grid" /><div className="canvas-ruler ruler-top">01&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;02&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;03&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;04&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;05</div><div className="canvas-ruler ruler-side">A<br /><br />B<br /><br />C<br /><br />D<br /><br />E</div><div className="canvas-note">drag your little<br />bits around ↗</div><div className="studio-tape-position"><MiniTape body={body} flipped={flipped} onClick={onFlip} /></div><div className="studio-label-copy"><span>{recipient ? `for ${recipient}` : "for someone special"}</span><b>{labelTitle || "songs that remind me of you"}</b></div>{decorations.map((deco) => <button type="button" key={deco.id} aria-label={`Select ${deco.name}`} className={`canvas-deco ${deco.type} ${selectedDeco === deco.id ? "selected" : ""}`} style={{ left: `${deco.x}%`, top: `${deco.y}%`, transform: `rotate(${deco.rotate}deg) scale(${deco.scale})` }} onPointerDown={(event) => { event.preventDefault(); const canvas = event.currentTarget.closest(".canvas-wrap"); if (!canvas) return; const move = (moveEvent: PointerEvent) => { const rect = canvas.getBoundingClientRect(); setDecorations((items) => items.map((item) => item.id === deco.id ? { ...item, x: Math.max(4, Math.min(94, ((moveEvent.clientX - rect.left) / rect.width) * 100)), y: Math.max(8, Math.min(88, ((moveEvent.clientY - rect.top) / rect.height) * 100)) } : item)); }; const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); }; window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); setSelectedDeco(deco.id); setTab("stickers"); }}>{deco.text || deco.icon}</button>)}</div>;
}

function Studio({ onBack, onGift, onSave }: { onBack: () => void; onGift: (songs: Song[], title: string, recipient: string, letter: string, body: CassetteBody, decorations: Deco[]) => void; onSave: (record: CassetteRecord) => void }) {
  const [tab, setTab] = useState<Tab>("body");
  const [body, setBody] = useState(bodies[0]);
  const [title, setTitle] = useState("songs that remind me of you");
  const [recipient, setRecipient] = useState("Maya");
  const [sender, setSender] = useState("your favorite person");
  const [occasion, setOccasion] = useState("just because");
  const [letter, setLetter] = useState("Hey Maya,\n\nI didn't really know how to say this, so I made you a cassette instead.\n\nListen to Side A when you miss me.\n\nLove,\nMe ♡");
  const [songs, setSongs] = useState<Song[]>(starterSongs);
  const [spotifyLink, setSpotifyLink] = useState("");
  const [addingSong, setAddingSong] = useState(false);
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
  const [skinFilter, setSkinFilter] = useState<"All" | SkinCategory>("All");
  const [effects, setEffects] = useState<Effect[]>([]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [capacity, setCapacity] = useState(45 * 60);
  const draftTimer = useRef<number | undefined>(undefined);

  const totalDuration = useMemo(() => songs.reduce((acc, song) => { const [minutes, seconds] = song.duration.split(":").map(Number); return acc + (minutes * 60 + seconds); }, 0), [songs]);
  const mins = Math.floor(totalDuration / 60);
  const secs = String(totalDuration % 60).padStart(2, "0");

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setProgress((value) => {
      const next = value + speed;
      const trackSeconds = songs[currentTrack] ? songs[currentTrack].duration.split(":").map(Number).reduce((a, b, i) => a * (i ? 60 : 1) + b, 0) : 1;
      if (next >= trackSeconds) { setCurrentTrack((index) => (index + 1) % Math.max(songs.length, 1)); return 0; }
      return next;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [playing, speed, currentTrack, songs]);

  useEffect(() => {
    window.clearTimeout(draftTimer.current);
    draftTimer.current = window.setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({ title, recipient, letter, body, songs, decorations, effects, updatedAt: new Date().toISOString() }));
    }, 400);
    return () => window.clearTimeout(draftTimer.current);
  }, [title, recipient, letter, body, songs, decorations, effects]);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200); };
  const pushHistory = (message: string) => setHistory((items) => [message, ...items].slice(0, 5));
  const addDeco = (option: { icon: string; name: string; text?: string }, type: "sticker" | "gem") => { const id = Date.now(); setDecorations((items) => [...items, { id, type, icon: option.icon, name: option.name, text: option.text, x: 20 + Math.random() * 60, y: 20 + Math.random() * 60, rotate: -15 + Math.random() * 30, scale: type === "gem" ? 0.7 + Math.random() * 0.4 : 0.8 + Math.random() * 0.35 }]); setSelectedDeco(id); pushHistory(`added ${option.name}`); notify(`${option.name} placed on the tape`); };
  const randomize = () => { const nextBody = bodies[Math.floor(Math.random() * bodies.length)]; const nextTitle = randomTitles[Math.floor(Math.random() * randomTitles.length)]; setBody(nextBody); setTitle(nextTitle); setBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)].id); setDecorations(stickerOptions.slice(0, 3).map((item, index) => ({ id: Date.now() + index, type: "sticker", icon: item.icon, name: item.name, x: 25 + index * 24, y: 25 + (index % 2) * 42, rotate: -10 + index * 8, scale: 0.9 }))); notify("a little surprise, coming right up ✦"); };
  const addSong = async (song?: Song) => {
    if (songs.length >= 8) { notify("your tape is full of feelings"); return; }
    let next = song;
    if (!next && spotifyLink.trim()) {
      setAddingSong(true);
      notify("looking up that Spotify link…");
      try {
        const metadata = await fetchSpotifyTrackMetadata(spotifyLink.trim());
        next = { id: Date.now(), ...metadata, side: songs.filter((s) => s.side === "A").length < 4 ? "A" : "B", url: spotifyLink.trim() };
        notify(`${next.title} by ${next.artist} added ✦`);
      } catch {
        notify("I couldn't read that Spotify track. Try a track link, not a playlist link.");
        setSpotifyLink("");
        return;
      } finally {
        setAddingSong(false);
      }
    }
    if (!next && !spotifyLink.trim()) { notify("paste a Spotify track link first"); return; }
    if (!next) next = { id: Date.now(), title: "New favorite", artist: "Add an artist", side: songs.filter((s) => s.side === "A").length < 4 ? "A" : "B", duration: "3:30" };
    setSongs((items) => [...items, next!]); setSpotifyLink(""); pushHistory(`added ${next.title}`);
  };
  const moveSong = (index: number, direction: number) => { setSongs((items) => { const copy = [...items]; const nextIndex = index + direction; if (nextIndex < 0 || nextIndex >= copy.length) return copy; [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]]; return copy; }); };
  const deleteSong = (id: number) => { setSongs((items) => items.filter((song) => song.id !== id)); notify("song removed"); };
  const addStickerText = () => { addDeco({ icon: "FOR YOU", name: "for you", text: "FOR YOU" }, "sticker"); };
  const saveRecord = () => { const now = new Date().toISOString(); onSave({ id: `tape-${Date.now()}`, title: title || "untitled mixtape", recipient, letter, body, songs, decorations, effects, createdAt: now, updatedAt: now, tags: [skinCategoryFor(body)] }); setSaved(true); localStorage.removeItem(draftKey); notify("tape saved to your collection ✦"); };
  const skipTrack = (direction: number) => { setCurrentTrack((index) => (index + direction + songs.length) % Math.max(songs.length, 1)); setProgress(0); };

  const selectedItem = decorations.find((item) => item.id === selectedDeco);
  const visibleBodies = bodies.filter((item) => skinFilter === "All" || skinCategoryFor(item) === skinFilter);
  const tabItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "body", label: "body", icon: <Package size={15} /> }, { id: "label", label: "label", icon: <Pencil size={15} /> }, { id: "songs", label: "songs", icon: <Music size={15} /> }, { id: "stickers", label: "stickers", icon: <Sticker size={15} /> }, { id: "bedazzle", label: "bedazzle", icon: <Sparkles size={15} /> }, { id: "effects", label: "effects", icon: <Zap size={15} /> }, { id: "letter", label: "letter", icon: <Mail size={15} /> }, { id: "background", label: "background", icon: <Layers size={15} /> },
  ];

  return <div className="studio-page">
    <div className="studio-topbar"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> back to the desk</button><div className="studio-title"><span className="kicker">the mixtape studio</span><strong>make it a little more you.</strong></div><div className="studio-top-actions"><button className={`icon-button ${soundOn ? "selected" : ""}`} onClick={() => setSoundOn(!soundOn)}>{soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}</button><button className="icon-button" onClick={saveRecord}><Save size={16} /></button><AppButton variant="small" onClick={() => onGift(songs, title, recipient, letter, body, decorations)}>give cassette <Gift size={14} /></AppButton></div></div>
    <div className="studio-stepper"><span className="done"><Check size={12} /> pick a tape</span><span className="current"><span>02</span> make it yours</span><span><span>03</span> give it away</span></div>
    <main className="studio-layout">
      <aside className="tool-rail"><div className="rail-label">make<br />some<br />magic</div>{tabItems.map((item) => <button key={item.id} className={`tool-tab ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}><span className="tool-icon">{item.icon}</span><span>{item.label}</span>{item.id === "songs" && <b>{songs.length}</b>}</button>)}<div className="rail-bottom"><button className="rail-mini" onClick={randomize}><Wand2 size={16} /><span>surprise<br />me</span></button><div className="rail-undo"><button onClick={() => notify(history.length ? `undo ${history[0]}` : "nothing to undo")}><Undo2 size={14} /></button><button onClick={() => notify("redo is waiting patiently")}>↪</button></div></div></aside>
      <section className={`studio-canvas ${backgrounds.find((item) => item.id === background)?.className || "bg-desk"}`}><div className="canvas-header"><span>untitled mixtape / vol. 01</span><span className="canvas-status"><span className="status-dot" /> auto-saved {saved ? "just now" : "a few seconds ago"}</span></div><div className={`playback-cassette ${playing ? "is-playing" : ""}`} style={{ "--playback-speed": speed } as React.CSSProperties}><CassetteCanvas body={body} decorations={decorations} selectedDeco={selectedDeco} setSelectedDeco={setSelectedDeco} setDecorations={setDecorations} setTab={setTab} labelTitle={title} recipient={recipient} flipped={flipped} onFlip={() => setFlipped(!flipped)} /></div><div className="playback-dock"><button onClick={() => skipTrack(-1)}><ChevronLeft size={14} /></button><button className="play-button" onClick={() => setPlaying(!playing)}>{playing ? "pause" : "play"}</button><button onClick={() => skipTrack(1)}><ChevronRight size={14} /></button><span className="now-playing">side {flipped ? "B" : "A"} · {songs[currentTrack]?.title || "no track"}</span><label>speed <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><span className="progress-readout">{Math.floor(progress / 60)}:{String(Math.floor(progress % 60)).padStart(2, "0")}</span></div><div className="canvas-footer"><button onClick={() => setSelectedDeco(null)}><Eye size={14} /> preview</button><span>click the tape to flip it</span><span>canvas 05 × 07</span></div></section>
      <aside className="control-panel"><div className="panel-heading"><div><span className="kicker">edit your tape</span><h2>{tab === "body" ? "choose your body" : tab === "label" ? "write the label" : tab === "songs" ? "fill the sides" : tab === "stickers" ? "stick it on" : tab === "bedazzle" ? "make it shine" : tab === "effects" ? "add atmosphere" : tab === "letter" ? "write a letter" : "set the scene"}</h2></div><button className="close-panel" onClick={() => setTab("body")}><ChevronRight size={16} /></button></div>
        {tab === "body" && <div className="panel-content"><p className="panel-copy">Choose a collectible blank tape, then make it yours. Every body is CSS-built so it always loads.</p><div className="skin-filter-row">{skinCategories.map((category) => <button className={`chip ${skinFilter === category ? "selected" : ""}`} key={category} onClick={() => setSkinFilter(category)}>{category}</button>)}<button className="chip random-chip" onClick={() => { const next = visibleBodies[Math.floor(Math.random() * visibleBodies.length)] || bodies[0]; setBody(next); notify(`${next.name} picked from the rack`); }}>random tape</button></div><div className="body-grid">{visibleBodies.map((item) => <button key={item.id} className={`body-option ${body.id === item.id ? "selected" : ""}`} onClick={() => { setBody(item); notify(`${item.name} is on the desk`); }}><span className="body-swatch" style={{ background: item.color }}><span className="swatch-window" style={{ background: item.tape }} /><span className="swatch-label" style={{ background: item.label }} /></span><span>{item.name}</span><small>{skinCategoryFor(item)}</small>{body.id === item.id && <Check size={13} />}</button>)}</div><div className="finish-row"><span>finish</span><div className="finish-chips"><button className="chip selected">matte</button><button className="chip">gloss</button><button className="chip">frosted</button></div></div><div className="panel-callout"><Sparkles size={16} /><span><strong>tip from the craft desk</strong><br />a little imperfection makes it feel yours.</span></div></div>}
        {tab === "label" && <div className="panel-content form-stack"><label>cassette title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="songs that remind me of you" /></label><label>made for<input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="their name" /></label><label>made by<input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="your name" /></label><div className="two-fields"><label>occasion<select value={occasion} onChange={(e) => setOccasion(e.target.value)}><option>just because</option><option>birthday</option><option>friendship</option><option>love</option><option>missing you</option><option>thank you</option></select></label><label>volume<input defaultValue="01" /></label></div><div className="label-preview"><span>REC. 28•09•26</span><strong>{title || "your title here"}</strong><em>made by {sender || "you"}</em></div><div className="label-tip"><Bookmark size={14} /> slight tilt: on <span>↗</span></div></div>}
        {tab === "songs" && <div className="panel-content song-panel"><div className="spotify-add"><div className="spotify-head"><span className="spotify-logo">●</span><strong>add from Spotify</strong><span className="spotify-beta">public lookup</span></div><div className="link-input"><Link2 size={14} /><input value={spotifyLink} onChange={(e) => setSpotifyLink(e.target.value)} placeholder="paste a Spotify track link" /><button onClick={() => addSong()}><Plus size={14} /> add</button></div><p>We save the link, never the audio. <CircleHelp size={13} /></p></div><div className="song-search"><Search size={14} /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="search your little heart out" /></div>{searchTerm && <div className="search-result"><div className="album-art art-sun">☼</div><div><strong>{searchTerm}</strong><span>search result / Spotify link</span></div><button onClick={() => addSong({ id: Date.now(), title: searchTerm, artist: "your search result", side: "A", duration: "3:30", url: "https://open.spotify.com" })}><Plus size={15} /></button></div>}<div className="side-heading"><span>side a <b>{songs.filter((s) => s.side === "A").length}</b></span><span>18:42 / 22:30</span></div><div className="song-list">{songs.map((song, index) => <div className="song-row" key={song.id}><GripVertical size={13} className="drag-handle" /><span className="track-no">{String(index + 1).padStart(2, "0")}</span><div className={`album-art ${song.artwork ? "has-artwork" : ""}`} style={song.artwork ? { backgroundImage: `url(${song.artwork})` } : undefined}>{song.artwork ? null : (index % 2 === 0 ? "✦" : "◒")}</div><div className="song-meta"><strong>{song.title}</strong><span>{song.artist}</span></div><span className="song-duration">{song.duration}</span><button className="song-move" onClick={() => moveSong(index, -1)}><ChevronUpTiny /></button><button className="song-move" onClick={() => moveSong(index, 1)}><ChevronDown size={12} /></button><button className="song-delete" onClick={() => deleteSong(song.id)}><Trash2 size={13} /></button></div>)}</div><div className="song-side-row"><span>side b <b>{songs.filter((s) => s.side === "B").length}</b></span><button onClick={() => { const id = songs.find((s) => s.side === "A")?.id; if (id) setSongs((items) => items.map((s) => s.id === id ? { ...s, side: "B" } : s)); }}>move a song here <ArrowRight size={13} /></button></div><div className="capacity"><span>tape length <strong>C45</strong></span><span><b>{mins}:{secs}</b> / 45:00</span></div></div>}
        {tab === "stickers" && <div className="panel-content"><p className="panel-copy">The good stuff. Click a sticker on the tape to select it, then rotate, resize, delete, or edit its message.</p><div className="drawer-label">love notes & little things</div><div className="sticker-drawer">{stickerOptions.map((item) => <button className="sticker-option" key={item.name} onClick={() => addDeco(item, "sticker")}><span>{item.icon}</span><small>{item.name}</small></button>)}<button className="sticker-option text-sticker" onClick={addStickerText}><span>FOR<br />YOU</span><small>message</small></button></div><div className="selected-tools"><span>selected layer</span>{selectedDeco !== null ? <>
          {selectedItem?.type === "sticker" && selectedItem.text !== undefined && <label className="sticker-edit-label">sticker message<input className="sticker-message-input" value={selectedItem.text} onChange={(e) => setDecorations((items) => items.map((item) => item.id === selectedDeco ? { ...item, text: e.target.value, icon: e.target.value || "FOR YOU" } : item))} /></label>}
          <div className="sticker-rotate-row"><RotateCw size={14} /><span>rotate</span><input aria-label="Rotate selected sticker" type="range" min="-180" max="180" value={selectedItem?.rotate ?? 0} onChange={(e) => setDecorations((items) => items.map((item) => item.id === selectedDeco ? { ...item, rotate: Number(e.target.value) } : item))} /><output>{Math.round(selectedItem?.rotate ?? 0)}°</output></div>
          <button onClick={() => { setDecorations((items) => items.map((item) => item.id === selectedDeco ? { ...item, rotate: item.rotate - 15 } : item)); }}><RotateCw size={14} /> -15°</button><button onClick={() => { setDecorations((items) => items.map((item) => item.id === selectedDeco ? { ...item, rotate: item.rotate + 15 } : item)); }}><RotateCw size={14} /> +15°</button><button onClick={() => { setDecorations((items) => items.map((item) => item.id === selectedDeco ? { ...item, scale: item.scale + 0.1 } : item)); }}><Plus size={14} /> scale</button><button onClick={() => { setDecorations((items) => items.filter((item) => item.id !== selectedDeco)); setSelectedDeco(null); }}><Trash2 size={14} /> delete</button>
        </> : <em>click a sticker on the canvas</em>}</div><div className="layer-row"><button onClick={() => notify("brought it forward")}>bring forward</button><button onClick={() => notify("sent it back")}>send back</button><button onClick={() => notify("duplicated the selected layer")}>duplicate</button></div></div>}
        {tab === "bedazzle" && <div className="panel-content"><p className="panel-copy">Tiny physical-feeling sparkle, placed imperfectly on purpose.</p><div className="gem-tray">{gemOptions.map((item) => <button key={item.name} onClick={() => addDeco(item, "gem")}><span>{item.icon}</span><small>{item.name}</small></button>)}</div><div className="bedazzle-card"><div className="gem-orbit"><span>✦</span><span>◆</span><span>●</span></div><strong>bedazzle responsibly</strong><p>A few well-placed gems go a long way. Unless it's your tape — then more is more.</p></div><div className="selected-tools"><span>selected gem</span><em>{selectedDeco ? "ready to tweak" : "click a gem on the canvas"}</em></div></div>}
        {tab === "effects" && <div className="panel-content effects-panel"><p className="panel-copy">A little atmosphere makes the tape feel handled, loved, and found in a real bedroom drawer.</p>{[{ id: "grain", label: "film grain" }, { id: "dust", label: "dust" }, { id: "chrome", label: "chrome shine" }, { id: "holo", label: "holographic" }, { id: "vhs", label: "VHS glow" }, { id: "leak", label: "light leak" }].map((effect) => { const active = effects.find((item) => item.id === effect.id); return <label className="effect-row" key={effect.id}><span><button type="button" className={`effect-toggle ${active ? "active" : ""}`} onClick={() => setEffects((items) => active ? items.filter((item) => item.id !== effect.id) : [...items, { id: effect.id, label: effect.label, intensity: 45 }])}>{active ? "on" : "off"}</button><b>{effect.label}</b></span><input aria-label={`${effect.label} intensity`} type="range" min="0" max="100" value={active?.intensity || 0} onChange={(event) => setEffects((items) => active ? items.map((item) => item.id === effect.id ? { ...item, intensity: Number(event.target.value) } : item) : items)} /></label>; })}<div className="panel-callout"><Zap size={16} /><span><strong>tasteful by default</strong><br />effects stay soft so the cassette remains the hero.</span></div></div>}
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

function Shelf({ onBack, onCreate, onOpen }: { onBack: () => void; onCreate: () => void; onOpen: (record: CassetteRecord) => void }) {
  const [records, setRecords] = useState<CassetteRecord[]>(() => readCollection());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Favorites">("All");
  const visible = records.filter((record) => filter === "All" || record.favorite).filter((record) => `${record.title} ${record.recipient} ${record.songs.map((song) => `${song.title} ${song.artist}`).join(" ")} ${(record.tags || []).join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  const update = (next: CassetteRecord[]) => { setRecords(next); writeCollection(next); };
  const duplicate = (record: CassetteRecord) => { const copy = { ...record, id: `tape-${Date.now()}`, title: `${record.title} COPY`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), favorite: false }; update([copy, ...records]); };
  return <div className="shelf-page"><Header view="shelf" setView={(view) => view === "home" && onBack()} onCreate={onCreate} /><main className="shelf-main"><div className="shelf-heading"><div><span className="kicker">the little archive · {records.length} tapes</span><h1>my cassette<br /><em>collection.</em></h1></div><AppButton onClick={onCreate}><Plus size={15} /> make a new one</AppButton></div><div className="collection-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="search my tapes, songs, artists..." /><button className={filter === "All" ? "active" : ""} onClick={() => setFilter("All")}>all</button><button className={filter === "Favorites" ? "active" : ""} onClick={() => setFilter("Favorites")}>♡ favorites</button></div>{records.length === 0 ? <div className="collection-empty"><span>✷</span><h2>your collection is empty</h2><p>Make your first little story and it will live here.</p><AppButton onClick={onCreate}>grab a blank tape <ArrowRight size={15} /></AppButton></div> : <div className="shelf-grid">{visible.map((record, index) => <article className="shelf-card saved-card" key={record.id}><div className="shelf-card-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{new Date(record.updatedAt).toLocaleDateString()}</span></div><button className="saved-tape-button" onClick={() => onOpen(record)}><MiniTape body={record.body} /></button><div className="shelf-card-copy"><strong>{record.title}</strong><span>made for {record.recipient || "someone special"}</span><small>{record.songs.length} songs · {skinCategoryFor(record.body)}</small></div><div className="saved-actions"><button onClick={() => update(records.map((item) => item.id === record.id ? { ...item, favorite: !item.favorite } : item))}>{record.favorite ? "♥" : "♡"}</button><button onClick={() => onOpen(record)}>open</button><button onClick={() => duplicate(record)}>duplicate</button><button onClick={() => update(records.filter((item) => item.id !== record.id))}>delete</button></div></article>)}</div>}{records.length > 0 && visible.length === 0 && <div className="collection-empty compact"><p>No tapes match that search yet.</p></div>}<div className="shelf-empty"><span>✷</span><p>Every good collection starts with one.</p><button onClick={onCreate}>add another little story <ArrowRight size={14} /></button></div></main></div>;
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [giftData, setGiftData] = useState({ songs: starterSongs, title: "songs that remind me of you", recipient: "Maya", letter: "Hey Maya,\n\nI didn't really know how to say this, so I made you a cassette instead.\n\nListen to Side A when you miss me.\n\nLove,\nMe ♡", body: bodies[0], decorations: [] as Deco[] });
  const saveRecord = (record: CassetteRecord) => { const current = readCollection(); writeCollection([record, ...current.filter((item) => item.id !== record.id)]); };
  if (view === "studio") return <Studio onBack={() => setView("home")} onSave={saveRecord} onGift={(songs, title, recipient, letter, body, decorations) => { setGiftData({ songs, title, recipient, letter, body, decorations }); setView("gift"); }} />;
  if (view === "gift") return <GiftView data={giftData} onBack={() => setView("home")} />;
  if (view === "shelf") return <Shelf onBack={() => setView("home")} onCreate={() => setView("studio")} onOpen={(record) => { setGiftData(record); setView("gift"); }} />;
  return <div className="home-page"><Header view="home" setView={setView} onCreate={() => setView("studio")} /><Hero onCreate={() => setView("studio")} onExplore={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })} /><HowItWorks onCreate={() => setView("studio")} /><Footer /></div>;
}
