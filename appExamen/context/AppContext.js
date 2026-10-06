import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

const INICIALES = [
  { id: 'leche', nombre: 'Leche', cantidad: 1, nota: 'La de caja' },
  { id: 'pan', nombre: 'Pan', cantidad: 1, nota: '' },
  { id: 'huevos', nombre: 'Huevos', cantidad: 12, nota: 'Una docena' },
  { id: 'fruta', nombre: 'Fruta', cantidad: 1, nota: '' },
  { id: 'agua', nombre: 'Agua', cantidad: 2, nota: 'Garrafones' },
  { id: 'jabon', nombre: 'Jabón', cantidad: 1, nota: '' },
];

export function AppProvider({ children }) {
  const [nombre, setNombre] = useState('');
  const [productos, setProductos] = useState(INICIALES);
  const [enCarrito, setEnCarrito] = useState({});
  const [coche, setCoche] = useState(null);
  const [bloquearBocaAbajo, setBloquearBocaAbajo] = useState(true);
  const [agitarMarca, setAgitarMarca] = useState(true);

  const agregarProducto = useCallback((nombreProducto) => {
    const limpio = nombreProducto.trim();
    if (!limpio) return;
    setProductos((prev) => [
      ...prev,
      { id: `${Date.now()}`, nombre: limpio, cantidad: 1, nota: '' },
    ]);
  }, []);

  const marcar = useCallback((id) => {
    setEnCarrito((prev) => ({ ...prev, [id]: true }));
  }, []);

  const desmarcar = useCallback((id) => {
    setEnCarrito((prev) => ({ ...prev, [id]: false }));
  }, []);

  const editarNota = useCallback((id, nota) => {
    setProductos((prev) => prev.map((item) => (item.id === id ? { ...item, nota } : item)));
  }, []);

  const cambiarCantidad = useCallback((id, delta) => {
    setProductos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item,
      ),
    );
  }, []);

  const quitar = useCallback((id) => {
    setProductos((prev) => prev.filter((item) => item.id !== id));
    setEnCarrito((prev) => ({ ...prev, [id]: false }));
  }, []);

  const reiniciar = useCallback(() => {
    setEnCarrito({});
  }, []);

  const guardarCoche = useCallback((rumbo) => {
    setCoche(rumbo);
  }, []);

  const value = useMemo(
    () => ({
      nombre,
      setNombre,
      productos,
      enCarrito,
      agregarProducto,
      marcar,
      desmarcar,
      editarNota,
      cambiarCantidad,
      quitar,
      reiniciar,
      coche,
      guardarCoche,
      bloquearBocaAbajo,
      setBloquearBocaAbajo,
      agitarMarca,
      setAgitarMarca,
    }),
    [
      nombre,
      productos,
      enCarrito,
      agregarProducto,
      marcar,
      desmarcar,
      editarNota,
      cambiarCantidad,
      quitar,
      reiniciar,
      coche,
      guardarCoche,
      bloquearBocaAbajo,
      agitarMarca,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useMandado() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useMandado debe usarse dentro de AppProvider');
  }
  return ctx;
}
