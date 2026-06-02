import { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BarChart2, Users, LogOut, Menu, X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const navItems = [
  { to: "/admin/metricas",  label: "Métricas",  icon: BarChart2 },
  { to: "/admin/usuarios",  label: "Usuários",  icon: Users },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.name ?? "Admin";
  const firstLetter = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
    toast.success("Sessão encerrada");
  };

  const Avatar = ({ size = 32 }: { size?: number }) => (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-primary/10 flex items-center justify-center shrink-0"
    >
      <span className="text-primary font-bold" style={{ fontSize: size * 0.38 }}>
        {firstLetter}
      </span>
    </div>
  );

  const UserMenu = ({ mobile = false }: { mobile?: boolean }) => (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      >
        <Avatar size={32} />
        {(!isMobile || mobile) && (
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-semibold truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground">super_admin</p>
          </div>
        )}
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div
            className={cn(
              "absolute z-50 bg-card border border-border rounded-xl shadow-lg py-1.5 min-w-[180px]",
              mobile ? "bottom-full mb-2 left-0 right-0" : "bottom-full mb-2 left-0"
            )}
          >
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-xs font-semibold truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground">super_admin</p>
            </div>
            <button
              onClick={() => { setMenuOpen(false); handleSignOut(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </>
      )}
    </div>
  );

  const sidebarContent = (mobile = false) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
        <img src="/simplou-logo-1080-200.png" alt="Simplou" className="h-6" />
        {mobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: user menu */}
      <div className="border-t border-border px-2 py-3 shrink-0">
        <UserMenu mobile={mobile} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 h-full w-56 bg-card border-r border-border z-30">
          {sidebarContent()}
        </aside>
      )}

      {/* Mobile overlay */}
      {isMobile && (
        <>
          <div
            className={cn(
              "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300",
              mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className={cn(
              "fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transition-transform duration-300 ease-in-out",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {sidebarContent(true)}
          </aside>
        </>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-30 flex items-center justify-between px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
          >
            <Menu size={20} />
          </button>
          <img src="/simplou-logo-1080-200.png" alt="Simplou" className="h-6" />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="relative"
          >
            <Avatar size={32} />
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                <div className="absolute right-0 top-10 z-50 bg-card border border-border rounded-xl shadow-lg py-1.5 min-w-[180px]">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-semibold truncate">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground">super_admin</p>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); handleSignOut(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
                  >
                    <LogOut size={14} /> Sair
                  </button>
                </div>
              </>
            )}
          </button>
        </header>
      )}

      {/* Main content */}
      <main
        className={cn(
          "flex-1 min-h-screen transition-all duration-300 overflow-auto",
          isMobile ? "pt-14" : "ml-56"
        )}
      >
        {children}
      </main>
    </div>
  );
}
