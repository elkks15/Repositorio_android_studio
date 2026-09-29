import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';


const API = `http://${Platform.OS === 'android' ? '10.0.2.2' : 'localhost'}:4000`;
const altoHoja = Math.round(Math.min(Dimensions.get('window').height * 0.88, 840));

function unir(lista) {
  if (!Array.isArray(lista) || lista.length === 0) return '';
  return lista.join(', ');
}

function formatearFecha(valor) {
  if (!valor) return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function textoMeta(pelicula) {
  const tipo =
    pelicula.type === 'movie' ? 'Película' : pelicula.type === 'series' ? 'Serie' : pelicula.type;
  return [pelicula.year, pelicula.rated, pelicula.runtime ? `${pelicula.runtime} min` : '', tipo]
    .filter(Boolean)
    .join(' · ');
}

function textoPremios(awards) {
  if (!awards) return '';
  if (awards.text) return awards.text;
  return [
    awards.wins ? `${awards.wins} premios` : '',
    awards.nominations ? `${awards.nominations} nominaciones` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

function textoImdb(imdb) {
  if (!imdb || (imdb.rating == null && imdb.votes == null)) return '';
  return [
    imdb.rating != null ? `${imdb.rating}/10` : '',
    imdb.votes != null ? `${Number(imdb.votes).toLocaleString('es-MX')} votos` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

function textoTomates(tomatoes) {
  if (!tomatoes) return '';
  const lineas = [];

  if (tomatoes.criticRating != null || tomatoes.criticMeter != null) {
    lineas.push(
      [
        'Críticos:',
        tomatoes.criticRating != null ? `${tomatoes.criticRating}/10` : '',
        tomatoes.criticMeter != null ? `${tomatoes.criticMeter}%` : '',
        tomatoes.criticReviews != null
          ? `${Number(tomatoes.criticReviews).toLocaleString('es-MX')} reseñas`
          : '',
      ]
        .filter(Boolean)
        .join(' ')
    );
  }

  if (tomatoes.viewerRating != null || tomatoes.viewerMeter != null) {
    lineas.push(
      [
        'Audiencia:',
        tomatoes.viewerRating != null ? `${tomatoes.viewerRating}/5` : '',
        tomatoes.viewerMeter != null ? `${tomatoes.viewerMeter}%` : '',
        tomatoes.viewerReviews != null
          ? `${Number(tomatoes.viewerReviews).toLocaleString('es-MX')} reseñas`
          : '',
      ]
        .filter(Boolean)
        .join(' ')
    );
  }

  return lineas.join('\n');
}

function Seccion({ titulo, texto }) {
  if (!texto) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      <Text style={styles.sectionText}>{texto}</Text>
    </View>
  );
}

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contrasena, setContrasena] = useState('');
  const [logueado, setLogueado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [seleccionId, setSeleccionId] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState(null);

  useEffect(() => {
    if (!logueado) return;

    fetch(`${API}/movies`)
      .then((response) => response.json())
      .then((data) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError(err);
        setLoading(false);
      });
  }, [logueado]);

  async function entrar() {
    if (!contrasena) {
      setMensaje('Escribe la contraseña');
      return;
    }

    setMensaje('');
    setEnviando(true);

    try {
      const response = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: contrasena }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMensaje(data.mensaje || 'Contraseña incorrecta');
        return;
      }

      setLoading(true);
      setLogueado(true);
    } catch (err) {
      console.log(err);
      setMensaje('No se pudo conectar con el servidor');
    } finally {
      setEnviando(false);
    }
  }

  async function abrirPelicula(id) {
    setSeleccionId(id);
    setDetalle(null);
    setErrorDetalle(null);
    setCargandoDetalle(true);

    try {
      const response = await fetch(`${API}/movies/${id}`);
      const data = await response.json();
      if (!response.ok) {
        setErrorDetalle(data.error || 'No se pudo cargar la película');
        return;
      }
      setDetalle(data);
    } catch (err) {
      console.log(err);
      setErrorDetalle('No se pudo conectar con el servidor');
    } finally {
      setCargandoDetalle(false);
    }
  }

  function cerrarDetalle() {
    setSeleccionId(null);
    setDetalle(null);
    setErrorDetalle(null);
    setCargandoDetalle(false);
  }

  if (!logueado) {
    return (
      <View style={styles.loginScreen}>
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Iniciar sesión</Text>
          <Text style={styles.loginHint}>Usa la contraseña de la conexión a MongoDB.</Text>
          <TextInput
            value={contrasena}
            onChangeText={setContrasena}
            placeholder="Contraseña"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          {mensaje ? <Text style={styles.loginError}>{mensaje}</Text> : null}
          <Pressable
            style={[styles.primaryButton, enviando && styles.primaryButtonDisabled]}
            onPress={entrar}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Entrar</Text>
            )}
          </Pressable>
        </View>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1e88e5" />
        <Text style={styles.loaderText}>Cargando películas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>{String(error)}</Text>
      </View>
    );
  }

  const sinopsis = detalle?.fullplot || detalle?.plot || '';
  const resumen =
    detalle?.plot && detalle?.fullplot && detalle.plot !== detalle.fullplot ? detalle.plot : '';

  const renderItem = ({ item }) => (
    <Pressable style={styles.card} onPress={() => abrirPelicula(item._id)}>
      {item.poster ? (
        <Image source={{ uri: item.poster }} style={styles.poster} />
      ) : (
        <View style={styles.noposter}>
          <Text style={styles.noposterText}>Sin póster</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.plot} numberOfLines={4}>
          {item.fullplot || 'Sin descripción'}
        </Text>
        <Text style={styles.cardHint}>Ver ficha completa</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Películas ({movies.length})</Text>
      <FlatList
        data={movies}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <Modal
        visible={seleccionId !== null}
        transparent
        animationType="fade"
        onRequestClose={cerrarDetalle}
      >
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropTouch} onPress={cerrarDetalle} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Ficha de la película</Text>
              <Pressable onPress={cerrarDetalle} style={styles.closeButton}>
                <Text style={styles.closeText}>Cerrar</Text>
              </Pressable>
            </View>
            {cargandoDetalle ? (
              <View style={styles.detailLoader}>
                <ActivityIndicator size="large" color="#1e88e5" />
                <Text style={styles.loaderText}>Cargando ficha...</Text>
              </View>
            ) : errorDetalle ? (
              <Text style={styles.detailError}>{errorDetalle}</Text>
            ) : detalle ? (
              <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailBody}>
                {detalle.poster ? (
                  <Image source={{ uri: detalle.poster }} style={styles.detailPoster} />
                ) : null}
                <Text style={styles.detailTitle}>{detalle.title}</Text>
                {textoMeta(detalle) ? <Text style={styles.detailMeta}>{textoMeta(detalle)}</Text> : null}
                <Seccion titulo="Sinopsis" texto={sinopsis} />
                <Seccion titulo="Resumen" texto={resumen} />
                <Seccion titulo="Géneros" texto={unir(detalle.genres)} />
                <Seccion titulo="Dirección" texto={unir(detalle.directors)} />
                <Seccion titulo="Guion" texto={unir(detalle.writers)} />
                <Seccion titulo="Reparto" texto={unir(detalle.cast)} />
                <Seccion titulo="Idiomas" texto={unir(detalle.languages)} />
                <Seccion titulo="Países" texto={unir(detalle.countries)} />
                <Seccion titulo="Estreno" texto={formatearFecha(detalle.released)} />
                <Seccion titulo="Premios" texto={textoPremios(detalle.awards)} />
                <Seccion titulo="IMDb" texto={textoImdb(detalle.imdb)} />
                <Seccion titulo="Rotten Tomatoes" texto={textoTomates(detalle.tomatoes)} />
                <Seccion
                  titulo="Comentarios"
                  texto={
                    detalle.comments != null
                      ? `${Number(detalle.comments).toLocaleString('es-MX')} en la base de datos`
                      : ''
                  }
                />
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    paddingTop: 48,
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loader: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    color: '#555',
    fontSize: 15,
  },
  errorText: {
    color: '#c62828',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  loginScreen: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loginCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
  },
  loginHint: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#d5dbe3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  loginError: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#1e88e5',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    cursor: 'pointer',
  },
  poster: {
    width: 90,
    height: 130,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  noposter: {
    width: 90,
    height: 130,
    borderRadius: 10,
    backgroundColor: '#dfe3ea',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  noposterText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },
  plot: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4b5563',
  },
  cardHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#1e88e5',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    height: altoHoja,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    zIndex: 1,
  },
  detailScroll: {
    flex: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeText: {
    color: '#1e88e5',
    fontWeight: '800',
    fontSize: 14,
  },
  detailLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 12,
  },
  detailError: {
    color: '#c62828',
    fontSize: 15,
    textAlign: 'center',
    padding: 24,
  },
  detailBody: {
    padding: 16,
    paddingBottom: 28,
  },
  detailPoster: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    backgroundColor: '#111',
    marginBottom: 14,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },
  detailMeta: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e88e5',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1f2937',
  },
});
