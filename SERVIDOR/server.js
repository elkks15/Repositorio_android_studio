const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const uri =
  'mongodb://202360512_db_user:queso2447@ac-pl96d6r-shard-00-00.kei1rdz.mongodb.net:27017,ac-pl96d6r-shard-00-01.kei1rdz.mongodb.net:27017,ac-pl96d6r-shard-00-02.kei1rdz.mongodb.net:27017/?ssl=true&replicaSet=atlas-usv9tu-shard-0&authSource=admin&appName=Cluster0';

const client = new MongoClient(uri);
const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

let db;

function credencialesMongo(connectionUri) {
  const sinProtocolo = connectionUri.slice(connectionUri.indexOf('://') + 3);
  const userInfo = sinProtocolo.split('@')[0];
  const separador = userInfo.indexOf(':');
  return {
    usuario: decodeURIComponent(userInfo.slice(0, separador)),
    password: decodeURIComponent(userInfo.slice(separador + 1)),
  };
}

function peliculaExtensa(movie) {
  return {
    id: String(movie._id),
    title: movie.title ?? '',
    year: movie.year ?? null,
    runtime: movie.runtime ?? null,
    rated: movie.rated ?? '',
    released: movie.released ?? null,
    type: movie.type ?? '',
    genres: movie.genres ?? [],
    directors: movie.directors ?? [],
    writers: movie.writers ?? [],
    cast: movie.cast ?? [],
    languages: movie.languages ?? [],
    countries: movie.countries ?? [],
    plot: movie.plot ?? '',
    fullplot: movie.fullplot ?? '',
    poster: movie.poster ?? '',
    awards: movie.awards
      ? {
          wins: movie.awards.wins ?? 0,
          nominations: movie.awards.nominations ?? 0,
          text: movie.awards.text ?? '',
        }
      : null,
    imdb: movie.imdb
      ? {
          rating: movie.imdb.rating ?? null,
          votes: movie.imdb.votes ?? null,
        }
      : null,
    tomatoes: movie.tomatoes
      ? {
          criticRating: movie.tomatoes.critic?.rating ?? null,
          criticMeter: movie.tomatoes.critic?.meter ?? null,
          criticReviews: movie.tomatoes.critic?.numReviews ?? null,
          viewerRating: movie.tomatoes.viewer?.rating ?? null,
          viewerMeter: movie.tomatoes.viewer?.meter ?? null,
          viewerReviews: movie.tomatoes.viewer?.numReviews ?? null,
        }
      : null,
    comments: movie.num_mflix_comments ?? null,
  };
}

async function conectarMongoDB() {
  await client.connect();
  db = client.db('sample_mflix');
  console.log('Conectado a MongoDB');
}

app.post('/login', (req, res) => {
  const password = String(req.body?.password ?? '');
  const reales = credencialesMongo(uri);

  if (password === reales.password) {
    res.json({ ok: true });
    return;
  }

  res.status(401).json({ ok: false, mensaje: 'Contraseña incorrecta' });
});

app.get('/movies', async (req, res) => {
  try {
    const movies = await db
      .collection('movies')
      .find({})
      .project({ poster: 1, title: 1, fullplot: 1 })
      .limit(50)
      .toArray();
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las películas' });
  }
});

app.get('/movies/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).json({ error: 'Identificador inválido' });
      return;
    }

    const movie = await db.collection('movies').findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!movie) {
      res.status(404).json({ error: 'Película no encontrada' });
      return;
    }

    res.json(peliculaExtensa(movie));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la película' });
  }
});

conectarMongoDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor en el puerto http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  });
