export default function Header() {
  return (
    <header
      className="mb-6 shadow-md border-b"
      style={{ backgroundColor: '#D1D6F6' }}
    >
      <div className="container mx-auto flex items-center justify-center gap-4 py-4">
        <img
          src="/logoAdav.png"
          alt="Logo Collège Les Vignes"
          style={{
            height: '70px',
            width: 'auto',
          }}
          className="drop-shadow-md"
        />
        <div className="flex flex-col items-start">
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: '#1b0a6d' }}
          >
            Collège Les Vignes
          </h1>
          <span
            className="text-sm font-medium tracking-wide uppercase"
            style={{ color: '#d3243a' }}
          >
            Annuaire des anciennes élèves
          </span>
        </div>
      </div>
    </header>
  )
}
