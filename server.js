const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

const cors = require('cors');
app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (filePath.endsWith('.woff2')) {
            res.setHeader('Content-Type', 'font/woff2');
        } else if (filePath.endsWith('.woff')) {
            res.setHeader('Content-Type', 'font/woff');
        } else if (filePath.endsWith('.otf')) {
            res.setHeader('Content-Type', 'font/otf');
        }

        if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // cache imágenes, fonts, etc
        }
    }
}));


app.get('/download/pdf', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'pdf', 'Eden Zornitser_CV.pdf');
    res.download(filePath, 'Eden Zornitser_CV.pdf', (err) => {
        if (err) {
            console.error('Error al descargar el archivo:', err);
            res.status(500).send('Error al descargar el archivo');
        }
    });
});

app.get('/api/work', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'work.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el archivo JSON' });
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/api/home', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'homepage.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el archivo JSON' });
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/api/project', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'El parámetro "id" es requerido.' });
    }

    const filePath = path.join(__dirname, 'data', `${id}.json`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.status(404).json({ error: `El archivo ${id}.json no fue encontrado.` });
            } else {
                res.status(500).json({ error: 'Error al leer el archivo JSON.' });
            }
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        }
    });
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
