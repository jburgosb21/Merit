require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión con Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Ruta de prueba para ver que tu imperio está en línea
app.get('/status', (req, res) => {
    res.json({ status: "Sistema MERIT Operativo", fase: "Beta MVP" });
});

// Ejemplo de ruta para asignar puntos (backend logic)
app.post('/assign-points', async (req, res) => {
    const { userId, puntos } = req.body;
    
    // Aquí podrías poner lógica que nadie pueda hackear desde el frente
    const { data, error } = await supabase
        .from('perfiles')
        .update({ experiencia_total: puntos })
        .eq('id', userId);

    if (error) return res.status(400).json(error);
    res.json({ message: "Puntos asignados con éxito", data });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de la Corporación en puerto ${PORT}`));