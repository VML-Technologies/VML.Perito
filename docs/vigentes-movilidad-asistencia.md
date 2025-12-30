# Consulta de Vigentes_Movilidad_Asistencia por Placa

Este endpoint permite consultar los registros de la tabla `Vigentes_Movilidad_Asistencia` filtrando por el número de placa del vehículo.

## Endpoint

```
GET /api/vigentes-movilidad-asistencia?placa=XXX
```

### Parámetros de consulta
- `placa` (string, requerido): Placa del vehículo a consultar.

### Autenticación
Requiere header `Authorization: Bearer <token>`.

## Ejemplo de uso

### cURL
```bash
curl -X GET "http://localhost:3000/api/vigentes-movilidad-asistencia?placa=NHR124" \
  -H "Authorization: Bearer <token>"
```

### JavaScript (fetch)
```js
fetch('http://localhost:3000/api/vigentes-movilidad-asistencia?placa=NHR124', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### JavaScript (axios)
```js
import axios from 'axios';

axios.get('http://localhost:3000/api/vigentes-movilidad-asistencia', {
  params: { placa: 'NHR124' },
  headers: {
    Authorization: 'Bearer <token>'
  }
})
.then(res => console.log(res.data));
```

### PHP (cURL)
```php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:3000/api/vigentes-movilidad-asistencia?placa=NHR124');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer <token>'
]);
$response = curl_exec($ch);
curl_close($ch);
echo $response;
```

## Respuesta exitosa
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "Sucursal": "Sucursal Ejemplo",
      "llave": "...",
      // ...otros campos de la tabla
    }
  ]
}
```

## Errores
- 500: Error consultando registros

