# NodeJS Proyecto01

By: Edwin Montoya Jaramillo - emonto15@eafit.educo

# Descripción de aplicación

Aplicación web que permite gestionar Musica, un CRUD básico de metadatos MP3 (titulo, artista, album y genero).
# 1. Análisis

## 1.1 Requisitos funcionales:

1. Crear canción.
2. Buscar canción por parte del titulo
3. Borrar canción por Id de la canción
4. Listar todas las canciones de la base de datos que sean publicas
5. Listar las canciones privadas de un usuario
6. Listar las canciones compartidas con un usuario

## 1.2 Definición de tecnología de desarrollo y despliegue para la aplicación:

* Lenguaje de Programación: Javascript
* Framework web backend: NodeJS - Express
* Framework web frontend: no se usa - se utilizará Templates HTML para Vista (V)
* Base de datos: MongoDB
* Web App Server: NodeJS
* Web Server: NGINX

# 2. Desarrollo

Se generó la base, con Yeoman:

	$ yo express

# 3. Diseño:

## 3.1 Modelo de datos:

	song:
	{
  	title: String,
  	artist: String,
  	album: String,
  	genre: String,
  	owner: Schema.Types.ObjectId,
  	private: Boolean,
  	sharedWith: [String]
	}

	person: 
	{
  	username: String,
	  password: String
	}

## 3.2 Servicios Web
### Canciones

	/* Servicio Web: Crear Canción
	  Método: POST
	  Autenticado: SI
	  URI: /newSong
	  Body:
	  {
	  "title": val,
	  "artist": val,
  	"album": val,
	  "genre": val,
	  "private" : ["on"| ""],
	  ["sharedWith": val[] ]
	  }
	*/
	/* Servicio Web: Listar todas las canciones publicas
	  Método: GET
	  Autenticado: NO
	  URI: /
	*/
	
	/* Servicio Web: Buscar cancion publica por titulo
	  Método: GET
	  Autenticado: NO
	  URI: /?term=val
	*/
	
	/* Servicio Web: Listar todas las canciones privadas
	  Método: GET
	  Autenticado: SI
	  URI: /home
	*/
	
	/* Servicio Web: Buscar canciones privadas por titulo
	  Método: GET
	  Autenticado: Si
	  URI: /home?term=val
	*/
	
	/* Servicio Web: Listar las canciones compartidas
	  Método: GET
	  Autenticado: SI
	  URI: /sharedWithMe
	*/
	
	/* Servicio Web: Buscar canciones compartidas por titulo
	  Método: GET
	  Autenticado: Si
	  URI: /sharedWithMe?term=val
	*/
	
	/* Servicio Web: Actualizar Canción
	  Método: POST
	  Autenticado: SI
	  URI: /editSong
	  Body:
	  {
	  "id": val,
	  "title": val,
	  "artist": val,
	  "album": val,
	  "genre": val,
	  "private" : ["on"| ""],
	  ["sharedWith": val[] ]
	  }
	*/
	
	/* Servicio Web: Borrar cancion por Id
	  Método: POST
	  Autenticado: SI
	  URI: /deleteSong
	  Body:
	  {
	  "id": "val"
	  }
	*/	
### Usuarios
	/* Servicio Web: Crear usuario
	  Método: POST
	  Autenticado: NO
	  URI: /signup
	  Body: 
	  {
	  "username": "usuario",
	  "password": "password"
	  }
	*/
	/* Servicio Web: Ingresar a la plataforma con un usuario
	  Método: POST
	  Autenticado: NO
	  URI: /login
	  Body: 
	  {
	  "username": "usuario",
	  "password": "password"
	  }
	*/
	/* Servicio Web: Actualizar Usuario
	  Método: POST
	  Autenticado: SI
	  URI: /updateProfile
	  Body: 
	  {
	  "username": val,
	  "password1": password.old,
	  "password": password,
	  }
	*/
	
	/* Servicio Web: Borrar usuario
	  Método: GET
	  Autenticado: SI
	  URI: /deleteUser
	*/

# 4. Despligue en un Servidor Centos 7.x en el DCA

## 4.1 Se instala nvm local para el usuario

source: https://www.liquidweb.com/kb/how-to-install-nvm-node-version-manager-for-node-js-on-centos-7/

      user1$ nvm install v7.7.4

## 4.2 Se instala el servidor mongodb

como root:

      user1$ sudo yum install mongodb-server -y'

ponerlo a correr:

      user1$ sudo systemctl enable mongod
      user1$ sudo systemctl start mongod

## 4.3 Se instala NGINX

      user1$ sudo yum install nginx
      user1$ sudo systemctl enable nginx
      user1$ sudo systemctl start nginx

Abrir el puerto 80

      user1$ sudo firewall-cmd --zone=public --add-port=80/tcp --permanent
      user1$ sudo firewall-cmd --reload

## 4.4 Abrir los puertos en el firewall que utilizara la app:

      user1$ firewall-cmd --zone=public --add-port=3000/tcp --permanent
      user1$ firewall-cmd --reload
      user1$ firewall-cmd --list-all

## 4.5 Se instala un manejador de procesos de nodejs, se instala: PM2 (http://pm2.keymetrics.io/)

      user1$ npm install -g pm2
      user1$ cd dev/proyecto01Musica/
      user1$ pm2 start app.js
      user1$ pm2 list

ponerlo como un servicio, para cuando baje y suba el sistema:    

      user1$ sudo pm2 startup systemd

Deshabilitar SELINUX

          user1$ sudo vim /etc/sysconfig/selinux

                SELINUX=disabled

          user1$ sudo reboot      

### 4.6 Configuración del proxy inverso en NGINX para cada aplicación:

      // /etc/nginx/nginx.config
      .
      .
      server {
        listen       80 default_server;
        listen       [::]:80 default_server;
        server_name  10.131.137.219;
        root         /usr/share/nginx/html;
      .
      .
      location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
      }

      location /emonto15/ {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header HOST $http_host;
        proxy_set_header X-NginX-Proxy true;
        proxy_pass http://127.0.0.1:3000/;
        proxy_redirect off;
      }
      .
      .


# 5. Despliege Produccion:

## 5.1 Proveedor de PaaS: Heroku:

Pasos para el despliegue luego de tener la cuenta:
Se descarga el CLI de Heroku: https://devcenter.heroku.com/articles/heroku-command-line
Luego en la terminal se ejecutan los siguentes pasos:
	
	$ heroku login
	>usernamae:emonto15@eafit.edu.co
	>password *********
	$ heroku git:clone -a proyecto01musica
	$ cd proyecto01musica
	$ git add .
	$ git commit -am "make it better"
	$ git push heroku master

y se verifica en la pagina https://proyecto01musica.herokuapp.com/

## 5.2 Proveedor de BDaaS mLab:

Se crea una cuenta y se crea un ambiente privado (10.0.0.0/16) dentro de AWS, luego se despliega dentro de este ambiente priva con el nombre de la base de datos: proyecto01musica-production y un usuario restapi/restapi.
Luego se ajusta la configuración en config.j:
	.
	.
	production: {
		root: rootPath,
		app: {
			name: 'proyecto01musica',
			port: process.env.PORT || 3000,
			db: 'mongodb://restapi:restapi@ds015962.mlab.com:15962/proyecto01musica-production'
		}
	.
	.
