'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, LogIn } from 'lucide-react';
import { institutionApi, utils, DescripcionInstitucion } from '@/lib/api';

interface NavItem {
  name: string;
  href?: string;
  children?: NavItem[];
}

const navStructure: NavItem[] = [
  { name: 'Inicio', href: '/' },
  {
    name: 'Carrera',
    children: [
      { name: 'Nosotros', href: '/nosotros' },
    ]
  },
  {
    name: 'Convocatorias',
    children: [
      { name: 'Convocatorias', href: '/convocatorias' },
      { name: 'Comunicados', href: '/comunicados' },
      { name: 'Avisos', href: '/avisos' }
    ]
  },
  {
    name: 'Cursos',
    children: [
      { name: 'Cursos', href: '/cursos' },
      { name: 'Seminarios', href: '/seminarios' }
    ]
  },
  {
    name: 'Más',
    children: [
      { name: 'Servicios', href: '/servicios' },
      { name: 'Ofertas Académicas', href: '/ofertas' },
      { name: 'Publicaciones', href: '/publicaciones' },
      { name: 'Gacetas', href: '/gacetas' },
      { name: 'Eventos', href: '/eventos' },
      { name: 'Videos', href: '/videos' }
    ]
  },
  { name: 'Contactos', href: '/contacto' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [institucion, setInstitucion] = useState<DescripcionInstitucion | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [autoRotate, setAutoRotate] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    
    let animationFrameId: number;
    const animate = () => {
      setAutoRotate(prev => (prev + 0.5) % 360);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    
    const fetchData = async () => {
      try {
        const data = await institutionApi.getCurrentPrincipal();
        setInstitucion(data);
        
        if (data.colorinstitucion?.[0]) {
          const colors = data.colorinstitucion[0];
          document.documentElement.style.setProperty('--color-primario', colors.color_primario);
          document.documentElement.style.setProperty('--color-secundario', colors.color_secundario);
          document.documentElement.style.setProperty('--color-terciario', colors.color_terciario);
          
          const primarioRgb = hexToRgb(colors.color_primario);
          const secundarioRgb = hexToRgb(colors.color_secundario);
          document.documentElement.style.setProperty('--color-primario-rgb', primarioRgb);
          document.documentElement.style.setProperty('--color-secundario-rgb', secundarioRgb);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xRotation = ((y - rect.height / 2) / rect.height) * -20;
    const yRotation = ((x - rect.width / 2) / rect.width) * 20;
    
    setRotateX(xRotation);
    setRotateY(yRotation);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const logoUrl = institucion ? utils.buildImageUrl(institucion.institucion_logo) : '';

  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 166, 81';
  }

  const particlePositions = isMounted 
    ? [...Array(5)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: `${10 + Math.random() * 10}s`,
        delay: `${Math.random() * 5}s`,
      }))
    : [...Array(5)].map(() => ({ left: '0%', top: '0%', duration: '10s', delay: '0s' }));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      
      <div className="absolute inset-0 navbar-glass-dynamic bg-construction-grid" />
      
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ 
          boxShadow: '0 0 20px var(--color-primario), 0 0 40px var(--color-primario)',
          opacity: 0.6 
        }}
      />

      <div className="relative container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center justify-between">
           
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => scrollToSection('inicio')}
          >
            {loading ? (
              <div className="w-20 h-20 bg-slate-700 rounded-2xl animate-pulse" />
            ) : (
              <div 
                className="logo-3d-container relative"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY + autoRotate}deg)`,
                  transition: rotateX === 0 && rotateY === 0 ? 'none' : 'transform 0.1s ease-out',
                }}
              >
                <div 
                  className="absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                  style={{ backgroundColor: 'var(--color-primario)' }}
                />
                
                <div className="relative w-20 h-20 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm group-hover:border-[var(--color-primario)] transition-colors">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo Institución"
                      className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[var(--color-primario)]">
                      IC
                    </div>
                  )}
                </div>

                <div 
                  className="absolute -inset-2 rounded-2xl border-2 border-dashed opacity-60 pointer-events-none"
                  style={{ 
                    borderColor: 'var(--color-terciario)',
                    animation: 'spin-slow 20s linear infinite',
                  }}
                />
              </div>
            )}

            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {institucion?.institucion_nombre || 'Cargando...'}
              </h1>
              <p className="text-sm font-medium text-[var(--color-primario)]">
                {institucion?.institucion_iniciales || 'UPEA'}
              </p>
            </div>
          </div>
 
          <div className="hidden lg:flex items-center gap-1">
            {navStructure.map((item) => (
              <div key={item.name} className="relative group">
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                    >
                      {item.name}
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                    </button>
                     
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px]">
                      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-xl shadow-black/30 overflow-hidden py-2">
                        {item.children.map((child) => (
                          <div key={child.name} className="relative group/nested">
                            {child.children ? (
                              <>
                                <div className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-emerald-500/10 cursor-pointer transition-colors">
                                  {child.name}
                                  <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                                </div>
                            
                                <div className="absolute left-full top-0 ml-1 pt-2 opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-200 min-w-[180px]">
                                  <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-xl shadow-black/30 overflow-hidden py-2">
                                    {child.children.map((sub) => (
                                      <a
                                        key={sub.name}
                                        href={sub.href}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2 text-sm text-slate-300 hover:text-[var(--color-primario)] hover:bg-[var(--color-primario)]/10 transition-colors"
                                      >
                                        {sub.name}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <a
                                href={child.href}
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2.5 text-sm text-slate-300 hover:text-[var(--color-primario)] hover:bg-[var(--color-primario)]/10 transition-colors"
                              >
                                {child.name}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <a
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
          </div> 

          <div className="hidden lg:flex items-center gap-4">
          
            <a
              href="/enlaces"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-[var(--color-primario)] border border-[var(--color-primario)]/40 rounded-lg hover:bg-[var(--color-primario)]/10 transition-all"
            >
              Enlaces
            </a>
             
            <a
              href="https://servicioadministrador.upea.bo/sign-in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--color-primario-rgb),0.4)]"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-primario), var(--color-secundario))',
                color: '#020617'
              }}
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </a>
          </div>
 
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-[var(--color-primario)] transition-colors"
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
 
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-[var(--color-primario)]/30 pt-4 space-y-2 animate-in slide-in-from-top-5">
            {navStructure.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {item.name}
                      <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${activeDropdown === item.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="pl-4 border-l-2 border-[var(--color-primario)]/30 ml-4 space-y-1 py-2">
                        {item.children.map((child) => (
                          <div key={child.name}>
                            {child.children ? (
                              <>
                                <button
                                  onClick={() => toggleDropdown(child.name)}
                                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-400 hover:text-[var(--color-primario)] rounded-md hover:bg-[var(--color-primario)]/10 transition-colors"
                                >
                                  {child.name}
                                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === child.name ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${activeDropdown === child.name ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                  <div className="pl-4 space-y-1 py-1">
                                    {child.children.map((sub) => (
                                      <a
                                        key={sub.name}
                                        href={sub.href}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 text-xs text-slate-500 hover:text-[var(--color-primario)] hover:bg-[var(--color-primario)]/5 rounded-md transition-colors"
                                      >
                                        {sub.name}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <a
                                href={child.href}
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 text-sm text-slate-400 hover:text-[var(--color-primario)] hover:bg-[var(--color-primario)]/10 rounded-md transition-colors"
                              >
                                {child.name}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <a
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
        
            <div className="pt-4 border-t border-[var(--color-primario)]/30 mt-4 space-y-3">
              <a
                href="/enlaces"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-center text-sm font-semibold text-[var(--color-primario)] border border-[var(--color-primario)]/40 rounded-lg hover:bg-[var(--color-primario)]/10 transition-colors"
              >
                Enlaces
              </a>
              <a
                href="https://servicioadministrador.upea.bo/sign-in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] text-[#020617] hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </a>
            </div>
          </div>
        )}
      </div>
 
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particlePositions.map((pos, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: 'rgba(var(--color-primario-rgb, 0, 166, 81), 0.6)',
                left: pos.left,
                top: pos.top,
                animationName: 'particle-float',
                animationDuration: pos.duration,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: pos.delay,
              }}
            />
          ))}
        </div>
      )}
    </nav>
  );
}