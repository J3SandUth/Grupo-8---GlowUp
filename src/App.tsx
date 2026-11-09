import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react"

type IconName =
  | "back"
  | "bell"
  | "bookmark"
  | "bookmarkFill"
  | "check"
  | "chevronDown"
  | "close"
  | "heart"
  | "heartFill"
  | "home"
  | "image"
  | "lock"
  | "message"
  | "more"
  | "plus"
  | "search"
  | "send"
  | "settings"
  | "share"

type User = {
  id: string
  name: string
  handle: string
  avatar?: string
  initials: string
  tone: string
  followers: number
  bio: string
}

type Pin = {
  id: number
  title: string
  category: string
  image: string
  ratio: string
  authorId: string
  likes: number
  saves: number
  description: string
  tags: string[]
}

type Board = { id: number; name: string; pinIds: number[]; secret?: boolean }
type Comment = { id: number; userId: string; text: string; time: string }
type Tab = "home" | "explore" | "create" | "activity" | "profile"
type Overlay =
  | { kind: "pin"; id: number }
  | { kind: "user"; id: string }
  | { kind: "board"; id: number }
type ChatMessage = { from: string; text?: string; pinId?: number }

const photo = (id: string, w = 700) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

const users: Record<string, User> = {
  me: {
    id: "me",
    name: "Lucía Márquez",
    handle: "luciamood",
    initials: "LM",
    tone: "coral",
    followers: 12800,
    bio: "Directora creativa. Colecciono interiores serenos, moda consciente y pequeños rituales.",
  },
  u1: {
    id: "u1",
    name: "Chyntia Juls",
    handle: "chyntia",
    avatar: photo("1552699611-e2c208d5d9cf", 160),
    initials: "CJ",
    tone: "sand",
    followers: 18200,
    bio: "Estilismo atemporal y sastrería con alma.",
  },
  u2: {
    id: "u2",
    name: "Alesia Kaz",
    handle: "alesia.home",
    avatar: photo("1544005313-94ddf0286df2", 160),
    initials: "AK",
    tone: "clay",
    followers: 42700,
    bio: "Interiorista. Casas que respiran calma.",
  },
  u3: {
    id: "u3",
    name: "Daniele Duarte",
    handle: "daniele.ph",
    avatar: photo("1674932668403-33398b81c92f", 160),
    initials: "DD",
    tone: "violet",
    followers: 9300,
    bio: "Fotografía de luz natural y retratos honestos.",
  },
  u4: {
    id: "u4",
    name: "Inside Weather",
    handle: "insideweather",
    initials: "IW",
    tone: "cocoa",
    followers: 88100,
    bio: "Muebles hechos a tu medida.",
  },
  u5: {
    id: "u5",
    name: "Mara Ruiz",
    handle: "mara.viaja",
    avatar: photo("1614204424926-196a80bf0be8", 160),
    initials: "MR",
    tone: "aqua",
    followers: 27500,
    bio: "Viajes lentos por el Mediterráneo.",
  },
  u6: {
    id: "u6",
    name: "Alina Bosch",
    handle: "alina.slow",
    avatar: photo("1506863530036-1efeddceb993", 160),
    initials: "AB",
    tone: "butter",
    followers: 15400,
    bio: "Recetas sencillas y domingos lentos.",
  },
}

const seedPins: Pin[] = [
  { id: 1, title: "Sastrería serena", category: "Moda", image: photo("1613915617430-8ab0fd7c6baf"), ratio: "4 / 5", authorId: "u1", likes: 284, saves: 1240, description: "Blazer amplio, pantalón de pinzas y una paleta arena. La fórmula para un look que funciona de lunes a domingo.", tags: ["sastrería", "neutros", "oficina"] },
  { id: 2, title: "Geometría suave", category: "Interiores", image: photo("1601993957728-1e56ab70c5a8"), ratio: "3 / 4", authorId: "u2", likes: 427, saves: 2310, description: "Curvas, arcos y materiales nobles para un salón que invita a quedarse.", tags: ["arcos", "salón", "calma"] },
  { id: 3, title: "Luz natural", category: "Belleza", image: photo("1635425886430-6e9d1f8c3ccd"), ratio: "1 / 1", authorId: "u3", likes: 193, saves: 870, description: "Piel luminosa, maquillaje mínimo y la luz de la mañana como único filtro.", tags: ["skincare", "glow", "natural"] },
  { id: 4, title: "Cuero y lino", category: "Interiores", image: photo("1567016376408-0226e4d0c1ea"), ratio: "2 / 3", authorId: "u4", likes: 316, saves: 1580, description: "Texturas que envejecen bien: cuero coñac, lino lavado y madera clara.", tags: ["texturas", "sofá", "madera"] },
  { id: 5, title: "Estudio de luz", category: "Fotografía", image: photo("1783685157642-ec5a1b54b922"), ratio: "4 / 5", authorId: "u3", likes: 508, saves: 1920, description: "Sombras largas y una sola fuente de luz. Menos equipo, más intención.", tags: ["estudio", "sombras", "retrato"] },
  { id: 6, title: "Domingo lento", category: "Bienestar", image: photo("1659522761084-79196b64abe4"), ratio: "2 / 3", authorId: "u6", likes: 241, saves: 990, description: "Un ritual sin pantallas: té, libro y ventana abierta.", tags: ["rituales", "slow living", "pausa"] },
  { id: 7, title: "Silueta en negro", category: "Moda", image: photo("1603189343302-e603f7add05a"), ratio: "1 / 1", authorId: "u1", likes: 362, saves: 1430, description: "Mangas amplias y un solo color. El volumen hace todo el trabajo.", tags: ["monocromo", "volumen", "editorial"] },
  { id: 8, title: "Ventanal y calma", category: "Interiores", image: photo("1583847268964-b28dc8f51f92"), ratio: "2 / 3", authorId: "u2", likes: 611, saves: 3120, description: "Cortinas ligeras, tonos crudos y plantas grandes. La luz como protagonista.", tags: ["ventanal", "plantas", "crudo"] },
  { id: 9, title: "Desayuno de domingo", category: "Recetas", image: photo("1528699633788-424224dc89b5"), ratio: "3 / 4", authorId: "u6", likes: 455, saves: 2040, description: "Pan de masa madre, café de filtro y fruta de temporada.", tags: ["brunch", "masa madre", "café"] },
  { id: 10, title: "Casitas junto al mar", category: "Viajes", image: photo("1562955867-2dd0bbe7a35c"), ratio: "2 / 3", authorId: "u5", likes: 702, saves: 4110, description: "Pueblos blancos, agua turquesa y comidas largas al sol.", tags: ["mediterráneo", "verano", "costa"] },
  { id: 11, title: "Rojo contra el cielo", category: "Moda", image: photo("1662532577856-e8ee8b138a8b"), ratio: "4 / 5", authorId: "u5", likes: 389, saves: 1310, description: "Un solo color intenso basta para que el look hable por sí mismo.", tags: ["color", "trenzas", "verano"] },
  { id: 12, title: "Sala blanca y verde", category: "Interiores", image: photo("1600494448850-6013c64ba722"), ratio: "4 / 3", authorId: "me", likes: 148, saves: 620, description: "Mi rincón favorito: sofá blanco, una planta generosa y nada más.", tags: ["minimal", "plantas", "blanco"] },
  { id: 13, title: "Huevos y café", category: "Recetas", image: photo("1617054240991-b0ffce6600da"), ratio: "2 / 3", authorId: "u6", likes: 233, saves: 760, description: "Desayunos sencillos que se sienten como un pequeño lujo.", tags: ["desayuno", "cerámica", "mañanas"] },
  { id: 14, title: "Sillas en la arena", category: "Viajes", image: photo("1607614372586-72d399dc57b6"), ratio: "3 / 4", authorId: "me", likes: 319, saves: 1180, description: "Tarde de septiembre en una cala sin nombre.", tags: ["playa", "septiembre", "calma"] },
  { id: 15, title: "Retrato en sombra", category: "Fotografía", image: photo("1552699611-e2c208d5d9cf"), ratio: "4 / 5", authorId: "u3", likes: 276, saves: 910, description: "Enfoque selectivo y fondo oscuro para retratos con carácter.", tags: ["retrato", "enfoque", "oscuro"] },
  { id: 16, title: "Editorial impreso", category: "Moda", image: photo("1549298222-1c31e8915347"), ratio: "3 / 4", authorId: "u1", likes: 198, saves: 840, description: "Referencias de revistas para el moodboard de esta temporada.", tags: ["revista", "moodboard", "papel"] },
  { id: 17, title: "Chimenea de invierno", category: "Interiores", image: photo("1632829882891-5047ccc421bc"), ratio: "4 / 3", authorId: "u2", likes: 344, saves: 1670, description: "Fuego bajo, textiles gruesos y luz cálida para las noches frías.", tags: ["invierno", "chimenea", "cálido"] },
  { id: 18, title: "Brunch lento", category: "Recetas", image: photo("1653177606650-c435e039c676"), ratio: "2 / 3", authorId: "u6", likes: 287, saves: 1050, description: "Platos bonitos, sin prisa y con buena compañía.", tags: ["brunch", "mesa", "amigos"] },
]

