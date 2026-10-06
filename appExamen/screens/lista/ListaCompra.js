import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import Ficha from '../../components/Ficha';
import { useMandado } from '../../context/AppContext';
import { useSensor } from '../../lib/sensores';
import { colors } from '../../theme';

const ANCHO = Dimensions.get('window').width;
const nativo = Platform.OS !== 'web';

function AvisoCarrito({ aviso, onDeshacer, onTerminar }) {
  const desplazamiento = useRef(new Animated.Value(-90)).current;
  const opacidad = useRef(new Animated.Value(0)).current;
  const terminar = useRef(onTerminar);
  terminar.current = onTerminar;

  useEffect(() => {
    if (!aviso) return undefined;
    desplazamiento.setValue(-90);
    opacidad.setValue(0);
    Animated.parallel([
      Animated.timing(desplazamiento, {
        toValue: 0,
        duration: 280,
        useNativeDriver: nativo,
      }),
      Animated.timing(opacidad, {
        toValue: 1,
        duration: 220,
        useNativeDriver: nativo,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacidad, {
        toValue: 0,
        duration: 240,
        useNativeDriver: nativo,
      }).start(({ finished }) => {
        if (finished) terminar.current();
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, [aviso, desplazamiento, opacidad]);

  if (!aviso) return null;

  return (
    <Animated.View
      style={[styles.aviso, { opacity: opacidad, transform: [{ translateY: desplazamiento }] }]}
    >
      <Text style={styles.avisoTexto}>{aviso.item.nombre} en el carrito</Text>
      <Pressable onPress={onDeshacer} hitSlop={8}>
        <Text style={styles.deshacer}>Deshacer</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function ListaCompra({ navigation, modo }) {
  const {
    nombre,
    productos,
    enCarrito,
    agregarProducto,
    marcar,
    desmarcar,
    bloquearBocaAbajo,
    agitarMarca,
  } = useMandado();
  const enfocado = useIsFocused();
  const [indice, setIndice] = useState(0);
  const [texto, setTexto] = useState('');
  const [aviso, setAviso] = useState(null);
  const [bocaAbajo, setBocaAbajo] = useState(false);
  const [altoLista, setAltoLista] = useState(320);
  const listaRef = useRef(null);
  const largoAnterior = useRef(0);
  const pausaCarrito = useRef(0);
  const pausaGiro = useRef(0);
  const giroPagina = useRef(0);
  const giroCarrito = useRef(0);
  const relojGiro = useRef(0);
  const bloqueado = useRef(false);
  bloqueado.current = bloquearBocaAbajo && bocaAbajo;

  const faltan = productos.filter((item) => !enCarrito[item.id]);
  const listos = productos.filter((item) => enCarrito[item.id]);
  const lista = modo === 'carrito' ? listos : faltan;
  const posicion = lista.length === 0 ? 0 : indice % lista.length;
  const actual = modo === 'falta' ? lista[posicion] : null;

  const meter = (item) => {
    if (!item || enCarrito[item.id]) return;
    marcar(item.id);
    setAviso({ item, clave: Date.now() });
  };

  const desplazar = (delta) => {
    if (lista.length < 2) return;
    const base = indice % lista.length;
    const siguiente = (base + delta + lista.length) % lista.length;
    setIndice(siguiente);
    listaRef.current?.scrollToIndex({ index: siguiente, animated: true });
  };

  useSensor(Accelerometer, (valor) => {
    if (modo !== 'falta' || !enfocado) return;
    const quietoEnMesa = valor.z > 0.72 && Math.hypot(valor.x, valor.y) < 0.5;
    setBocaAbajo((prev) => (prev === quietoEnMesa ? prev : quietoEnMesa));
  });

  const giroscopio = useSensor(Gyroscope, ({ x, z }) => {
    if (modo !== 'falta' || !enfocado || bloqueado.current) return;
    const ahora = Date.now();
    const dt = relojGiro.current ? Math.min((ahora - relojGiro.current) / 1000, 0.12) : 0.08;
    relojGiro.current = ahora;

    const rapido = Math.hypot(x, z) > 3.2;
    if (rapido) {
      giroPagina.current = 0;
      giroCarrito.current = 0;
      return;
    }

    const giraPagina = Math.abs(z) > Math.abs(x);
    if (giraPagina && Math.abs(z) > 0.2) {
      giroPagina.current += z * dt;
      giroCarrito.current *= 0.4;
    } else if (Math.abs(x) > 0.2) {
      giroCarrito.current += x * dt;
      giroPagina.current *= 0.4;
    } else {
      giroPagina.current *= 0.65;
      giroCarrito.current *= 0.65;
    }

    const gradosPagina = Math.abs(giroPagina.current) * (180 / Math.PI);
    const gradosCarrito = Math.abs(giroCarrito.current) * (180 / Math.PI);

    if (lista.length > 1 && gradosPagina >= 16 && ahora - pausaGiro.current > 420) {
      pausaGiro.current = ahora;
      pausaCarrito.current = ahora + 700;
      const direccion = giroPagina.current > 0 ? 1 : -1;
      giroPagina.current = 0;
      giroCarrito.current = 0;
      desplazar(direccion);
      return;
    }

    if (
      agitarMarca &&
      actual &&
      gradosCarrito >= 30 &&
      ahora >= pausaCarrito.current &&
      ahora - pausaGiro.current > 500
    ) {
      pausaCarrito.current = ahora + 900;
      giroCarrito.current = 0;
      giroPagina.current = 0;
      meter(actual);
    }
  });

  const agregar = () => {
    agregarProducto(texto);
    setTexto('');
  };

  useEffect(() => {
    if (modo !== 'falta' || lista.length === 0) return;
    if (largoAnterior.current === lista.length) return;
    largoAnterior.current = lista.length;
    const pagina = Math.min(indice, lista.length - 1);
    listaRef.current?.scrollToIndex({ index: pagina, animated: true });
  }, [indice, lista.length, modo]);

  return (
    <View style={styles.fondo}>
      {modo === 'falta' ? (
        <View style={styles.ahora}>
          <Text style={styles.quien}>
            {nombre.trim() ? `Mandado de ${nombre.trim()}` : 'Tu mandado'}
            {faltan.length ? ` · faltan ${faltan.length}` : ''}
          </Text>
          {bloqueado.current ? (
            <Text style={styles.bloqueo}>
              El teléfono está boca abajo, así que el carrito no marca productos solo. Voltéalo para seguir.
            </Text>
          ) : (
            <Text style={styles.pista}>
              {giroscopio ? 'Un giro corto de muñeca cambia de producto. ' : ''}
              {giroscopio && agitarMarca
                ? 'Inclínalo hacia adelante para meterlo al carrito.'
                : 'Toca el botón para meterlo al carrito.'}
            </Text>
          )}
        </View>
      ) : (
        <Text style={styles.encabezadoCarrito}>
          {listos.length ? `${listos.length} en el carrito` : 'El carrito está vacío'}
        </Text>
      )}

      {modo === 'falta' ? (
        lista.length ? (
          <FlatList
            ref={listaRef}
            horizontal
            pagingEnabled
            data={lista}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            style={styles.carrusel}
            onLayout={(evento) => {
              const alto = Math.round(evento.nativeEvent.layout.height);
              if (alto > 0 && alto !== altoLista) setAltoLista(alto);
            }}
            getItemLayout={(_, index) => ({ length: ANCHO, offset: ANCHO * index, index })}
            onMomentumScrollEnd={(evento) => {
              const pagina = Math.round(evento.nativeEvent.contentOffset.x / ANCHO);
              if (pagina >= 0 && pagina < lista.length) setIndice(pagina);
            }}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                listaRef.current?.scrollToIndex({ index: info.index, animated: true });
              }, 60);
            }}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.pagina, { height: altoLista }]}
                onPress={() => navigation.navigate('Detalle', { id: item.id })}
              >
                <View style={styles.tarjeta}>
                  <Text style={styles.producto}>{item.nombre}</Text>
                  <Text style={styles.cantidad}>
                    {item.cantidad}
                    {item.nota ? ` · ${item.nota}` : ''}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        ) : (
          <Text style={styles.vacioGrande}>Ya está todo en el carrito</Text>
        )
      ) : null}

      {modo === 'falta' ? (
        <View style={styles.pie}>
          <View style={styles.acciones}>
            <Pressable style={styles.secundario} onPress={() => desplazar(-1)}>
              <Text style={styles.secundarioTexto}>Anterior</Text>
            </Pressable>
            <Pressable
              style={[styles.principal, !actual && styles.apagado]}
              onPress={() => meter(actual)}
            >
              <Text style={styles.principalTexto}>Al carrito</Text>
            </Pressable>
            <Pressable style={styles.secundario} onPress={() => desplazar(1)}>
              <Text style={styles.secundarioTexto}>Siguiente</Text>
            </Pressable>
          </View>
          <View style={styles.alta}>
            <TextInput
              style={styles.input}
              placeholder="Agregar producto"
              placeholderTextColor={colors.muted}
              value={texto}
              onChangeText={setTexto}
              onSubmitEditing={agregar}
            />
            <Pressable style={styles.sumar} onPress={agregar}>
              <Text style={styles.sumarTexto}>Añadir</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {modo === 'carrito' ? (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text style={styles.vacio}>Cuando metas algo, aparece aquí.</Text>}
          renderItem={({ item }) => (
            <Ficha
              titulo={item.nombre}
              meta={[item.cantidad > 1 ? `${item.cantidad}` : '', item.nota].filter(Boolean).join(' · ')}
              onPress={() => navigation.navigate('Detalle', { id: item.id })}
            />
          )}
        />
      ) : null}

      <AvisoCarrito
        aviso={aviso}
        onDeshacer={() => {
          if (aviso) desmarcar(aviso.item.id);
          setAviso(null);
        }}
        onTerminar={() => setAviso(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.bg },
  ahora: { paddingHorizontal: 16, paddingTop: 12 },
  quien: {
    color: colors.muted,
    fontWeight: '700',
  },
  encabezadoCarrito: {
    color: colors.muted,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  pie: { paddingHorizontal: 16, paddingBottom: 12 },
  carrusel: { flex: 1 },
  pagina: {
    width: ANCHO,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tarjeta: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  producto: {
    color: colors.ink,
    fontSize: 52,
    fontWeight: '800',
    textAlign: 'center',
  },
  cantidad: {
    marginTop: 10,
    color: colors.accent,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  pista: { marginTop: 8, color: colors.muted, lineHeight: 20 },
  bloqueo: {
    marginTop: 8,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  acciones: { flexDirection: 'row', gap: 8, marginTop: 14 },
  principal: {
    flex: 1.3,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  principalTexto: { color: '#fff', fontWeight: '800' },
  secundario: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  secundarioTexto: { color: colors.ink, fontWeight: '700' },
  apagado: { opacity: 0.45 },
  alta: { flexDirection: 'row', gap: 8, marginTop: 12 },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
  },
  sumar: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  sumarTexto: { color: '#fff', fontWeight: '800' },
  lista: { padding: 16, paddingBottom: 28 },
  vacio: { color: colors.muted, textAlign: 'center', marginTop: 20 },
  vacioGrande: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    padding: 24,
  },
  aviso: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: colors.ink,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avisoTexto: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1, marginRight: 12 },
  deshacer: { color: '#BBF7D0', fontWeight: '800' },
});
