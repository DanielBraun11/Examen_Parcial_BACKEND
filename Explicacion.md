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
- 
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




