const seedBoards: Board[] = [
  { id: 1, name: "Mi estilo", pinIds: [1, 7, 16, 11] },
  { id: 2, name: "Casa soñada", pinIds: [2, 8, 17, 4] },
  { id: 3, name: "Viajes 2025", pinIds: [10, 14] },
  { id: 4, name: "Rituales", pinIds: [6, 9, 13] },
  { id: 5, name: "Ideas regalo", pinIds: [], secret: true },
]

const categories = ["Para ti", "Moda", "Interiores", "Recetas", "Viajes", "Belleza", "Bienestar", "Fotografía"]
const trendingSearches = ["Salón minimalista", "Looks de otoño", "Brunch en casa", "Costa italiana", "Rutina de mañana", "Paleta arena"]

const commentPool: [string, string][] = [
  ["u2", "La paleta es perfecta. Directo a mi tablero."],
  ["u5", "¿Sabes de dónde es? Me encanta."],
  ["u3", "Qué luz tan bonita, me inspira muchísimo."],
  ["u6", "Guardado para el fin de semana."],
  ["u1", "Una referencia preciosa y muy bien curada."],
  ["u4", "Esto es exactamente lo que buscaba."],
]

const seedComments = (pinId: number): Comment[] =>
  [0, 1].map((i) => {
    const [userId, text] = commentPool[(pinId + i * 3) % commentPool.length]
    return { id: pinId * 10 + i, userId, text, time: `${(pinId % 5) + i + 1} h` }
  })

const notifications = [
  { id: 1, userId: "u2", text: "guardó tu Pin en", highlight: "Casa soñada", pinId: 12, time: "2 min", group: "Nuevo" },
  { id: 2, userId: "u5", text: "comenzó a seguirte", follow: true, time: "18 min", group: "Nuevo" },
  { id: 3, userId: "u3", text: "le dio Me gusta a tu Pin", pinId: 14, time: "1 h", group: "Nuevo" },
  { id: 4, userId: "u1", text: "comentó: “Qué paleta tan serena, me la guardo.”", pinId: 12, time: "3 h", group: "Nuevo" },
  { id: 5, userId: "u6", text: "guardó 3 de tus Pines en", highlight: "Rituales", pinId: 14, time: "Ayer", group: "Esta semana" },
  { id: 6, userId: "u4", text: "comenzó a seguirte", follow: true, time: "2 d", group: "Esta semana" },
]

const seedChats: Record<string, ChatMessage[]> = {
  u1: [
    { from: "u1", text: "¡Hola Lucía! Vi tu tablero de interiores, es precioso." },
    { from: "me", text: "¡Gracias! Me encantó tu Pin de sastrería." },
    { from: "u1", pinId: 1 },
    { from: "u1", text: "Te lo dejo por aquí para tu tablero." },
  ],
  u2: [
    { from: "me", text: "¿Dónde encontraste esa lámpara?" },
    { from: "u2", text: "Es de un mercado en Oaxaca, te paso el contacto." },
  ],
  u5: [
    { from: "u5", pinId: 10 },
    { from: "u5", text: "Nuestro próximo viaje, ¿te apuntas?" },
  ],
}

const chatMeta: Record<string, { time: string; unread: boolean }> = {
  u1: { time: "2 min", unread: true },
  u2: { time: "1 h", unread: true },
  u5: { time: "Ayer", unread: false },
}

