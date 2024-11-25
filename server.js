const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;


app.use(express.json());

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.woff2')) {
            res.setHeader('Content-Type', 'font/woff2');
        } else if (filePath.endsWith('.woff')) {
            res.setHeader('Content-Type', 'font/woff');
        } else if (filePath.endsWith('.otf')) {
            res.setHeader('Content-Type', 'font/otf');
        }
    }
}));

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

app.post('/api/project', (req, res) => {
    const { id } = req.body; // Obtiene el id del cuerpo de la solicitud

    if (!id) {
        return res.status(400).json({ error: 'El parámetro "id" es requerido.' });
    }

    const filePath = path.join(__dirname, 'data', `${id}.json`); // Construye la ruta del archivo usando el id

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
