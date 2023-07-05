# challenge-socket

## Comandos

- `npm start`: Levanta el proyecto en el puerto 8080.
- `npm run dev`: Levanta el proyecto y actualiza el servidor con cada cambio guardado.

## Rutas

- `localhost:8080`: Listado de productos
- `localhost:8080/realtimeproducts`: Listado de productos con Socket integrado

## Endpoints

Ambos enpoints disparan un evento con web sockets que notifica a todos los clientes que se agregó o eliminó un producto.

- `POST api/products`: Crea un producto nuevo. Se debe enviar con archivo de imagen.
- `DELETE api/products/:id`: Elimina el producto enviado.
