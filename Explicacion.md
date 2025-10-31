# ¿Qué es este proyecto?
Es una API REST muy simple hecha con Express (Node + TypeScript) que maneja en memoria una “colección” de discos (tipo LaserDisc) con campos como `id` `filmName`, `rotationType`, etc. Expone endpoints CRUD: crear, leer, actualizar y eliminar. Además, incluye una función `testApi()` que se auto-llama cuando arranca el servidor y prueba la API (GET → POST → GET → PUT → DELETE → GET) usando axios.
## 1) Imports y arranque de Express
```ts
import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
```
- `import … from "…"`. Importaciones ES Modules con TypeScript.
- `express()` crea la app de servidor HTTP -> devuelve un objeto que representa mi servidor web
- `cors()` habilita CORS (para llamadas desde frontends en otros orígenes).
- `express.json()` añade un middleware que parsea JSON en `req.body`.
- `app` corazon del servidor, objeto sobre el que configuro todas las rutas, middlewares y lógica de la API. Tiene métodos para definir como se comporta el servidor.

### 1.1) `app.use(...)` — registrar middlewares
### ¿Qué es un middleware?
Es una función que se ejecuta antes de que tu ruta (GET/POST/…) procese la petición. Sirve para:
- Leer o transformar la petición (`req`)
- Añadir datos a `req` (`req.body`, `req.user`, etc.)
- Cortar la petición devolviendo ya una respuesta (`res`)
- O dejar pasar la petición a lo siguiente con `next()`

**Orden importa**: se ejecutan en el orden en que los declaras.

## 2) Modelo de datos con TypeScript
```ts
type LD = {
  id: number,
  filmName: string,
  rotationType: "CAV" | "CLV",
  region: string,
  lengthMinutes: number,
  videoFormat: "NTSC" | "PAL",
}
```
- `type LD = { … }`: defines un alias de tipo para tus objetos.
- Uniones de literales (`"CAV" | "CLV"`, `"NTSC" | "PAL"`): restringen el valor a esas cadenas exactas.

## 3) “Base de datos” en memoria (array)
```ts
let ld: LD[] = [
  { id: 1, filmName: "EJEMPLO1", rotationType: "CAV", region: "REGION1", lengthMinutes: 10, videoFormat: "NTSC" },
  { id: 2, filmName: "EJEMPLO2", rotationType: "CLV", region: "REGION2", lengthMinutes: 20, videoFormat: "PAL" }
];
```
- `let ld: LD[]` es un array de LD que vive en RAM (se pierde al reiniciar).
- Empiezas con 2 registros de ejemplo.

## 4) Ruta raíz (health check)
```ts
app.get("/", (_req, res) => {
  res.json({ message: "Hey, estás conectado" });
});
```
- Responde un JSON simple para comprobar que el servidor está vivo.

## 5) GET /ld (listar todos)
```ts
app.get("/ld", (_req, res) => {
  res.json(ld);
});
```
- Devuelve el array completo.

## 6) GET /ld/:id (obtener por id)
```ts
app.get("/ld/:id", (req, res) => {
  const idParams = req.params.id;
  const realId = Number(idParams);
  const buscado = ld.find((elem) => elem.id === realId);

  if (buscado) {
    res.json(buscado);
  } else {
    res.status(404).json({ message: "Disco no encontrado" });
  }
});
```
- `:id` es un parámetro de ruta (string). Lo conviertes a número con `Number`.
- `Array.find` busca el elemento por `id`.
- Respondes 200 con el objeto o 404 si no existe.
  
### Códigos de estado HTTP
Cada vez que un servidor responde a una petición (GET, POST, PUT, DELETE…), **no solo envía datos**, también envía un **número llamado “status code”**.
Ese número le dice al cliente (el navegador, Postman, o `axios`) si la petición fue correcta o si hubo un error, y de qué tipo.
## 🧾 Tabla de Códigos de Estado HTTP

| Código | Nombre / Significado           | Descripción y uso común                                   |
|:-------:|:------------------------------|:----------------------------------------------------------|
| **200** | ✅ OK                         | Todo ha ido bien. Respuesta estándar de éxito en `GET`, `PUT` o `DELETE`. |
| **201** | 🎉 Created                    | Recurso creado con éxito. Se usa en `POST` cuando se añade algo nuevo. |
| **202** | 🕓 Accepted                   | Petición aceptada pero puede procesarse más tarde (usado a veces en `PUT`). |
| **204** | 🗑️ No Content                 | Petición correcta pero sin contenido que devolver (por ejemplo, un `DELETE`). |
| **400** | ⚠️ Bad Request                | Error del cliente: datos enviados incorrectos o incompletos. |
| **401** | 🔐 Unauthorized               | Falta autenticación o credenciales incorrectas. |
| **403** | 🚫 Forbidden                  | El servidor entiende la petición pero no permite ejecutarla. |
| **404** | ❌ Not Found                  | El recurso solicitado no existe (por ejemplo, un ID inexistente). |
| **409** | 🔁 Conflict                   | Conflicto con el estado actual del recurso (por ejemplo, duplicados). |
| **500** | 💥 Internal Server Error      | Error en el servidor (excepción no controlada o fallo interno). |
| **502** | 🧱 Bad Gateway                | El servidor actúa como proxy y recibe una respuesta inválida. |
| **503** | 💤 Service Unavailable        | El servidor no está disponible (sobrecarga o mantenimiento). |
| **504** | ⏰ Gateway Timeout            | El servidor no recibe respuesta a tiempo de otro servicio. |