const formatCount = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(".0", "")} mil` : `${value}`

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }

  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.8" />
          <path d="m16 16 4.1 4.1" />
        </svg>
      )
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      )
    case "home":
      return (
        <svg {...common}>
          <path d="M3.5 10.5 12 3.8l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-6H9.2v6H5A1.5 1.5 0 0 1 3.5 19Z" />
        </svg>
      )
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case "message":
      return (
        <svg {...common}>
          <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2.2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z" />
        </svg>
      )
    case "send":
      return (
        <svg {...common}>
          <path d="m21 3-8.2 18-2.3-7.5L3 11.2 21 3Z" />
          <path d="m10.5 13.5 4-4" />
        </svg>
      )
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4.2 4.2L19 6.5" />
        </svg>
      )
    case "more":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <circle cx="5" cy="12" r="1.9" />
          <circle cx="12" cy="12" r="1.9" />
          <circle cx="19" cy="12" r="1.9" />
        </svg>
      )
    case "share":
      return (
        <svg {...common}>
          <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" />
          <path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5" />
        </svg>
      )
    case "back":
      return (
        <svg {...common}>
          <path d="M15 5 8 12l7 7" />
        </svg>
      )
    case "settings":
      return (
        <svg {...common}>
          <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="10" cy="17" r="2" />
        </svg>
      )
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        </svg>
      )
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      )
    case "chevronDown":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      )
    case "image":
      return (
        <svg {...common}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="m4.5 18 5-5 3.5 3.5 2.5-2.5 4 4" />
        </svg>
      )
    case "bookmark":
    case "bookmarkFill":
      return (
        <svg {...common} fill={name === "bookmarkFill" ? "currentColor" : "none"}>
          <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4Z" />
        </svg>
      )
    default:
      return (
        <svg {...common} fill={name === "heartFill" ? "currentColor" : "none"}>
          <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        </svg>
      )
  }
}

function Pressable({
  children,
  className,
  label,
  onPress,
  disabled,
}: {
  children: ReactNode
  className: string
  label: string
  onPress: () => void
  disabled?: boolean
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      if (!disabled) onPress()
    }
  }

  return (
    <div
      className={className}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-disabled={disabled || undefined}
      onClick={(event) => {
        event.stopPropagation()
        if (!disabled) onPress()
      }}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  )
}

function Avatar({ user, size = 28, className = "" }: { user: User; size?: number; className?: string }) {
  const style = { width: size, height: size, fontSize: Math.max(8, size * 0.36) }
  return user.avatar ? (
    <img className={`avatar ${className}`} src={user.avatar} alt="" style={style} />
  ) : (
    <span className={`avatar tone-${user.tone} ${className}`} style={style}>
      {user.initials}
    </span>
  )
}

function StatusBar() {
  return (
    <div className="StatusBar">
      <span className="status-time">9:41</span>
      <div className="dynamic-island" />
      <div className="status-icons" aria-label="Cellular, Wi-Fi, full battery">
        <svg viewBox="0 0 19 12" aria-hidden="true">
          <path d="M1 11h2V8H1v3Zm4 0h2V6H5v5Zm4 0h2V4H9v7Zm4 0h2V2h-2v9Zm4 0h2V0h-2v11Z" />
        </svg>
        <svg viewBox="0 0 18 13" aria-hidden="true">
          <path d="M9 12.5 11.1 10a3.1 3.1 0 0 0-4.2 0L9 12.5Zm-4.2-5A6.2 6.2 0 0 1 9 5.9c1.6 0 3.1.6 4.2 1.6l1.7-2A9 9 0 0 0 9 3.2a9 9 0 0 0-5.9 2.3l1.7 2ZM1.1 3A12 12 0 0 1 9 0c3 0 5.8 1.1 7.9 3l-1.7 2A9.3 9.3 0 0 0 9 2.6 9.3 9.3 0 0 0 2.8 5L1.1 3Z" />
        </svg>
        <div className="battery">
          <span />
        </div>
      </div>
    </div>
  )
}

function LoginScreen({ onLogin }: { onLogin: (userData: User) => void }) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    if (!username.trim() || !password.trim()) {
      setError("Por favor ingresa tu usuario y contraseña")
      return
    }
    if (isRegister && (!name.trim() || !email.trim())) {
      setError("Completa todos los campos para registrarte")
      return
    }

    setLoading(true)
    try {
      const endpoint = isRegister
        ? "http://localhost:3001/api/auth/register"
        : "http://localhost:3001/api/auth/login"

      const payload = isRegister
        ? { name: name.trim(), handle: username.trim(), email: email.trim(), password }
        : { username: username.trim(), password }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al autenticar")
        setLoading(false)
        return
      }

      localStorage.setItem("glowup_token", data.token)
      localStorage.setItem("glowup_user", JSON.stringify(data.user))
      onLogin(data.user)
    } catch {
      setError("No se pudo conectar con el servidor MySQL (puerto 3001)")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "13px 15px",
    borderRadius: "14px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    fontSize: "14px",
    outline: "none",
  }

  return (
    <div className="LoginScreen">
      <div className="login-orb orb-one" />
      <div className="login-orb orb-two" />
      <div className="login-top">
        <div className="login-mark">G</div>
        <div className="login-wordmark">GlowUp</div>
      </div>

      <div className="login-visual">
        <img src={photo("1613915617430-8ab0fd7c6baf", 900)} alt="Inspiración de moda editorial" />
        <div className="visual-card visual-card-one">
          <span>12.4K</span>
          <small>ideas nuevas hoy</small>
        </div>
        <div className="visual-card visual-card-two">
          <span className="mini-spark" aria-hidden="true" />
          <small>Inspiración a tu medida</small>
        </div>
      </div>

      <div className="login-content">
        <span className="login-kicker">TU MUNDO, CUIDADOSAMENTE CURADO</span>
        <div className="login-title">
          {isRegister ? "Crea tu cuenta en GlowUp." : "Inicia sesión en tu cuenta."}
        </div>

        <div className="login-actions" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Nombre completo (ej. Roberto Machado)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </>
          )}

          <input
            type="text"
            placeholder={isRegister ? "Nombre de usuario (ej. roberto)" : "Usuario o correo electrónico"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={inputStyle}
          />

          {error && (
            <div style={{ color: "#d93025", fontSize: "13px", fontWeight: 500, textAlign: "center" }}>
              {error}
            </div>
          )}

          <Pressable
            className="auth-button primary-auth"
            label={isRegister ? "Registrarse" : "Iniciar sesión"}
            disabled={loading}
            onPress={handleSubmit}
          >
            <span>{loading ? "Verificando..." : isRegister ? "Crear cuenta" : "Iniciar sesión"}</span>
          </Pressable>

          <Pressable
            className="email-auth"
            label="Cambiar entre login y registro"
            onPress={() => {
              setIsRegister(!isRegister)
              setError(null)
            }}
          >
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión aquí" : "¿No tienes cuenta? Regístrate aquí"}
          </Pressable>
        </div>

        <div className="login-legal">
          Contraseñas protegidas con cifrado <span>bcrypt</span> en MySQL.
        </div>
      </div>
    </div>
  )
}

function PinCard({
  pin,
  author,
  saved,
  onOpen,
  onSave,
  onAuthor,
}: {
  pin: Pin
  author: User
  saved: boolean
  onOpen: () => void
  onSave: () => void
  onAuthor: () => void
}) {
  return (
    <article className="pin">
      <div className="pin-media" style={{ aspectRatio: pin.ratio }}>
        <Pressable className="pin-open" label={`Abrir ${pin.title}`} onPress={onOpen}>
          <img src={pin.image} alt={pin.title} loading="lazy" />
          <span className="pin-shade" />
        </Pressable>
        <span className="pin-category">{pin.category}</span>
        <Pressable
          className={`pin-save ${saved ? "saved" : ""}`}
          label={saved ? `${pin.title} guardado` : `Guardar ${pin.title}`}
          onPress={onSave}
        >
          <Icon name={saved ? "bookmarkFill" : "bookmark"} size={15} />
          <span>{saved ? "Guardado" : "Guardar"}</span>
        </Pressable>
      </div>
      <div className="pin-meta">
        <div className="pin-meta-text">
          <span className="pin-name">{pin.title}</span>
          <Pressable className="pin-author" label={`Ver perfil de ${author.name}`} onPress={onAuthor}>
            <Avatar user={author} size={18} />
            <span>{author.name}</span>
          </Pressable>
        </div>
        <Pressable className="pin-more" label={`Más opciones de ${pin.title}`} onPress={onOpen}>
          <Icon name="more" size={16} />
        </Pressable>
      </div>
    </article>
  )
}

function BoardCover({ pins, large = false }: { pins: Pin[]; large?: boolean }) {
  return (
    <div className={`board-cover ${large ? "large" : ""}`}>
      {[0, 1, 2].map((index) =>
        pins[index] ? (
          <img key={index} src={pins[index].image} alt="" className={`cover-${index}`} />
        ) : (
          <span key={index} className={`cover-${index} cover-empty`} />
        ),
      )}
    </div>
  )
}

function SaveSheet({
  pin,
  boards,
  pinsById,
  onToggle,
  onCreate,
  onClose,
}: {
  pin: Pin
  boards: Board[]
  pinsById: (id: number) => Pin | undefined
  onToggle: (boardId: number) => void
  onCreate: (name: string) => void
  onClose: () => void
}) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")

  const submit = () => {
    if (!name.trim()) return
    onCreate(name.trim())
    setName("")
    setCreating(false)
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Guardar en tablero" onClick={(event) => event.stopPropagation()}>
        <span className="sheet-handle" />
        <div className="sheet-head">
          <img src={pin.image} alt="" />
          <div>
            <span className="kicker">GUARDAR PIN</span>
            <strong>Elige un tablero</strong>
          </div>
          <Pressable className="icon-button" label="Cerrar" onPress={onClose}>
            <Icon name="close" size={18} />
          </Pressable>
        </div>
        <div className="sheet-list">
          {boards.map((board) => {
            const contains = board.pinIds.includes(pin.id)
            const covers = board.pinIds.map(pinsById).filter(Boolean) as Pin[]
            return (
              <Pressable
                key={board.id}
                className={`sheet-board ${contains ? "active" : ""}`}
                label={contains ? `Quitar de ${board.name}` : `Guardar en ${board.name}`}
                onPress={() => onToggle(board.id)}
              >
                <div className="sheet-thumb">
                  {covers[0] ? <img src={covers[0].image} alt="" /> : <Icon name="image" size={18} />}
                </div>
                <div className="sheet-board-text">
                  <strong>
                    {board.name}
                    {board.secret && <Icon name="lock" size={12} />}
                  </strong>
                  <span>{board.pinIds.length} Pines</span>
                </div>
                <span className="sheet-state">{contains ? <Icon name="check" size={15} /> : "Guardar"}</span>
              </Pressable>
            )
          })}
        </div>
        {creating ? (
          <div className="sheet-create-form">
            <input
              autoFocus
              value={name}
              placeholder="Nombre del tablero"
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submit()}
            />
            <Pressable className="solid-button" label="Crear tablero" onPress={submit} disabled={!name.trim()}>
              Crear
            </Pressable>
          </div>
        ) : (
          <Pressable className="sheet-create" label="Crear tablero" onPress={() => setCreating(true)}>
            <span className="sheet-create-icon">
              <Icon name="plus" size={18} />
            </span>
            Crear tablero
          </Pressable>
        )}
      </div>
    </div>
  )
}

function StoryViewer({
  storyUsers,
  storyPins,
  index,
  saved,
  onIndex,
  onClose,
  onOpenPin,
  onSave,
}: {
  storyUsers: User[]
  storyPins: Pin[]
  index: number
  saved: boolean
  onIndex: (index: number) => void
  onClose: () => void
  onOpenPin: (pin: Pin) => void
  onSave: (pin: Pin) => void
}) {
  const user = storyUsers[index]
  const pin = storyPins[index]
  const next = () => (index + 1 < storyUsers.length ? onIndex(index + 1) : onClose())

  useEffect(() => {
    const timer = window.setTimeout(next, 5200)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  return (
    <div className="story-viewer" role="dialog" aria-label={`Historia de ${user.name}`}>
      <img className="story-image" src={photo(pin.image.split("photo-")[1].split("?")[0], 1000)} alt={pin.title} />
      <div className="story-gradient" />
      <div className="story-progress">
        {storyUsers.map((item, itemIndex) => (
          <span key={item.id} className={itemIndex < index ? "done" : ""}>
            {itemIndex === index && <i key={index} />}
          </span>
        ))}
      </div>
      <div className="story-head">
        <Avatar user={user} size={34} />
        <div>
          <strong>{user.name}</strong>
          <span>{pin.category} · hace 3 h</span>
        </div>
        <Pressable className="story-close" label="Cerrar historia" onPress={onClose}>
          <Icon name="close" size={20} />
        </Pressable>
      </div>
      <Pressable className="story-tap prev" label="Historia anterior" onPress={() => onIndex(Math.max(0, index - 1))}>
        <span />
      </Pressable>
      <Pressable className="story-tap next" label="Siguiente historia" onPress={next}>
        <span />
      </Pressable>
      <div className="story-foot">
        <span className="story-title">{pin.title}</span>
        <div className="story-actions">
          <Pressable className="story-button ghost" label="Ver Pin" onPress={() => onOpenPin(pin)}>
            Ver Pin
          </Pressable>
          <Pressable className={`story-button ${saved ? "saved" : ""}`} label="Guardar" onPress={() => onSave(pin)}>
            <Icon name={saved ? "bookmarkFill" : "bookmark"} size={15} />
            {saved ? "Guardado" : "Guardar"}
          </Pressable>
        </div>
      </div>
    </div>
  )
}

function PinDetail({
  pin,
  author,
  liked,
  saved,
  lastBoardName,
  isFollowing,
  comments,
  related,
  onBack,
  onLike,
  onQuickSave,
  onPickBoard,
  onFollow,
  onAuthor,
  onComment,
  onShare,
}: {
  pin: Pin
  author: User
  liked: boolean
  saved: boolean
  lastBoardName: string
  isFollowing: boolean
  comments: Comment[]
  related: ReactNode
  onBack: () => void
  onLike: () => void
  onQuickSave: () => void
  onPickBoard: () => void
  onFollow: () => void
  onAuthor: (id: string) => void
  onComment: (text: string) => void
  onShare: () => void
}) {
  const [draft, setDraft] = useState("")
  const [burst, setBurst] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const send = () => {
    if (!draft.trim()) return
    onComment(draft.trim())
    setDraft("")
  }

  return (
    <section className="overlay-screen pin-detail" aria-label={`Pin ${pin.title}`}>
      <div className="detail-card">
        <div
          className="detail-media"
          onDoubleClick={() => {
            if (!liked) onLike()
            setBurst((value) => value + 1)
          }}
        >
          <img src={pin.image.replace("w=700", "w=1100")} alt={pin.title} />
          {burst > 0 && (
            <span key={burst} className="heart-burst">
              <Icon name="heartFill" size={84} />
            </span>
          )}
          <Pressable className="float-back" label="Volver" onPress={onBack}>
            <Icon name="back" size={20} />
          </Pressable>
        </div>

        <div className="detail-body">
          <div className="detail-toolbar">
            <Pressable className={`tool ${liked ? "liked" : ""}`} label="Me gusta" onPress={onLike}>
              <Icon name={liked ? "heartFill" : "heart"} size={22} />
              <span>{formatCount(pin.likes + (liked ? 1 : 0))}</span>
            </Pressable>
            <Pressable className="tool" label="Comentar" onPress={() => inputRef.current?.focus()}>
              <Icon name="message" size={21} />
              <span>{comments.length}</span>
            </Pressable>
            <Pressable className="tool" label="Compartir" onPress={onShare}>
              <Icon name="share" size={21} />
            </Pressable>
            <div className="toolbar-spacer" />
            <Pressable className="board-pick" label="Elegir tablero" onPress={onPickBoard}>
              {saved ? "Guardado" : lastBoardName}
              <Icon name="chevronDown" size={14} />
            </Pressable>
            <Pressable className={`save-button ${saved ? "saved" : ""}`} label="Guardar" onPress={onQuickSave}>
              {saved ? "Guardado" : "Guardar"}
            </Pressable>
          </div>

          <span className="kicker">{pin.category.toUpperCase()}</span>
          <h1 className="detail-title">{pin.title}</h1>
          <p className="detail-description">{pin.description}</p>
          <div className="tag-row">
            {pin.tags.map((tag) => (
              <span key={tag}>#{tag.replace(" ", "")}</span>
            ))}
          </div>
          <div className="saves-line">
            <Icon name="bookmarkFill" size={13} />
            {formatCount(pin.saves + (saved ? 1 : 0))} personas lo guardaron
          </div>

          <div className="creator-row">
            <Pressable className="creator-link" label={`Ver perfil de ${author.name}`} onPress={() => onAuthor(author.id)}>
              <Avatar user={author} size={44} />
              <div>
                <strong>{author.name}</strong>
                <span>{formatCount(author.followers)} seguidores</span>
              </div>
            </Pressable>
            {author.id !== "me" && (
              <Pressable className={`follow-button ${isFollowing ? "following" : ""}`} label="Seguir" onPress={onFollow}>
                {isFollowing ? "Siguiendo" : "Seguir"}
              </Pressable>
            )}
          </div>

          <div className="comments">
            <div className="comments-title">
              {comments.length} comentarios
            </div>
            {comments.map((comment) => {
              const user = users[comment.userId]
              return (
                <div key={comment.id} className="comment">
                  <Avatar user={user} size={30} />
                  <div>
                    <p>
                      <strong>{user.name}</strong> {comment.text}
                    </p>
                    <span>{comment.time} · Responder</span>
                  </div>
                </div>
              )
            })}
            <div className="comment-input">
              <Avatar user={users.me} size={30} />
              <input
                ref={inputRef}
                value={draft}
                placeholder="Añade un comentario"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && send()}
              />
              <Pressable className={`send ${draft.trim() ? "ready" : ""}`} label="Publicar comentario" onPress={send}>
                <Icon name="send" size={17} />
              </Pressable>
            </div>
          </div>
        </div>
      </div>

      <div className="related">
        <h2 className="section-title">Más para explorar</h2>
        {related}
      </div>
    </section>
  )
}

function ExploreScreen({
  allPins,
  following,
  renderGrid,
  onFollow,
  onUser,
}: {
  allPins: Pin[]
  following: string[]
  renderGrid: (pins: Pin[]) => ReactNode
  onFollow: (id: string) => void
  onUser: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const term = query.trim().toLowerCase()
  const results = allPins.filter((pin) =>
    [pin.title, pin.category, users[pin.authorId].name, ...pin.tags].join(" ").toLowerCase().includes(term),
  )
  const topics = categories.slice(1).map((category) => ({
    category,
    pin: allPins.find((pin) => pin.category === category) ?? allPins[0],
  }))
  const creators = Object.values(users).filter((user) => user.id !== "me")

  return (
    <section className="screen explore-screen">
      <header className="screen-header sticky">
        <div className="search-field">
          <Icon name="search" size={18} />
          <input
            value={query}
            placeholder="Busca ideas, creadores o tableros"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <Pressable className="clear-search" label="Borrar búsqueda" onPress={() => setQuery("")}>
              <Icon name="close" size={14} />
            </Pressable>
          )}
        </div>
      </header>

      {term ? (
        <div className="screen-pad">
          <div className="results-head">
            <span className="kicker">RESULTADOS</span>
            <h2 className="section-title">
              {results.length} ideas para “{query.trim()}”
            </h2>
          </div>
          {results.length ? renderGrid(results) : <div className="empty">Prueba con otra palabra, como “brunch” o “salón”.</div>}
        </div>
      ) : (
        <div className="screen-pad">
          <Pressable className="explore-hero" label="Ver Interiores" onPress={() => setQuery("Interiores")}>
            <img src={photo("1583847268964-b28dc8f51f92", 1200)} alt="" />
            <div className="explore-hero-copy">
              <span>COLECCIÓN DE LA SEMANA</span>
              <strong>Casas que respiran calma</strong>
              <em>Explorar 128 ideas</em>
            </div>
          </Pressable>

          <div className="section-row">
            <h2 className="section-title">Ideas para ti</h2>
          </div>
          <div className="topic-grid">
            {topics.map(({ category, pin }) => (
              <Pressable key={category} className="topic" label={`Explorar ${category}`} onPress={() => setQuery(category)}>
                <img src={pin.image} alt="" />
                <span>{category}</span>
              </Pressable>
            ))}
          </div>

          <div className="section-row">
            <h2 className="section-title">Búsquedas populares</h2>
          </div>
          <div className="trend-chips">
            {trendingSearches.map((trend, index) => (
              <Pressable
                key={trend}
                className="trend-chip"
                label={`Buscar ${trend}`}
                onPress={() => setQuery(trend.split(" ")[0])}
              >
                <span className={`trend-dot dot-${index % 4}`} />
                {trend}
              </Pressable>
            ))}
          </div>

          <div className="section-row">
            <h2 className="section-title">Creadores para seguir</h2>
          </div>
          <div className="creator-strip">
            {creators.map((user) => {
              const thumbs = allPins.filter((pin) => pin.authorId === user.id).slice(0, 3)
              const isFollowing = following.includes(user.id)
              return (
                <div key={user.id} className="creator-card">
                  <Pressable className="creator-thumbs" label={`Ver perfil de ${user.name}`} onPress={() => onUser(user.id)}>
                    {thumbs.map((pin) => (
                      <img key={pin.id} src={pin.image} alt="" />
                    ))}
                  </Pressable>
                  <Avatar user={user} size={46} className="creator-avatar" />
                  <strong>{user.name}</strong>
                  <span>{formatCount(user.followers)} seguidores</span>
                  <Pressable
                    className={`follow-button small ${isFollowing ? "following" : ""}`}
                    label={isFollowing ? `Dejar de seguir a ${user.name}` : `Seguir a ${user.name}`}
                    onPress={() => onFollow(user.id)}
                  >
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </Pressable>
                </div>
              )
            })}
          </div>

          <div className="section-row">
            <h2 className="section-title">Popular ahora</h2>
          </div>
          {renderGrid([...allPins].sort((a, b) => b.saves - a.saves))}
        </div>
      )}
    </section>
  )
}

const samplePhotos = [
  photo("1631679706909-1844bbd07221"),
  photo("1527598041828-aea5d622f3a8"),
  photo("1654162241654-012eba1812d7"),
]

function CreateScreen({
  boards,
  onPublish,
}: {
  boards: Board[]
  onPublish: (data: { image: string; title: string; description: string; category: string; boardId: number | null }) => void
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Interiores")
  const [boardId, setBoardId] = useState<number | null>(boards[0]?.id ?? null)
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }
  const ready = Boolean(preview && title.trim())

  return (
    <section className="screen create-screen">
      <header className="screen-header">
        <span className="kicker">NUEVO PIN</span>
        <h1 className="screen-title">Comparte algo que inspire</h1>
      </header>
      <div className="create-layout screen-pad">
        <div className="create-media">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          {preview ? (
            <div className="create-preview">
              <img src={preview} alt="Vista previa" />
              <Pressable className="float-back" label="Quitar imagen" onPress={() => setPreview(null)}>
                <Icon name="close" size={18} />
              </Pressable>
            </div>
          ) : (
            <Pressable className="drop-zone" label="Seleccionar foto" onPress={() => fileRef.current?.click()}>
              <span className="drop-icon">
                <Icon name="image" size={26} />
              </span>
              <strong>Sube una foto</strong>
              <span>Recomendamos formato vertical y alta calidad.</span>
              <em>Elegir del dispositivo</em>
            </Pressable>
          )}
          {!preview && (
            <div className="sample-row">
              <span>O empieza con una muestra</span>
              <div>
                {samplePhotos.map((src) => (
                  <Pressable key={src} className="sample" label="Usar foto de muestra" onPress={() => setPreview(src)}>
                    <img src={src} alt="" />
                  </Pressable>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="create-form">
          <label className="field">
            <span>Título</span>
            <input value={title} placeholder="Dale un título memorable" onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Descripción</span>
            <textarea
              value={description}
              rows={3}
              placeholder="Cuenta la historia detrás de la idea"
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <div className="field">
            <span>Categoría</span>
            <div className="chip-wrap">
              {categories.slice(1).map((item) => (
                <Pressable
                  key={item}
                  className={`chip ${category === item ? "active" : ""}`}
                  label={item}
                  onPress={() => setCategory(item)}
                >
                  {item}
                </Pressable>
              ))}
            </div>
          </div>
          <div className="field">
            <span>Guardar también en</span>
            <div className="chip-wrap">
              {boards.map((board) => (
                <Pressable
                  key={board.id}
                  className={`chip ${boardId === board.id ? "active" : ""}`}
                  label={board.name}
                  onPress={() => setBoardId(boardId === board.id ? null : board.id)}
                >
                  {board.name}
                </Pressable>
              ))}
            </div>
          </div>
          <Pressable
            className={`publish ${ready ? "" : "disabled"}`}
            label="Publicar"
            disabled={!ready}
            onPress={() => preview && onPublish({ image: preview, title: title.trim(), description: description.trim(), category, boardId })}
          >
            Publicar Pin
          </Pressable>
          {!ready && <span className="publish-hint">Añade una imagen y un título para publicar.</span>}
        </div>
      </div>
    </section>
  )
}

function ActivityScreen({
  initialMode,
  allPins,
  following,
  onFollow,
  onUser,
  onOpenPin,
}: {
  initialMode: "notif" | "msgs"
  allPins: Pin[]
  following: string[]
  onFollow: (id: string) => void
  onUser: (id: string) => void
  onOpenPin: (id: number) => void
}) {
  const [mode, setMode] = useState(initialMode)
  const [chats, setChats] = useState(seedChats)
  const [openChat, setOpenChat] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [read, setRead] = useState<string[]>([])
  const pinById = (id?: number) => allPins.find((pin) => pin.id === id)

  const send = () => {
    if (!openChat || !draft.trim()) return
    setChats({ ...chats, [openChat]: [...chats[openChat], { from: "me", text: draft.trim() }] })
    setDraft("")
  }

  if (openChat) {
    const user = users[openChat]
    return (
      <section className="screen chat-screen">
        <header className="chat-head">
          <Pressable className="icon-button" label="Volver" onPress={() => setOpenChat(null)}>
            <Icon name="back" size={20} />
          </Pressable>
          <Pressable className="chat-user" label={`Ver perfil de ${user.name}`} onPress={() => onUser(user.id)}>
            <Avatar user={user} size={34} />
            <div>
              <strong>{user.name}</strong>
              <span>@{user.handle}</span>
            </div>
          </Pressable>
        </header>
        <div className="chat-thread">
          {chats[openChat].map((message, index) => {
            const pin = pinById(message.pinId)
            return (
              <div key={index} className={`bubble-row ${message.from === "me" ? "mine" : ""}`}>
                {pin ? (
                  <Pressable className="bubble-pin" label={`Abrir ${pin.title}`} onPress={() => onOpenPin(pin.id)}>
                    <img src={pin.image} alt="" />
                    <span>{pin.title}</span>
                  </Pressable>
                ) : (
                  <span className="bubble">{message.text}</span>
                )}
              </div>
            )
          })}
        </div>
        <div className="chat-input">
          <input
            value={draft}
            placeholder="Escribe un mensaje"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && send()}
          />
          <Pressable className={`send ${draft.trim() ? "ready" : ""}`} label="Enviar" onPress={send}>
            <Icon name="send" size={17} />
          </Pressable>
        </div>
      </section>
    )
  }

  return (
    <section className="screen activity-screen">
      <header className="screen-header sticky">
        <div className="segmented">
          <Pressable className={mode === "notif" ? "active" : ""} label="Notificaciones" onPress={() => setMode("notif")}>
            Notificaciones
          </Pressable>
          <Pressable className={mode === "msgs" ? "active" : ""} label="Mensajes" onPress={() => setMode("msgs")}>
            Mensajes
          </Pressable>
        </div>
      </header>
      <div className="screen-pad narrow">
        {mode === "notif" ? (
          ["Nuevo", "Esta semana"].map((group) => (
            <div key={group} className="notif-group">
              <h2 className="group-title">{group}</h2>
              {notifications
                .filter((item) => item.group === group)
                .map((item) => {
                  const user = users[item.userId]
                  const pin = pinById(item.pinId)
                  const isFollowing = following.includes(user.id)
                  return (
                    <div key={item.id} className="notif">
                      <Pressable className="notif-avatar" label={`Ver perfil de ${user.name}`} onPress={() => onUser(user.id)}>
                        <Avatar user={user} size={44} />
                      </Pressable>
                      <p>
                        <strong>{user.name}</strong> {item.text} {item.highlight && <strong>{item.highlight}</strong>}
                        <span> · {item.time}</span>
                      </p>
                      {item.follow ? (
                        <Pressable
                          className={`follow-button small ${isFollowing ? "following" : ""}`}
                          label="Seguir"
                          onPress={() => onFollow(user.id)}
                        >
                          {isFollowing ? "Siguiendo" : "Seguir"}
                        </Pressable>
                      ) : (
                        pin && (
                          <Pressable className="notif-thumb" label={`Abrir ${pin.title}`} onPress={() => onOpenPin(pin.id)}>
                            <img src={pin.image} alt="" />
                          </Pressable>
                        )
                      )}
                    </div>
                  )
                })}
            </div>
          ))
        ) : (
          <div className="inbox">
            <div className="search-field compact">
              <Icon name="search" size={16} />
              <input placeholder="Buscar conversaciones" />
            </div>
            {Object.keys(chats).map((id) => {
              const user = users[id]
              const last = chats[id][chats[id].length - 1]
              const unread = chatMeta[id].unread && !read.includes(id)
              return (
                <Pressable
                  key={id}
                  className={`conversation ${unread ? "unread" : ""}`}
                  label={`Abrir conversación con ${user.name}`}
                  onPress={() => {
                    setRead([...read, id])
                    setOpenChat(id)
                  }}
                >
                  <Avatar user={user} size={50} />
                  <div>
                    <strong>{user.name}</strong>
                    <span>
                      {last.from === "me" ? "Tú: " : ""}
                      {last.text ?? "Te envió un Pin"} · {chatMeta[id].time}
                    </span>
                  </div>
                  {unread && <i className="unread-dot" />}
                </Pressable>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function ProfileView({
  user,
  isMe,
  createdPins,
  boards,
  pinsById,
  isFollowing,
  renderGrid,
  overlay,
  onBack,
  onFollow,
  onMessage,
  onBoard,
  onCreateBoard,
  onCreatePin,
  onLogout,
}: {
  user: User
  isMe: boolean
  createdPins: Pin[]
  boards: Board[]
  pinsById: (id: number) => Pin | undefined
  isFollowing: boolean
  renderGrid: (pins: Pin[]) => ReactNode
  overlay?: boolean
  onBack?: () => void
  onFollow?: () => void
  onMessage?: () => void
  onBoard: (id: number) => void
  onCreateBoard: (name: string) => void
  onCreatePin: () => void
  onLogout?: () => void
}) {
  const [tab, setTab] = useState<"saved" | "created">(isMe ? "saved" : "created")
  const [newBoard, setNewBoard] = useState<string | null>(null)
  const allSaved = [...new Set(boards.flatMap((board) => board.pinIds))]
    .map(pinsById)
    .filter(Boolean) as Pin[]

  return (
    <section className={overlay ? "overlay-screen profile-screen" : "screen profile-screen"}>
      <div className="profile-bar">
        {onBack ? (
          <Pressable className="icon-button" label="Volver" onPress={onBack}>
            <Icon name="back" size={20} />
          </Pressable>
        ) : (
          <span />
        )}
        {isMe ? (
          <Pressable className="icon-button" label="Cerrar sesión" onPress={() => onLogout?.()}>
            <Icon name="settings" size={19} />
          </Pressable>
        ) : (
          <Pressable className="icon-button" label="Más opciones" onPress={() => undefined}>
            <Icon name="more" size={18} />
          </Pressable>
        )}
      </div>
      <div className="profile-head">
        <Avatar user={user} size={96} className="profile-avatar" />
        <h1>{user.name}</h1>
        <span className="handle">@{user.handle}</span>
        <p className="bio">{user.bio}</p>
        <div className="profile-stats">
          <span>
            <strong>{formatCount(user.followers + (isFollowing ? 1 : 0))}</strong> seguidores
          </span>
          <i />
          <span>
            <strong>{isMe ? 486 : 312}</strong> siguiendo
          </span>
        </div>
        <div className="profile-actions">
          {isMe ? (
            <>
              <Pressable className="soft-button" label="Compartir perfil" onPress={() => undefined}>
                Compartir
              </Pressable>
              <Pressable className="soft-button" label="Editar perfil" onPress={() => undefined}>
                Editar perfil
              </Pressable>
            </>
          ) : (
            <>
              <Pressable className="soft-button" label="Enviar mensaje" onPress={() => onMessage?.()}>
                Mensaje
              </Pressable>
              <Pressable className={`follow-button ${isFollowing ? "following" : ""}`} label="Seguir" onPress={() => onFollow?.()}>
                {isFollowing ? "Siguiendo" : "Seguir"}
              </Pressable>
            </>
          )}
        </div>
      </div>

      {isMe && (
        <div className="profile-tabs">
          <Pressable className={tab === "created" ? "active" : ""} label="Creados" onPress={() => setTab("created")}>
            Creados
          </Pressable>
          <Pressable className={tab === "saved" ? "active" : ""} label="Guardados" onPress={() => setTab("saved")}>
            Guardados
          </Pressable>
        </div>
      )}

      <div className="screen-pad">
        {tab === "saved" && isMe ? (
          <>
            <div className="board-grid">
              <Pressable className="board-card" label="Todos los Pines" onPress={() => onBoard(0)}>
                <BoardCover pins={allSaved} />
                <strong>Todos los Pines</strong>
                <span>{allSaved.length} Pines</span>
              </Pressable>
              {boards.map((board) => (
                <Pressable key={board.id} className="board-card" label={`Abrir ${board.name}`} onPress={() => onBoard(board.id)}>
                  <BoardCover pins={board.pinIds.map(pinsById).filter(Boolean) as Pin[]} />
                  <strong>
                    {board.name}
                    {board.secret && <Icon name="lock" size={12} />}
                  </strong>
                  <span>{board.pinIds.length} Pines</span>
                </Pressable>
              ))}
              {newBoard === null ? (
                <Pressable className="board-card new" label="Crear tablero" onPress={() => setNewBoard("")}>
                  <div className="board-new">
                    <Icon name="plus" size={24} />
                  </div>
                  <strong>Nuevo tablero</strong>
                  <span>Organiza tus ideas</span>
                </Pressable>
              ) : (
                <div className="board-card new">
                  <div className="board-new form">
                    <input
                      autoFocus
                      value={newBoard}
                      placeholder="Nombre"
                      onChange={(event) => setNewBoard(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && newBoard.trim()) {
                          onCreateBoard(newBoard.trim())
                          setNewBoard(null)
                        }
                        if (event.key === "Escape") setNewBoard(null)
                      }}
                    />
                    <Pressable
                      className="solid-button"
                      label="Crear"
                      disabled={!newBoard.trim()}
                      onPress={() => {
                        onCreateBoard(newBoard.trim())
                        setNewBoard(null)
                      }}
                    >
                      Crear
                    </Pressable>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : createdPins.length ? (
          renderGrid(createdPins)
        ) : (
          <div className="empty">
            Aún no hay Pines creados.
            {isMe && (
              <Pressable className="solid-button" label="Crear Pin" onPress={onCreatePin}>
                Crear tu primer Pin
              </Pressable>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User>(users.me)
  const [tab, setTab] = useState<Tab>("home")
  const [activityMode, setActivityMode] = useState<"notif" | "msgs">("notif")
  const [feedMode, setFeedMode] = useState<"foryou" | "following">("foryou")
  const [category, setCategory] = useState("Para ti")
  const [allPins, setAllPins] = useState<Pin[]>(seedPins)
  const [boards, setBoards] = useState<Board[]>(seedBoards)
  const [liked, setLiked] = useState<number[]>([2, 8])
  const [following, setFollowing] = useState<string[]>(["u1", "u2", "u6"])
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [stack, setStack] = useState<Overlay[]>([])
  const [savePinId, setSavePinId] = useState<number | null>(null)
  const [lastBoardId, setLastBoardId] = useState(1)
  const [story, setStory] = useState<number | null>(null)
  const [seen, setSeen] = useState<string[]>([])
  const [toast, setToast] = useState<{ text: string; strong?: string; image?: string; boardId?: number } | null>(null)
  const [seenActivity, setSeenActivity] = useState(false)

  // Mantener la sesión iniciada si el usuario recarga la página
  useEffect(() => {
    const savedUser = localStorage.getItem("glowup_user")
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User
        users.me = parsed
        setCurrentUser(parsed)
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem("glowup_user")
      }
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const pinsById = (id: number) => allPins.find((pin) => pin.id === id)
  const isSaved = (id: number) => boards.some((board) => board.pinIds.includes(id))
  const commentsFor = (id: number) => comments[id] ?? seedComments(id)

  const storyUsers = Object.values(users).filter((user) => user.id !== "me" && user.id !== currentUser.id)
  const storyPins = storyUsers.map((user) => allPins.find((pin) => pin.authorId === user.id) ?? allPins[0])

  const feedPins = useMemo(() => {
    if (feedMode === "following") {
      return allPins.filter((pin) => following.includes(pin.authorId) || pin.authorId === "me")
    }
    return category === "Para ti" ? allPins : allPins.filter((pin) => pin.category === category)
  }, [allPins, category, feedMode, following])

  const open = (overlay: Overlay) => setStack((items) => [...items, overlay])
  const back = () => setStack((items) => items.slice(0, -1))
  const goTab = (next: Tab) => {
    setStack([])
    setTab(next)
    if (next === "activity") setSeenActivity(true)
  }
  const openUser = (id: string) => (id === "me" || id === currentUser.id ? goTab("profile") : open({ kind: "user", id }))

  const toggleLike = (id: number) =>
    setLiked((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]))
  const toggleFollow = (id: string) =>
    setFollowing((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]))

  const saveToBoard = (pinId: number, boardId: number) => {
    const board = boards.find((item) => item.id === boardId)
    if (!board) return
    setBoards((items) =>
      items.map((item) => (item.id === boardId && !item.pinIds.includes(pinId) ? { ...item, pinIds: [pinId, ...item.pinIds] } : item)),
    )
    setLastBoardId(boardId)
    setToast({ text: "Guardado en", strong: board.name, image: pinsById(pinId)?.image, boardId })
  }

  const toggleInBoard = (pinId: number, boardId: number) => {
    const board = boards.find((item) => item.id === boardId)
    if (board?.pinIds.includes(pinId)) {
      setBoards((items) =>
        items.map((item) => (item.id === boardId ? { ...item, pinIds: item.pinIds.filter((id) => id !== pinId) } : item)),
      )
    } else {
      saveToBoard(pinId, boardId)
      setSavePinId(null)
    }
  }

  const createBoard = (name: string, pinId?: number) => {
    const id = Date.now()
    setBoards((items) => [...items, { id, name, pinIds: pinId ? [pinId] : [] }])
    if (pinId) {
      setLastBoardId(id)
      setSavePinId(null)
      setToast({ text: "Guardado en", strong: name, image: pinsById(pinId)?.image, boardId: id })
    } else {
      setToast({ text: "Tablero creado:", strong: name })
    }
  }

  const renderGrid = (list: Pin[]) => (
    <div className="masonry">
      {list.map((pin) => (
        <PinCard
          key={pin.id}
          pin={pin}
          author={pin.authorId === "me" ? currentUser : (users[pin.authorId] ?? currentUser)}
          saved={isSaved(pin.id)}
          onOpen={() => open({ kind: "pin", id: pin.id })}
          onSave={() => setSavePinId(pin.id)}
          onAuthor={() => openUser(pin.authorId)}
        />
      ))}
    </div>
  )

  const top = stack[stack.length - 1]
  let overlayView: ReactNode = null

  if (top?.kind === "pin") {
    const pin = pinsById(top.id)
    if (pin) {
      const related = allPins
        .filter((item) => item.id !== pin.id)
        .sort((a, b) => Number(b.category === pin.category) - Number(a.category === pin.category))
      overlayView = (
        <PinDetail
          key={pin.id}
          pin={pin}
          author={pin.authorId === "me" ? currentUser : (users[pin.authorId] ?? currentUser)}
          liked={liked.includes(pin.id)}
          saved={isSaved(pin.id)}
          lastBoardName={boards.find((board) => board.id === lastBoardId)?.name ?? "Tablero"}
          isFollowing={following.includes(pin.authorId)}
          comments={commentsFor(pin.id)}
          related={renderGrid(related)}
          onBack={back}
          onLike={() => toggleLike(pin.id)}
          onQuickSave={() => (isSaved(pin.id) ? setSavePinId(pin.id) : saveToBoard(pin.id, lastBoardId))}
          onPickBoard={() => setSavePinId(pin.id)}
          onFollow={() => toggleFollow(pin.authorId)}
          onAuthor={openUser}
          onShare={() => setToast({ text: "Enlace copiado.", strong: "Compártelo donde quieras" })}
          onComment={(text) =>
            setComments((items) => ({
              ...items,
              [pin.id]: [...commentsFor(pin.id), { id: Date.now(), userId: "me", text, time: "Ahora" }],
            }))
          }
        />
      )
    }
  } else if (top?.kind === "user") {
    const user = users[top.id]
    overlayView = (
      <ProfileView
        key={user.id}
        overlay
        user={user}
        isMe={false}
        createdPins={allPins.filter((pin) => pin.authorId === user.id)}
        boards={[]}
        pinsById={pinsById}
        isFollowing={following.includes(user.id)}
        renderGrid={renderGrid}
        onBack={back}
        onFollow={() => toggleFollow(user.id)}
        onMessage={() => {
          setActivityMode("msgs")
          goTab("activity")
        }}
        onBoard={() => undefined}
        onCreateBoard={() => undefined}
        onCreatePin={() => undefined}
      />
    )
  } else if (top?.kind === "board") {
    const board =
      top.id === 0
        ? { id: 0, name: "Todos los Pines", pinIds: [...new Set(boards.flatMap((item) => item.pinIds))] }
        : boards.find((item) => item.id === top.id)
    if (board) {
      const boardPins = board.pinIds.map(pinsById).filter(Boolean) as Pin[]
      const collaborators = [...new Set(boardPins.map((pin) => pin.authorId))].slice(0, 4)
      overlayView = (
        <section className="overlay-screen board-screen">
          <div className="profile-bar">
            <Pressable className="icon-button" label="Volver" onPress={back}>
              <Icon name="back" size={20} />
            </Pressable>
            <Pressable className="icon-button" label="Compartir tablero" onPress={() => setToast({ text: "Enlace del tablero copiado." })}>
              <Icon name="share" size={19} />
            </Pressable>
          </div>
          <div className="board-head">
            <span className="kicker">TABLERO</span>
            <h1>
              {board.name}
              {"secret" in board && board.secret && <Icon name="lock" size={18} />}
            </h1>
            <div className="board-meta">
              <div className="avatar-stack">
                <Avatar user={currentUser} size={28} />
                {collaborators.map((id) => (
                  <Avatar key={id} user={users[id] ?? currentUser} size={28} />
                ))}
              </div>
              <span>{boardPins.length} Pines</span>
            </div>
          </div>
          <div className="screen-pad">
            {boardPins.length ? (
              renderGrid(boardPins)
            ) : (
              <div className="empty">
                Este tablero está vacío. Toca “Guardar” en cualquier Pin para añadir ideas.
              </div>
            )}
          </div>
        </section>
      )
    }
  }

  const savePin = savePinId !== null ? pinsById(savePinId) : undefined
  const followingCount = following.length

  return (
    <main className="app-stage">
      <section className="iphone-frame" aria-label="Aplicación GlowUp">
        <StatusBar />

        {!isAuthenticated ? (
          <LoginScreen
            onLogin={(loggedUser) => {
              users.me = loggedUser
              setCurrentUser(loggedUser)
              setIsAuthenticated(true)
            }}
          />
        ) : (
          <>
            {tab === "home" && (
              <section className="screen home-screen">
                <header className="home-header">
                  <div className="home-top">
                    <div className="brand">
                      <span className="brand-mark">G</span>
                      <span className="brand-word">GlowUp</span>
                    </div>
                    <div className="feed-switch" role="tablist" aria-label="Tipo de feed">
                      <Pressable
                        className={feedMode === "foryou" ? "active" : ""}
                        label="Para ti"
                        onPress={() => setFeedMode("foryou")}
                      >
                        Para ti
                      </Pressable>
                      <Pressable
                        className={feedMode === "following" ? "active" : ""}
                        label="Siguiendo"
                        onPress={() => setFeedMode("following")}
                      >
                        Siguiendo
                      </Pressable>
                    </div>
                    <Pressable className="home-search" label="Buscar" onPress={() => goTab("explore")}>
                      <Icon name="search" size={17} />
                      <span>Busca ideas, creadores y tableros</span>
                    </Pressable>
                    <Pressable
                      className="icon-button"
                      label="Mensajes"
                      onPress={() => {
                        setActivityMode("msgs")
                        goTab("activity")
                      }}
                    >
                      <Icon name="message" size={21} />
                      {!seenActivity && <span className="badge">2</span>}
                    </Pressable>
                  </div>
                  {feedMode === "foryou" && (
                    <nav className="chips" aria-label="Categorías">
                      {categories.map((item) => (
                        <Pressable
                          key={item}
                          className={`chip ${category === item ? "active" : ""}`}
                          label={`Ver ${item}`}
                          onPress={() => setCategory(item)}
                        >
                          {item}
                        </Pressable>
                      ))}
                    </nav>
                  )}
                </header>

                <div className="stories" aria-label="Historias">
                  <Pressable className="story" label="Crear historia" onPress={() => goTab("create")}>
                    <span className="story-ring own">
                      <Avatar user={currentUser} size={56} />
                      <i>
                        <Icon name="plus" size={11} />
                      </i>
                    </span>
                    <span>Tu historia</span>
                  </Pressable>
                  {storyUsers.map((user, index) => (
                    <Pressable
                      key={user.id}
                      className="story"
                      label={`Ver historia de ${user.name}`}
                      onPress={() => {
                        setStory(index)
                        setSeen((items) => [...new Set([...items, user.id])])
                      }}
                    >
                      <span className={`story-ring ${seen.includes(user.id) ? "seen" : ""}`}>
                        <Avatar user={user} size={56} />
                      </span>
                      <span>{user.name.split(" ")[0]}</span>
                    </Pressable>
                  ))}
                </div>

                {feedMode === "following" && (
                  <div className="feed-note">
                    <span className="kicker">SIGUIENDO</span>
                    <strong>Lo último de {followingCount} creadores que sigues</strong>
                  </div>
                )}

                <div className="screen-pad tight">
                  {feedPins.length ? renderGrid(feedPins) : <div className="empty">Sigue a creadores para llenar este feed.</div>}
                </div>
              </section>
            )}

            {tab === "explore" && (
              <ExploreScreen
                allPins={allPins}
                following={following}
                renderGrid={renderGrid}
                onFollow={toggleFollow}
                onUser={openUser}
              />
            )}

            {tab === "create" && (
              <CreateScreen
                boards={boards}
                onPublish={({ image, title, description, category: pinCategory, boardId }) => {
                  const id = Date.now()
                  setAllPins((items) => [
                    {
                      id,
                      title,
                      description: description || "Una nueva idea para inspirar a la comunidad.",
                      category: pinCategory,
                      image,
                      ratio: "4 / 5",
                      authorId: "me",
                      likes: 0,
                      saves: 0,
                      tags: [pinCategory.toLowerCase()],
                    },
                    ...items,
                  ])
                  if (boardId) {
                    setBoards((items) => items.map((item) => (item.id === boardId ? { ...item, pinIds: [id, ...item.pinIds] } : item)))
                  }
                  setFeedMode("foryou")
                  setCategory("Para ti")
                  goTab("home")
                  setToast({ text: "Tu Pin ya está publicado:", strong: title, image })
                }}
              />
            )}

            {tab === "activity" && (
              <ActivityScreen
                key={activityMode}
                initialMode={activityMode}
                allPins={allPins}
                following={following}
                onFollow={toggleFollow}
                onUser={openUser}
                onOpenPin={(id) => open({ kind: "pin", id })}
              />
            )}

            {tab === "profile" && (
              <ProfileView
                user={currentUser}
                isMe
                createdPins={allPins.filter((pin) => pin.authorId === "me")}
                boards={boards}
                pinsById={pinsById}
                isFollowing={false}
                renderGrid={renderGrid}
                onBoard={(id) => open({ kind: "board", id })}
                onCreateBoard={(name) => createBoard(name)}
                onCreatePin={() => goTab("create")}
                onLogout={() => {
                  localStorage.removeItem("glowup_token")
                  localStorage.removeItem("glowup_user")
                  setIsAuthenticated(false)
                  goTab("home")
                }}
              />
            )}

            {overlayView}

            <nav className="TabBar" aria-label="Navegación principal">
              <span className="rail-logo">G</span>
              {(
                [
                  ["home", "Inicio", "home"],
                  ["explore", "Explorar", "search"],
                  ["create", "Crear", "plus"],
                  ["activity", "Actividad", "bell"],
                ] as [Tab, string, IconName][]
              ).map(([id, label, icon]) => (
                <Pressable
                  key={id}
                  className={`tab-item ${id === "create" ? "create" : ""} ${tab === id && !top ? "active" : ""}`}
                  label={label}
                  onPress={() => {
                    if (id === "activity") setActivityMode("notif")
                    goTab(id)
                  }}
                >
                  <span className="tab-icon">
                    <Icon name={icon} size={id === "create" ? 22 : 21} />
                    {id === "activity" && !seenActivity && <i className="tab-dot" />}
                  </span>
                  <span className="tab-label">{label}</span>
                </Pressable>
              ))}
              <Pressable
                className={`tab-item ${tab === "profile" && !top ? "active" : ""}`}
                label="Perfil"
                onPress={() => goTab("profile")}
              >
                <span className="tab-icon">
                  <Avatar user={currentUser} size={24} className="tab-avatar" />
                </span>
                <span className="tab-label">Perfil</span>
              </Pressable>
            </nav>

            {toast && (
              <div className="toast" role="status">
                {toast.image && <img src={toast.image} alt="" />}
                <span>
                  {toast.text} {toast.strong && <strong>{toast.strong}</strong>}
                </span>
                {toast.boardId && (
                  <Pressable
                    className="toast-action"
                    label="Ver tablero"
                    onPress={() => {
                      const boardId = toast.boardId as number
                      setToast(null)
                      setStack([])
                      setTab("profile")
                      open({ kind: "board", id: boardId })
                    }}
                  >
                    Ver
                  </Pressable>
                )}
              </div>
            )}

            {savePin && (
              <SaveSheet
                pin={savePin}
                boards={boards}
                pinsById={pinsById}
                onToggle={(boardId) => toggleInBoard(savePin.id, boardId)}
                onCreate={(name) => createBoard(name, savePin.id)}
                onClose={() => setSavePinId(null)}
              />
            )}

            {story !== null && (
              <StoryViewer
                storyUsers={storyUsers}
                storyPins={storyPins}
                index={story}
                saved={isSaved(storyPins[story].id)}
                onIndex={(index) => {
                  setStory(index)
                  setSeen((items) => [...new Set([...items, storyUsers[index].id])])
                }}
                onClose={() => setStory(null)}
                onOpenPin={(pin) => {
                  setStory(null)
                  open({ kind: "pin", id: pin.id })
                }}
                onSave={(pin) => setSavePinId(pin.id)}
              />
            )}

            <div className="home-indicator" />
          </>
        )}
      </section>
    </main>
  )
}