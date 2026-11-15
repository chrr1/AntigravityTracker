import { useState, type FormEvent } from "react";
import { supabase } from "./supabase";

const css = `
.lgn{position:fixed;inset:0;z-index:10;overflow:auto;display:grid;place-items:center;padding:20px;background:#050505;color:#ededed;font:14px/1.5 Inter,system-ui,sans-serif}
.lgn *{box-sizing:border-box}
.lgn-card{width:min(940px,100%);min-height:540px;display:grid;grid-template-columns:1fr 1fr;border:1px solid rgba(255,255,255,.1);border-radius:28px;overflow:hidden;background:#0a0a0a}
.lgn-art{position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 55%,#10161f 0,#07090c 70%);border-right:1px solid rgba(255,255,255,.06)}
.lgn-brand{position:absolute;top:32px;left:32px;font-size:15px;font-weight:500;z-index:2}
.lgn-orb{position:absolute;left:50%;top:44%;width:230px;height:230px;margin:-115px 0 0 -115px;border-radius:50%;
 background:radial-gradient(circle at 34% 28%,#fff 0,#cfe2ff 14%,#6d97d6 40%,#1b2c4a 72%,#0a111d 100%);
 box-shadow:0 0 60px rgba(110,160,255,.35),0 0 140px rgba(255,120,60,.18);animation:lgn-f 7s ease-in-out infinite}
.lgn-orb::before{content:"";position:absolute;inset:-6%;border-radius:50%;background:radial-gradient(circle at 78% 74%,rgba(255,128,64,.95) 0,rgba(255,128,64,0) 48%);mix-blend-mode:screen;filter:blur(10px)}
.lgn-orb::after{content:"";position:absolute;left:-60%;right:-60%;top:46%;height:34px;background:linear-gradient(90deg,transparent,rgba(120,170,255,.55),rgba(255,160,110,.5),transparent);transform:rotate(-24deg);filter:blur(14px)}
.lgn-glow{position:absolute;left:50%;bottom:-90px;width:380px;height:230px;margin-left:-190px;background:radial-gradient(ellipse,rgba(255,110,60,.28),transparent 66%);filter:blur(26px)}
.lgn-cap{position:absolute;left:32px;right:32px;bottom:30px;color:#9a9a9a;font-size:13px;z-index:2}
@keyframes lgn-f{50%{transform:translateY(-12px)}}
@media(prefers-reduced-motion:reduce){.lgn-orb{animation:none}}
.lgn-form{display:flex;flex-direction:column;justify-content:center;padding:48px 44px}
.lgn-sub{text-align:center;color:#8d8d8d;font-size:13px}
.lgn-h{text-align:center;font-size:28px;font-weight:500;margin:14px 0 30px;letter-spacing:-.01em}
.lgn-in{display:block;width:100%;height:44px;margin-bottom:10px;padding:0 14px;border-radius:12px;border:1px solid transparent;background:#141414;color:#ededed;font:inherit;outline:0}
.lgn-in::placeholder{color:#6d6d6d}.lgn-in:focus{border-color:rgba(255,255,255,.28);background:#181818}
.lgn-pw{position:relative}.lgn-pw .lgn-in{padding-right:44px}
.lgn-eye{position:absolute;right:6px;top:0;height:44px;width:38px;display:grid;place-items:center;background:none;border:0;color:#8d8d8d;cursor:pointer}.lgn-eye:hover{color:#fff}
.lgn-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:44px;margin-top:14px;border:0;border-radius:12px;background:#fff;color:#0a0a0a;font:inherit;font-weight:500;cursor:pointer}
.lgn-btn:hover{background:#e9e9e9}.lgn-btn:disabled{opacity:.6;cursor:default}
.lgn-err{color:#ff7a7a;margin:2px 2px 0;font-size:13px}
.lgn-note{text-align:center;color:#8d8d8d;font-size:12.5px;margin-top:22px}
.lgn-toggle{background:none;border:0;color:#fff;text-decoration:underline;cursor:pointer;font:inherit;margin-top:8px}
.lgn-ok{color:#7be08a;margin:4px 2px 0;font-size:13px;text-align:center}
.lgn :focus-visible{outline:2px solid #fff;outline-offset:2px}
@media(max-width:760px){.lgn-card{grid-template-columns:1fr;min-height:0}.lgn-art{height:210px;border:0;border-bottom:1px solid rgba(255,255,255,.06)}.lgn-orb{width:120px;height:120px;margin:-60px 0 0 -60px;top:54%}.lgn-cap{display:none}.lgn-brand{top:20px;left:22px}.lgn-form{padding:30px 22px}}
`;

const Eye = ({ off }: { off: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{off && <path d="M4 4l16 16" />}
  </svg>
);

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setErr("Klien Supabase belum dikonfigurasi. Periksa .env");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pw,
      });
      if (error) {
        setErr(error.message);
      } else if (data.session) {
        // Otomatis terautentikasi
      } else {
        setMsg("Pendaftaran berhasil! Silakan periksa inbox email Anda untuk verifikasi atau coba masuk.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pw,
      });
      if (error) {
        setErr(error.message === "Invalid login credentials" ? "Email atau kata sandi salah." : error.message);
      }
    }
    setBusy(false);
  };

  return (
    <div className="lgn"><style>{css}</style>
      <div className="lgn-card">
        <div className="lgn-art" aria-hidden><div className="lgn-brand">Antigravity Tracker</div><div className="lgn-glow" /><div className="lgn-orb" /><div className="lgn-cap">Pantau limit dan waktu reset semua akun dalam satu kanvas.</div></div>
        <form className="lgn-form" onSubmit={go}>
          <div className="lgn-sub">{isSignUp ? "Sinkronisasi antar perangkat" : "Selamat datang kembali"}</div>
          <h1 className="lgn-h">{isSignUp ? "Daftar Akun Baru" : "Masuk ke Tracker"}</h1>
          <input className="lgn-in" type="email" placeholder="Email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} aria-label="Email" />
          <div className="lgn-pw">
            <input className="lgn-in" type={show ? "text" : "password"} placeholder="Kata sandi (min. 6 karakter)" autoComplete={isSignUp ? "new-password" : "current-password"} required minLength={6} value={pw} onChange={e => setPw(e.target.value)} aria-label="Kata sandi" />
            <button type="button" className="lgn-eye" onClick={() => setShow(s => !s)} aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}><Eye off={show} /></button>
          </div>
          {err && <div className="lgn-err" role="alert">{err}</div>}
          {msg && <div className="lgn-ok" role="status">{msg}</div>}
          <button className="lgn-btn" type="submit" disabled={busy}>
            {busy ? "Memproses..." : (isSignUp ? "Daftar Sekarang" : "Masuk")}
            {!busy && <span aria-hidden>›</span>}
          </button>
          <div className="lgn-note">
            <div>{isSignUp ? "Sudah memiliki akun?" : "Belum memiliki akun?"}</div>
            <button type="button" className="lgn-toggle" onClick={() => { setIsSignUp(!isSignUp); setErr(""); setMsg(""); }}>
              {isSignUp ? "Masuk ke akun yang ada" : "Daftar akun baru"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}