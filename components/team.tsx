'use client';

import { useState, useEffect } from 'react';
import { Facebook, Twitter, Phone, Loader2 } from 'lucide-react';
import { api, Autoridad, utils } from '@/lib/api';

export default function Team() {
  const [autoridades, setAutoridades] = useState<Autoridad[]>([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState({ 
    primario: '#10b981', 
    secundario: '#f59e0b', 
    terciario: '#06b6d4' 
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        
        const instData = await api.institution.getCurrentPrincipal();
        if (instData.colorinstitucion?.[0]) {
          const c = instData.colorinstitucion[0];
          setColors({
            primario: c.color_primario,
            secundario: c.color_secundario,
            terciario: c.color_terciario
          });
          document.documentElement.style.setProperty('--color-primario', c.color_primario);
          document.documentElement.style.setProperty('--color-secundario', c.color_secundario);
          document.documentElement.style.setProperty('--color-terciario', c.color_terciario);
        }
 
        const contentData = await api.content.getAll();
        setAutoridades(contentData.autoridad || []);
      } catch (error) {
        console.error('Error cargando autoridades:', error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 text-xl font-semibold animate-pulse" style={{ color: colors.primario }}>
          <Loader2 className="w-6 h-6 animate-spin" /> Cargando autoridades...
        </div>
      </section>
    );
  }

  if (autoridades.length === 0) return null;

  return (
    <section id="team" className="py-24 px-4 relative overflow-hidden bg-slate-950/90">
      
       
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/3 -left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ backgroundColor: colors.primario }} />
        <div className="absolute bottom-1/3 -right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ backgroundColor: colors.terciario }} />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
         
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-6xl font-bold"
            style={{
              background: `linear-gradient(135deg, ${colors.primario}, ${colors.terciario})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
            Nuestras Autoridades
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Conoce al equipo directivo que lidera la carrera de Ingeniería Civil hacia la excelencia académica y profesional.
          </p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {autoridades.map((aut, idx) => (
            <AuthorityCard key={aut.id_autoridad} autoridad={aut} colors={colors} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
 

function AuthorityCard({ autoridad, colors, index }: { autoridad: Autoridad; colors: any; index: number }) {
  const [imgError, setImgError] = useState(false);
   
  const initials = autoridad.nombre_autoridad 
    ? autoridad.nombre_autoridad.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AU';
 
  const imageUrl = !imgError && autoridad.foto_autoridad 
    ? utils.buildImageUrl(autoridad.foto_autoridad)
    : null;

  return (
    <div 
      className="group relative tech-card p-6 text-center hover:-translate-y-2 transition-all duration-500 fade-in-up"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-500 -z-10" 
           style={{ background: `radial-gradient(circle at center, ${colors.primario}, transparent)` }} />
 
      <div className="relative mx-auto w-36 h-36 mb-6">
       
        <div className="absolute inset-0 rounded-full border-2 border-dashed opacity-40 animate-spin-slow" 
             style={{ borderColor: colors.primario }} />
         
        <div className="absolute inset-2 rounded-full overflow-hidden border-2 bg-slate-900" 
             style={{ borderColor: colors.primario }}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={autoridad.nombre_autoridad || 'Autoridad'} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <span className="text-4xl font-bold" style={{ color: colors.primario }}>{initials}</span>
            </div>
          )}
        </div>
         
        <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-[3px] border-slate-950 rounded-full z-10" />
      </div>
 
      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
        {autoridad.nombre_autoridad || 'Nombre no disponible'}
      </h3>
      <p className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: colors.secundario }}>
        {autoridad.cargo_autoridad}
      </p>
 
      <div className="flex justify-center gap-3 pt-5 border-t border-slate-800/50">
        {autoridad.facebook_autoridad && (
          <SocialBtn icon={Facebook} url={autoridad.facebook_autoridad} color={colors.primario} />
        )}
        {autoridad.twiter_autoridad && (
          <SocialBtn icon={Twitter} url={autoridad.twiter_autoridad} color={colors.terciario} />
        )}
        {autoridad.celular_autoridad && (
          <SocialBtn icon={Phone} url={`tel:${autoridad.celular_autoridad}`} color={colors.secundario} />
        )}
      </div>
    </div>
  );
}
 

function SocialBtn({ icon: Icon, url, color }: { icon: any; url: string; color: string }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-2.5 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-110"
      style={{ color }}
      aria-label="Red social"
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}