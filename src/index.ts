import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

type LD = {
    id: number,
    filmName: string,
    rotationType: "CAV" | "CLV",
    region: string,
    lengthMinutes: number,
    videoFormat: "NTSC" | "PAL", 
}

let ld: LD[] = [ 
    { id: 1, 
      filmName: "EJEMPLO1",
      rotationType: "CAV",
      region: "REGION1",
      lengthMinutes: 10,
      videoFormat: "NTSC"
    },
    { id: 2, 
      filmName: "EJEMPLO2",
      rotationType: "CLV",
      region: "REGION2",
      lengthMinutes: 20,
      videoFormat: "PAL"
    }
];

// Cuando llega un GET a / respondemos con un mensaje de bienvenida
app.get("/", (_req, res) => {
  res.json({ 
    message: "Hey, estás conectado" 
  });
});


app.get("/ld", (_req, res) => {
  res.json(ld);
});

app.get("/ld/:id", (req, res) => {
  const idParams = req.params.id;
  const realId = Number(idParams);
  const buscado = ld.find((elem) => elem.id === realId);

  if (buscado) {
    res.json(buscado);
  } else {
    res.status(404).json({
      message: "Disco no encontrado",
    });
  }
});

app.post("/ld", (req, res) => {
  const lastID = ld.at(-1)?.id;
  const newID = lastID ? lastID + 1 : 0;

  const newfilmName = req.body.filmName;
  const newrotationType = req.body.rotationType;
  const newregion = req.body.region;
  const newlengthMinutes = req.body.lengthMinutes;
  const newvideoFormat = req.body.videoFormat;

  const newdisco: LD = {
    id: newID,
    filmName: newfilmName,
    rotationType: newrotationType,
    region: newregion,
    lengthMinutes: newlengthMinutes, 
    videoFormat: newvideoFormat
  };

  if (
    newfilmName &&
    newrotationType &&
    typeof newfilmName === "string" &&
    typeof newrotationType === "string" &&
    typeof newregion === "string" &&
    typeof newlengthMinutes === "number" &&
    typeof newvideoFormat === "string" 
  ) {
    ld.push(newdisco);
    res.status(201).json(newdisco);
  } else {
    res.status(400).send("Solicitud incorrecta para la creación");
  }
});

app.put("/ld/:id", (req, res) => {
  const id = Number(req.params.id);
  ld = ld.map((elem) =>
    id == elem.id ? { ...elem, ...req.body } : elem
  );
  res.status(202).send("Disco modificado");
});

app.delete("/ld/:id", (req, res) => {
  const id = Number(req.params.id);
  const discoExiste = ld.some((elem) => elem.id === id);

  if (!discoExiste) {
    return res.status(404).json({ message: "Error 404. Disco no encontrado" });
  }

  ld = ld.filter((elem) => elem.id !== id);
  res.status(200).json({ message: "Disco eliminado correctamente" });
});

// FUNICIÓN DE TESTING
async function testApi() {
  const baseURL = "http://localhost:3000"; 

  try {
    const respuestaGet = await axios.get(`${baseURL}/ld`);
    console.log("Discos iniciales:", respuestaGet.data);

    const respuestaPost = await axios.post(`${baseURL}/ld`, {
      filmName: "EJEMPLO3",     
      rotationType: "CAV",
      region: "REGION3",
      lengthMinutes: 30,
      videoFormat: "NTSC"
    });
    console.log("Nuevo disco creado:", respuestaPost.data);

    const respuestaGet2 = await axios.get(`${baseURL}/ld`);
    console.log("Discos después del POST:", respuestaGet2.data);

    await axios.put(`${baseURL}/ld/${respuestaPost.data.id}`, {
      rotationType: "CLV",
      lengthMinutes: 40,
      videoFormat: "PAL"
    });
    console.log(`Disco con id ${respuestaPost.data.id} modificado.`);

    await axios.delete(`${baseURL}/ld/${respuestaPost.data.id}`);
    console.log(`Disco con id ${respuestaPost.data.id} eliminado.`);

    const respuestaGetFinal = await axios.get(`${baseURL}/ld`);
    console.log("Discos finales:", respuestaGetFinal.data);

  } catch (error) {
    console.log("Error en testApi:", error);
  }
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor en http://localhost:${port}`);
  setTimeout(() => {
    testApi();
  }, 1000);
});
