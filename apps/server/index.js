import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/api', (req, res) => {
    res.json({ message: '¡Hola desde el servidor Express!' });
});

app.listen(port, () => {
    console.log(`Servidor Express escuchando en http://localhost:${port}`);
});

