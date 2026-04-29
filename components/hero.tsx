'use client';

import { useState, useEffect } from 'react';
import { api, utils } from '@/lib/api';

export default function Hero() {
  const [institucion, setInstitucion] = useState<any>(null);
  const [portadas, setPortadas] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [displayedText, setDisplayedText] = useState('');

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
          const colors = instData.colorinstitucion[0];
          document.documentElement.style.setProperty('--color-primario', colors.color_primario);
          document.documentElement.style.setProperty('--color-secundario', colors.color_secundario);
          document.documentElement.style.setProperty('--color-terciario', colors.color_terciario);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);
 
  useEffect(() => {
    if (!institucion) return;
    
    const fullText = institucion.institucion_nombre.toUpperCase();
    let index = 0;
    
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        setTimeout(() => {
          index = 0;
          setDisplayedText('');
        }, 3000);
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [institucion]);
 
  useEffect(() => {
    if (portadas.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % portadas.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [portadas]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Cargando...</div>;
  }

  if (portadas.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-red-900 text-white text-2xl">❌ NO HAY PORTADAS</div>;
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
       
      <div className="absolute top-0 left-0 w-full h-full z-0">
        {portadas.map((portada, index) => (
          <div
            key={portada.portada_id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img 
              src={portada.portada_imagen}
              alt={portada.portada_titulo}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/60 via-slate-900/50 to-emerald-950/60" />
      </div>
 
      <div className="absolute inset-0 z-0 bg-construction-grid opacity-30 pointer-events-none" />
 
      <div className="relative z-10 container mx-auto px-4 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full py-20">
           
          <div className="space-y-6">
            <h2 
              className="text-2xl lg:text-3xl font-light tracking-widest uppercase"
              style={{ color: 'var(--color-primario)' }}
            >
              Carrera de
            </h2>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span
                className="block"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primario), var(--color-terciario) 50%, var(--color-primario))',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmer 3s linear infinite',
                }}
              >
                {displayedText || institucion?.institucion_nombre.toUpperCase()}
              </span>
            </h1>

            <div className="flex items-center gap-4 pt-4">
              <div 
                className="h-px w-20"
                style={{ backgroundColor: 'var(--color-primario)' }}
              />
              <span 
                className="text-sm font-bold tracking-widest"
                style={{ color: 'var(--color-primario)' }}
              >
                {institucion?.institucion_iniciales}
              </span>
              <div 
                className="h-px flex-1 max-w-32"
                style={{ backgroundColor: 'var(--color-primario)', opacity: 0.3 }}
              />
            </div>
          </div>
 
          <div className="flex justify-center items-center">
            <div className="relative w-72 h-72 lg:w-96 lg:h-96">
              {institucion?.institucion_logo ? (
                <img
                  src={utils.buildImageUrl(institucion.institucion_logo)}
                  alt={institucion.institucion_nombre}
                  className="w-full h-full object-contain drop-shadow-2xl floating-animation"
                  style={{
                    filter: 'drop-shadow(0 20px 60px rgba(16,185,129,0.5))',
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full rounded-3xl flex items-center justify-center text-6xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(var(--color-primario-rgb, 0,166,81), 0.2), rgba(var(--color-secundario-rgb, 30,108,68), 0.1))',
                    color: 'var(--color-primario)',
                  }}
                >
                  IC
                </div>
              )}
            </div>
           
            <div 
              className="absolute top-10 right-10 px-4 py-2 rounded-xl border backdrop-blur-md"
              style={{
                background: 'rgba(2, 6, 23, 0.8)',
                borderColor: 'rgba(var(--color-primario-rgb), 0.3)',
              }}
            >
              <p className="text-2xl font-bold text-white">43+</p>
              <p className="text-xs text-slate-400">Años</p>
            </div>
          </div>
        </div>
      </div>
 
      {portadas.length > 1 && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {portadas.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentSlide ? 'w-12' : 'w-6 bg-white/30 hover:bg-white/50'
              }`}
              style={{ backgroundColor: i === currentSlide ? 'var(--color-primario)' : undefined }}
            >
              {i === currentSlide && (
                <div 
                  className="absolute inset-y-0 left-0 h-full rounded-full bg-white/50"
                  style={{ animation: 'slideProgress 8s linear forwards' }}
                />
              )}
            </button>
          ))}
        </div>
      )}
 
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce">
        <div 
          className="w-6 h-10 border-2 rounded-full flex items-center justify-center p-2"
          style={{ borderColor: 'var(--color-primario)' }}
        >
          <div 
            className="w-1 h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-primario)' }}
          />
        </div>
      </div>
    </div>
  );
}