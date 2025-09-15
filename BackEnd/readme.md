Aprovechando que tenemos este trabajo para aprender a utilizar Mongoose y dado que
las colecciones corren a disposición meramente mía, me tomé el atrevimiento de
combinar el trabajo que estoy realizando en mi proyecto con este.

Por ello creé 5 colecciones:

Usuario: que tendrá un documento embebido (perfil).

Lista: dado que en mi proyecto el usuario deberá ser capaz de crear su propia.
lista personalizada.

Proyecto: este modelo solo tiene como fin cumplir con la consigna solicitada en el tp.

Planta: aquí estará la estructura que deberán seguir los documentos con la clasificación
de las plantas.

Insecto: de igual manera que con el modelo anteriormente nombrado, dispondrá de la clasificación
de los insectos.

Relaciones:

Uno a Uno
Usuario ---- Proyecto

Muchos a Muchos

Usuario ---- Lista

Lista --- Planta e Insecto

Eliminaciones:
Usuario: lógica
Proyecto: cascada, no puede existir sin el usuario que lo creó
Planta: cascada, si se elimina la planta debe desapareceer de la lista
Insecto: cascada, si se elimina el insecto debe desaparecer de la lista

Populate:
Populate trabaja trabaja sobre campos que existen en el documento que se consulta
tomando el campo donde se guarda el ObjectId reemplazándolo por el documento
completo al que pertenece
Por ello al hacer populate en plant.model e insect.model no trae nada, porque ese campo no existe
Para solucionar lo de ↑ se usa la propiedad virtual.

Virtual:
Es una propiedad que no se guarda en la BD, pero le dice a Mongoose que, al consultar una
plant o insect (en mi caso), busque en list, todos los documentos cuyos campos coincidan con
plants o insects que contengan ese \_id, devolviéndolos como list.

toObject le dice a Mongoose cómo debe convertir el documento a un objeto de Js normal, mientras que
toJson le dice cómo convertir el documento a Json
