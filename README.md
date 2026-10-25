# Multiángulos 3D 📐✨

Aplicación web educativa, lúdica, accesible y visual diseñada específicamente para alumnado de **3.º de Educación Primaria (8 años)**, centrada en la geometría básica según el currículo educativo de España.

Hermana del proyecto **MultiBloques**, comparte la misma base de datos e inicio de sesión seguro en Supabase, manteniendo los datos y el progreso del alumno estrictamente aislados.

---

## 🌟 Mundos y Contenidos Educativos

### 1. El Mundo de las Líneas 📏
* **Líneas Paralelas**: Nunca se cruzan por mucho que se prolonguen (vías de tren, renglones, marcos).
* **Líneas Perpendiculares**: Se cruzan formando exactamente 4 ángulos rectos de 90°.
* **Líneas Secantes**: Se cruzan en un único punto.
* **Actividades**: Explicación ilustrada, rotador interactivo en vivo, detective de objetos cotidianos y evaluación final.

### 2. El Taller de las Figuras 📐
* **Cuadriláteros clave de 3.º de Primaria**:
  * **Cuadrado**: 4 lados iguales y 4 ángulos rectos de 90°.
  * **Rectángulo**: 4 ángulos rectos y lados iguales dos a dos.
  * **Rombo**: 4 lados iguales con ángulos inclinados (agudos y obtusos).
  * **Paralelogramo**: Lados opuestos paralelos e iguales dos a dos.
* **Actividades**: Explorador de lados y vértices, juego de emparejar figuras, detective de polígonos y reto de preguntas.

### 3. La Aventura de los Ángulos 🧭
* **Clasificación clara**:
  * **Ángulo Recto**: Exactamente 90°, marcado con un cuadradito en el vértice (esquina de un libro).
  * **Ángulo Agudo**: Menor que 90° (tijeras semicerradas, pico de pájaro).
  * **Ángulo Obtuso**: Mayor que 90° (abanico abierto, tumbona de playa).
* **Actividades**: Medidor interactivo con escuadra virtual, reloj de agujas analógico y quiz con feedback positivo.

### 4. GeoRacer 3D 🏎️
* Juego de carreras 3D sobre tres carriles construido con **Three.js**.
* Puertas geométricas con preguntas rápidas en movimiento.
* Escudo protector amable y aceleración suave sin penalizaciones frustrantes.

### 5. Taller Libre (Geoplano Virtual) 🧪
* Pizarra táctil interactiva donde el niño estira gomas de colores para crear figuras libres.
* Detección en tiempo real de lados, ángulos y clasificación de cuadriláteros.

### 6. Geometrópolis 3D & ÁnguloPark 🏙️🎡
* Gran isla flotante 3D interactiva construida con Three.js y OrbitControls.
* **Mecánica de construcción con estrellas**: El niño empieza con el Rascacielos Cuadrado de bienvenida y puede desbloquear y comprar con sus estrellas conseguidas los 11 edificios y atracciones (Palacio Rectangular, Noria de los Ángulos, Montaña Rusa de Picos Agudos, Faro de 90°, etc.).
* Selector de atmósferas: Soleado ☀️, Atardecer 🌅 y Noche Neón 🌌.

---

## 🛠️ Stack Tecnológico

* **Frontend**: React 19 + TypeScript + Vite.
* **Estilos**: Tailwind CSS + Tipografías didácticas (*Fredoka* y *Nunito*).
* **3D**: Three.js + OrbitControls con iluminación PBR y animaciones procedurales.
* **Audio y Voz**: Efectos de sonido Web Audio API sintetizados (sin dependencias de ficheros externos) + Síntesis de voz Web Speech en español neutro.
* **Base de Datos y Autenticación**: Supabase (RLS, inicio de sesión compartido con MultiBloques, tabla aislada `multiangulos_player_progress`).
* **Testing**: Bun Test Suite (100% pasando).

---

## 🚀 Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/juanysacreu-afk/multiangulos.git
cd multiangulos

# 2. Instalar dependencias
bun install # o npm install

# 3. Iniciar servidor de desarrollo
bun run dev # o npm run dev
```

---

## 📄 Licencia

Desarrollado con cariño pedagógico para la enseñanza de las matemáticas y la geometría.
