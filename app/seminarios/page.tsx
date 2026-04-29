'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import SeminariosContent from '@/components/seminarios-content';

export default function SeminariosPage() {
  const [portada, setPortada] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState({ 
    primario: '#10b981', 
    secundario: '#f59e0b', 
    terciario: '#06b6d4' 
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        const [instData, contentData] = await Promise.all([
          api.institution.getCurrentPrincipal(),
          api.content.getAll()
        ]);
        
        if (contentData.portada && contentData.portada.length > 0) {
          setPortada(contentData.portada[0].portada_imagen);
        }
        
        if (instData.colorinstitucion?.[0]) {
          const c = instData.colorinstitucion[0];
          setColors({
            primario: c.color_primario,
            secundario: c.color_secundario,
            terciario: c.color_terciario
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 -z-20">
          {portada ? (
            <>
              <img src={portada} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/75" />
            </>
          ) : (
            <div className="absolute inset-0 bg-slate-900" />
          )}
        </div>

        <div className="absolute inset-0 -z-10 bg-construction-grid opacity-20 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
            Seminarios
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Actualización y perfeccionamiento profesional
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <a href="/" className="hover:text-white transition-colors">Inicio</a>
            <span className="text-slate-600">/</span>
            <span style={{ color: colors.primario }}>Seminarios</span>
          </div>
        </div>
      </section>

      <SeminariosContent colors={colors} />
      <Footer />
    </div>
  );
}