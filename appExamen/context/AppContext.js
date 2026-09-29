import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

const NOTAS_INICIALES = [
  {
    id: 'super',
    titulo: 'Súper',
    cuerpo: 'Leche, pan y fruta.',
    cuando: 'Hoy',
  },
  {
    id: 'idea',
    titulo: 'Idea',
    cuerpo: 'Salir a caminar el sábado por la mañana.',
    cuando: 'Ayer',
  },
];

const TAREAS_INICIALES = [
  { id: 'estudiar', titulo: 'Estudiar', detalle: 'Repasar los apuntes de hoy.' },
  { id: 'llamar', titulo: 'Llamar a casa', detalle: 'Preguntar a qué hora es la cena.' },
  { id: 'agua', titulo: 'Comprar agua', detalle: 'Pasar por la tienda de la esquina.' },
];

export function AppProvider({ children }) {
  const [nombre, setNombre] = useState('');
  const [notas, setNotas] = useState(NOTAS_INICIALES);
  const [tareas] = useState(TAREAS_INICIALES);
  const [hechas, setHechas] = useState({});
  const [mostrarGrados, setMostrarGrados] = useState(true);
  const [avisoNivel, setAvisoNivel] = useState(true);

  const agregarNota = useCallback((nota) => {
    setNotas((prev) => [{ id: `${Date.now()}`, cuando: 'Ahora', ...nota }, ...prev]);
  }, []);

  const marcarHecha = useCallback((id) => {
    setHechas((prev) => ({ ...prev, [id]: true }));
  }, []);

  const value = useMemo(
    () => ({
      nombre,
      setNombre,
      notas,
      agregarNota,
      tareas,
      hechas,
      marcarHecha,
      mostrarGrados,
      setMostrarGrados,
      avisoNivel,
      setAvisoNivel,
    }),
    [nombre, notas, agregarNota, tareas, hechas, marcarHecha, mostrarGrados, avisoNivel],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useNotas() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useNotas debe usarse dentro de AppProvider');
  }
  return ctx;
}