> 💡 **Consejo:**  
> - Los códigos que comienzan con **2xx** indican *éxito*.  
> - Los que comienzan con **4xx** indican *error del cliente*.  
> - Los que comienzan con **5xx** indican *error del servidor*.

## 7) POST /ld (crear) -> añadir al array "base de datos"
```ts
// Ruta POST que recibe peticiones en "/ld" para crear un nuevo disco
app.post("/ld", (req, res) => {

  // Obtiene el id del último elemento del array 'ld' (si existe)
  const lastID = ld.at(-1)?.id;

  // Calcula el nuevo id: si hay uno previo, suma 1; si no hay, empieza en 0
  const newID = lastID ? lastID + 1 : 0;

  // Extrae los datos enviados en el cuerpo (body) de la petición HTTP
  const newfilmName = req.body.filmName;
  const newrotationType = req.body.rotationType;
  const newregion = req.body.region;
  const newlengthMinutes = req.body.lengthMinutes;
  const newvideoFormat = req.body.videoFormat;

  // Crea un nuevo objeto del tipo LD (según la interfaz definida arriba)
  const newdisco: LD = {
    id: newID,                     // id calculado automáticamente
    filmName: newfilmName,         // nombre de la película
    rotationType: newrotationType, // tipo de rotación (CAV o CLV)
    region: newregion,             // región
    lengthMinutes: newlengthMinutes, // duración en minutos
    videoFormat: newvideoFormat    // formato de video (NTSC o PAL)
  };

  // Validación básica: comprueba que los campos existan y sean del tipo correcto
  if (
    newfilmName &&                 // que el nombre no esté vacío
    newrotationType &&             // que exista tipo de rotación
    typeof newfilmName === "string" &&
    typeof newrotationType === "string" &&
    typeof newregion === "string" &&
    typeof newlengthMinutes === "number" &&
    typeof newvideoFormat === "string"
  ) {
    // Si todo está correcto, agrega el nuevo disco al array 'ld' (nuestra "base de datos" simulada)
    ld.push(newdisco);

    // Envía una respuesta HTTP con código 201 (Created) y el nuevo objeto en formato JSON
    res.status(201).json(newdisco);

  } else {
    // Si falta algún dato o el tipo no es correcto, responde con código 400 (Bad Request)
    res.status(400).send("Solicitud incorrecta para la creación");
  }
});

```
- `ld.at(-1)` toma el último elemento del array (si existe). `?.` evita fallo si el array está vacío.
- Calculas `newID` como último `id + 1`, o `0` si no hay datos.
- Tomas el payload de `req.body` (gracias al middleware `express.json()`).
- Haces **validaciones básicas de tipos** y, si todo bien:
  - Insertas en el array.
  - Respondes `201 Created` con el nuevo objeto.
- Si falla, devuelves `400 Bad Request`.

## 8) PUT /ld/:id (actualizar)
```ts
app.put("/ld/:id", (req, res) => {
  const id = Number(req.params.id);
  ld = ld.map((elem) =>
    id == elem.id ? { ...elem, ...req.body } : elem
  );
  res.status(202).send("Disco modificado");
});
```
- Convierte `id` a número.
- Usa `Array.map` para reemplazar inmutablemente el elemento cuyo `id` coincide:
  - `{ ...elem, ...req.body }` es el spread operator para “mergear”.
- Responde `202 Accepted`.

## 9) DELETE /ld/:id (eliminar)
```ts
app.delete("/ld/:id", (req, res) => {
  const id = Number(req.params.id);
  const discoExiste = ld.some((elem) => elem.id === id);

  if (!discoExiste) {
    return res.status(404).json({ message: "Error 404. Disco no encontrado" });
  }

  ld = ld.filter((elem) => elem.id !== id);
  res.status(200).json({ message: "Disco eliminado correctamente" });
});
```
- Comprueba primero si existe (`some`), responde 404 si no.
- Si existe, filtra el array quitando el `id` y devuelve 200.

## 10) `testApi()` – prueba automática de la API
```ts
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
```
- Usa **axios** para llamar a tu propia API y va loggeando el estado en cada paso.
- Flujo: GET inicial → POST uno nuevo → GET → PUT al recién creado → DELETE ese mismo → GET final.

## 11) Arranque del servidor y llamada a `testApi`
```ts
app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor en http://localhost:${port}`);
  setTimeout(() => {
    testApi();
  }, 1000);
});
```
- Escucha en `0.0.0.0:3000`. -> `"0.0.0.0"` indica que aceptará conexiones desde cualquier IP local (útil si pruebas en una red local).
- Tras 1 segundo de gracia, ejecuta `testApi()` para probar todo.




