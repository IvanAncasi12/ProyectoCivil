'use client';

import { useState, useEffect } from 'react';
import { api, utils } from '@/lib/api';

type Colors = {
  primario: string;
  secundario: string;
  terciario: string;
};

export default function Hero() {
  const [institucion, setInstitucion] = useState<any>(null);
  const [portadas, setPortadas] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [displayedText, setDisplayedText] = useState('');

  const [colors, setColors] = useState<Colors>({
    primario: '#10b981',
    secundario: '#f59e0b',
    terciario: '#06b6d4',
  });

  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');

    if (clean.length !== 6) return '16, 185, 129';

    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  };

  const buildPortadaUrl = (imagen?: string | null) => {
    if (!imagen) return '';

    const imagenLimpia = String(imagen).trim();

    if (!imagenLimpia) return '';

    if (
      imagenLimpia.startsWith('http://') ||
      imagenLimpia.startsWith('https://')
    ) {
      return imagenLimpia;
    }

    return utils.buildImageUrl(imagenLimpia);
  };

  const removeBrokenPortada = (id: number | string) => {
    setPortadas((prev) => {
      const nuevas = prev.filter((item, index) => {
        const itemId = item?.portada_id || index;
        return itemId !== id;
      });

      if (currentSlide >= nuevas.length) {
        setCurrentSlide(0);
      }

      return nuevas;
    });
  };

  const recortarTexto = (texto: string, limite = 240) => {
    if (!texto) return '';

    const limpio = texto.replace(/\s+/g, ' ').trim();

    if (limpio.length <= limite) return limpio;

    return `${limpio.slice(0, limite).trim()}...`;
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const [instData, contentData] = await Promise.all([
          api.institution.getCurrentPrincipal(),
          api.content.getAll(),
        ]);

        setInstitucion(instData);
        setPortadas(contentData.portada || []);

        if (instData.colorinstitucion?.[0]) {
          const c = instData.colorinstitucion[0];

          const colores = {
            primario: c.color_primario || '#10b981',
            secundario: c.color_secundario || '#f59e0b',
            terciario: c.color_terciario || '#06b6d4',
          };

          setColors(colores);

          document.documentElement.style.setProperty(
            '--color-primario',
            colores.primario
          );
          document.documentElement.style.setProperty(
            '--color-secundario',
            colores.secundario
          );
          document.documentElement.style.setProperty(
            '--color-terciario',
            colores.terciario
          );

          document.documentElement.style.setProperty(
            '--color-primario-rgb',
            hexToRgb(colores.primario)
          );
          document.documentElement.style.setProperty(
            '--color-secundario-rgb',
            hexToRgb(colores.secundario)
          );
          document.documentElement.style.setProperty(
            '--color-terciario-rgb',
            hexToRgb(colores.terciario)
          );
        }
      } catch (error) {
        console.error('Error cargando hero:', error);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  useEffect(() => {
    if (!institucion?.institucion_nombre) return;

    const fullText = institucion.institucion_nombre.toUpperCase();
    let index = 0;
    let resetTimeout: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);

        resetTimeout = setTimeout(() => {
          setDisplayedText(fullText);
        }, 2500);
      }
    }, 80);

    return () => {
      clearInterval(interval);
      clearTimeout(resetTimeout);
    };
  }, [institucion]);

  useEffect(() => {
    if (portadas.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portadas.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [portadas.length]);

  if (loading) {
    return (
      <section className="relative min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute left-1/2 top-[-8rem] h-[130%] w-[48rem] origin-top -translate-x-[88%] -rotate-[30deg] rounded-full blur-[80px] opacity-60"
            style={{
              background: `linear-gradient(180deg, ${colors.primario}99 0%, ${colors.secundario}55 42%, transparent 80%)`,
            }}
          />
          <div
            className="absolute left-1/2 top-[-8rem] h-[130%] w-[48rem] origin-top -translate-x-[12%] rotate-[30deg] rounded-full blur-[80px] opacity-60"
            style={{
              background: `linear-gradient(180deg, ${colors.terciario}99 0%, ${colors.primario}55 42%, transparent 80%)`,
            }}
          />
          <div className="absolute inset-0 bg-slate-950/60" />
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <div className="relative z-10 flex items-center gap-4 px-7 py-5 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center border"
            style={{
              color: colors.primario,
              borderColor: `${colors.primario}55`,
              backgroundColor: `${colors.primario}12`,
              boxShadow: `0 18px 40px ${colors.primario}25`,
            }}
          >
            <span className="w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin" />
          </div>

          <div>
            <p className="text-white text-lg font-black">Cargando inicio</p>
            <p className="text-slate-400 text-sm">
              Preparando información institucional...
            </p>
          </div>
        </div>
      </section>
    );
  }

  const nombreInstitucion =
    institucion?.institucion_nombre || 'Ingeniería Civil';

  const iniciales =
    institucion?.institucion_iniciales ||
    institucion?.institucion_nombre_iniciales ||
    'INGCIVIL';

  const descripcionCompleta =
    api.utils.stripHtml(institucion?.institucion_objetivos || '') ||
    api.utils.stripHtml(institucion?.institucion_sobre_ins || '') ||
    '';

  const descripcion = recortarTexto(
    descripcionCompleta ||
      'Formando profesionales comprometidos con el desarrollo, la innovación y la construcción de un mejor futuro.',
    240
  );

  const logoUrl = institucion?.institucion_logo
    ? utils.buildImageUrl(institucion.institucion_logo)
    : '';

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-slate-950">
      
      <div className="absolute inset-0 z-0">
        {portadas.length > 0 ? (
          <>
            {portadas.map((portada, index) => {
              const imagen = buildPortadaUrl(portada.portada_imagen);
              const id = portada.portada_id || index;

              return (
                <div
                  key={id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={imagen}
                    alt={portada.portada_titulo || nombreInstitucion}
                    className="w-full h-full object-cover scale-[1.06] brightness-[0.82] contrast-[1.1] saturate-[1.1]"
                    onError={() => removeBrokenPortada(id)}
                  />
                </div>
              );
            })}
 
            <div className="absolute inset-0 z-20 bg-slate-950/40" />
 
            <div
              className="absolute inset-0 z-20"
              style={{
                background: `
                  radial-gradient(circle at 20% 25%, rgba(var(--color-primario-rgb), 0.30), transparent 32%),
                  radial-gradient(circle at 82% 30%, rgba(var(--color-terciario-rgb), 0.24), transparent 30%),
                  linear-gradient(115deg, rgba(2,6,23,0.72), rgba(15,23,42,0.35) 42%, rgba(2,6,23,0.62))
                `,
              }}
            />

            <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/20" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 18% 25%, ${colors.primario}55, transparent 34%),
                radial-gradient(circle at 82% 30%, ${colors.terciario}55, transparent 32%),
                linear-gradient(135deg, #020617, #0f172a 55%, #020617)
              `,
            }}
          />
        )}
      </div>
 
      <div className="absolute inset-0 z-20 opacity-[0.14] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.20)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.20)_1px,transparent_1px)] bg-[size:72px_72px]" />
 
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.08] bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.6)_100%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.6)_100%)] bg-[size:24px_24px]" />
 
      <div className="absolute right-0 top-0 z-20 h-full w-[22%] pointer-events-none hidden lg:block opacity-20">
        <div
          className="absolute inset-y-[18%] right-[10%] w-[65%]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 18px,
              rgba(255,255,255,0.32) 19px,
              rgba(255,255,255,0.32) 21px
            )`,
          }}
        />
      </div>
 
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div
          className="absolute -left-24 top-24 h-80 w-80 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: colors.primario }}
        />
        <div
          className="absolute -right-24 bottom-24 h-96 w-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: colors.secundario }}
        />
      </div>
 
      <div className="relative z-30 container mx-auto px-4 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center w-full pt-36 pb-24">
           
          <div className="space-y-7 text-center lg:text-left lg:pl-10 xl:pl-16">
            <div
              className="inline-flex items-center gap-3 rounded-full border px-5 py-2 bg-white/10 backdrop-blur-xl shadow-lg"
              style={{
                borderColor: `${colors.primario}45`,
                boxShadow: `0 18px 40px ${colors.primario}18`,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: colors.primario }}
              />
              <span className="text-xs sm:text-sm font-black tracking-[0.25em] uppercase text-white">
                Carrera de
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight">
              <span
                className="block min-h-[1.1em]"
                style={{
                  background: `linear-gradient(135deg, #ffffff 5%, ${colors.primario} 35%, ${colors.terciario} 70%, ${colors.secundario} 100%)`,
                  backgroundSize: '220% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmer 3s linear infinite',
                  filter: 'drop-shadow(0 18px 38px rgba(0,0,0,0.55))',
                }}
              >
                {displayedText || nombreInstitucion.toUpperCase()}
              </span>
            </h1>

            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg lg:text-xl text-slate-100 leading-relaxed line-clamp-4 drop-shadow-lg">
              {descripcion}
            </p>
 
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              {['Estructuras', 'Vías', 'Hidráulica', 'Construcción'].map(
                (item, index) => (
                  <span
                    key={item}
                    className="px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-md"
                    style={{
                      color: index % 2 === 0 ? '#fff' : colors.primario,
                      borderColor:
                        index % 2 === 0
                          ? 'rgba(255,255,255,0.12)'
                          : `${colors.primario}55`,
                      background:
                        index % 2 === 0
                          ? 'rgba(255,255,255,0.08)'
                          : `${colors.primario}18`,
                    }}
                  >
                    {item}
                  </span>
                )
              )}
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <div
                className="h-px w-16 sm:w-24"
                style={{ backgroundColor: colors.primario }}
              />
              <span
                className="text-sm sm:text-base font-black tracking-[0.28em]"
                style={{ color: colors.primario }}
              >
                {iniciales}
              </span>
              <div
                className="h-px flex-1 max-w-36"
                style={{
                  backgroundColor: colors.primario,
                  opacity: 0.35,
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="/nosotros"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl font-black transition-all hover:scale-[1.03] shadow-xl text-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primario}, ${colors.terciario})`,
                  color: '#020617',
                  boxShadow: `0 18px 45px ${colors.primario}35`,
                }}
              >
                Conoce la carrera
              </a>

              <a
                href="/contacto"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl font-black border border-white/15 bg-white/10 text-white backdrop-blur-xl hover:bg-white/15 transition-all text-center"
              >
                Contáctanos
              </a>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-[27rem] lg:h-[27rem]">
              <div
                className="absolute inset-0 rounded-[2.8rem] blur-3xl opacity-35"
                style={{
                  background: `linear-gradient(135deg, ${colors.primario}, ${colors.terciario})`,
                }}
              />

              <div className="absolute inset-0 rounded-[2.8rem] border border-white/10 bg-white/10 backdrop-blur-md rotate-6" />

              <div className="relative w-full h-full rounded-[2.8rem] border border-white/15 bg-slate-950/35 backdrop-blur-xl flex items-center justify-center p-10 shadow-2xl overflow-hidden">
             
                <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)] bg-[size:34px_34px]" />

                <div
                  className="absolute inset-0 opacity-[0.18]"
                  style={{
                    background: `radial-gradient(circle at center, transparent 48%, ${colors.primario}22 70%, transparent 72%)`,
                  }}
                />

                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={nombreInstitucion}
                    className="relative z-10 w-full h-full object-contain floating-animation"
                    style={{
                      filter: `drop-shadow(0 24px 65px ${colors.primario}65)`,
                    }}
                  />
                ) : (
                  <div
                    className="relative z-10 w-full h-full rounded-3xl flex items-center justify-center text-6xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primario}22, ${colors.terciario}16)`,
                      color: colors.primario,
                    }}
                  >
                    {iniciales}
                  </div>
                )}
              </div>

              <div
                className="absolute -bottom-5 -left-5 px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl"
                style={{
                  background: 'rgba(2, 6, 23, 0.78)',
                  borderColor: `${colors.terciario}45`,
                }}
              >
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-slate-400">Formación</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {portadas.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 flex gap-3">
          {portadas.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Ver portada ${i + 1}`}
              className={`relative h-2 rounded-full overflow-hidden transition-all ${
                i === currentSlide
                  ? 'w-14 bg-white/25'
                  : 'w-7 bg-white/25 hover:bg-white/45'
              }`}
            >
              {i === currentSlide && (
                <span
                  key={currentSlide}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: '100%',
                    backgroundColor: colors.primario,
                    animation: 'slideProgress 8s linear forwards',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-40 animate-bounce">
        <div
          className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-1.5"
          style={{ borderColor: colors.primario }}
        >
          <div
            className="w-1 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: colors.primario }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 220% center;
          }
        }

        @keyframes slideProgress {
          from {
            transform: scaleX(0);
            transform-origin: left;
          }
          to {
            transform: scaleX(1);
            transform-origin: left;
          }
        }

        .floating-animation {
          animation: floating 4s ease-in-out infinite;
        }

        @keyframes floating {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-14px);
          }
        }
      `}</style>
    </section>
  );
}