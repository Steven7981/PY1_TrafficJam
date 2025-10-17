class Node {
  constructor(key, valor = '.') {
    this.key = key
    this.valor = valor
    this.hijos = new Set()
    this.padres = new Set()
  }

  agregarHijo(hijo) {
    this.hijos.add(hijo)
    hijo.padres.add(this)
  }
}

class Grafo {
  constructor(filas, columnas) {
    this.nodos = new Map()
    this.filas = filas
    this.columnas = columnas
    this.crearTablero()
  }

  crearTablero() {
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        const key = `${i},${j}`
        this.agregarNodo(key)
      }
    }
    
  }

  agregarNodo(key, valor = '.') {
    if (!this.nodos.has(key)) {
      this.nodos.set(key, new Node(key, valor))
    }
    return this.nodos.get(key)
  }

  getNodoValue(i, j){
    return this.nodos.get(`${i},${j}`)
  }
}

// ================= Tablero =================

const tamano = 6
const grafo = new Grafo(tamano, tamano)
let matriz = []

function insertarNodos(){
  matriz = []
  for (let i=0; i<tamano; i++){
    let fila = []
    for (let j=0; j<tamano; j++){
      fila.push(grafo.getNodoValue(i,j).valor)
    }
    matriz.push(fila)
  }
}

// ================= Generar tablero =================

function generarTableroResoluble(numCarros) {
    // 1. Colocar al menos un B
    const orientacionB = Math.random() < 0.5 ? 'H' : 'V';
    let iB, jB;

    if (orientacionB === 'H') {
        iB = Math.floor(Math.random() * tamano);
        jB = Math.floor(Math.random() * (tamano - 2)); // ancho de 2 o 3
    } else {
        iB = Math.floor(Math.random() * (tamano - 2));
        jB = Math.floor(Math.random() * tamano);
    }

    colocarCarro(iB, jB, orientacionB, 2, true); // colocar B

    // 2. Colocar S en el borde correspondiente
    if (orientacionB === 'H') {
        grafo.getNodoValue(iB, tamano - 1).valor = 'S'; // extremo derecho
    } else {
        grafo.getNodoValue(tamano - 1, jB).valor = 'S'; // extremo inferior
    }

    // 3. Colocar el resto de carros
    let carrosColocados = 1;
    const intentosMax = 200;
    let intentos = 0;

    while (carrosColocados < numCarros && intentos < intentosMax) {
        intentos++;
        const orientacion = Math.random() < 0.5 ? 'H' : 'V';
        const largo = Math.floor(Math.random() * 2) + 2;
        const i = Math.floor(Math.random() * (orientacion === 'H' ? tamano : tamano - 1));
        const j = Math.floor(Math.random() * (orientacion === 'V' ? tamano : tamano - 1));
        const esB = Math.random() < 0.3;

        if (puedeColocar(i, j, orientacion, largo, esB)) {
            colocarCarro(i, j, orientacion, largo, esB);
            carrosColocados++;
        }
    }
}




function puedeColocar(i,j,orientacion,largo){
  if (orientacion==='H'){
    if (j+largo>tamano) return false
    for (let x=0;x<largo;x++)
      if (grafo.getNodoValue(i,j+x).valor !== '.') return false
  } else {
    if (i+largo>tamano) return false
    for (let x=0;x<largo;x++)
      if (grafo.getNodoValue(i+x,j).valor !== '.') return false
  }
  return true
}

function colocarCarro(i, j, orientacion, largo, esB = false) {
    if (orientacion === 'H') {
        // Cuerpo del carro
        for (let x = 0; x < largo - 1; x++) {
            grafo.getNodoValue(i, j + x).valor = '-';
        }
        // Cabeza/punta del carro
        grafo.getNodoValue(i, j + largo - 1).valor = esB ? 'B' : '>';
    } else { // Vertical
        for (let x = 0; x < largo - 1; x++) {
            grafo.getNodoValue(i + x, j).valor = '|';
        }
        grafo.getNodoValue(i + largo - 1, j).valor = esB ? 'B' : 'v';
    }
}

// ================= Funciones auxiliares =================

function clonarMatriz(tablero){
  return tablero.map(fila => [...fila])
}

function tableroAString(tablero){
  return tablero.map(f => f.join('')).join('|')
}

function imprimirMatriz(tablero){
  tablero.forEach(f=>console.log(f.join(' ')))
  console.log('-------------------')
}



function puedeMover(tablero, carro, dir){
  if (carro.orientacion==='H'){
    if (dir==='derecha'){
      const last = carro.posiciones[carro.posiciones.length-1]
      return last.j+1<tablero[0].length && tablero[last.i][last.j+1]==='.'
    }
    if (dir==='izquierda'){
      const first = carro.posiciones[0]
      return first.j-1>=0 && tablero[first.i][first.j-1]==='.'
    }
  } else {
    if (dir==='abajo'){
      const last = carro.posiciones[carro.posiciones.length-1]
      return last.i+1<tablero.length && tablero[last.i+1][last.j]==='.'
    }
    if (dir==='arriba'){
      const first = carro.posiciones[0]
      return first.i-1>=0 && tablero[first.i-1][first.j]==='.'
    }
  }
  return false
}

function moverCarro(tablero, carro, dir) {
    const nuevo = clonarMatriz(tablero);
    const pos = carro.posiciones;

    // Función auxiliar para eliminar el carro B
    function eliminarCarroB() {
        for (let x = 0; x < nuevo.length; x++) {
            for (let y = 0; y < nuevo[x].length; y++) {
                if (nuevo[x][y] === 'B') nuevo[x][y] = '.';
            }
        }
        console.log("🚗 B llegó a la salida y fue eliminado del tablero.");
    }

    if (carro.orientacion === 'H') {
        if (dir === 'derecha') {
            const last = pos[pos.length - 1];
            nuevo[last.i][last.j] = '.';

            for (let k = pos.length - 2; k >= 0; k--) {
                const p = pos[k];
                nuevo[p.i][p.j + 1] = '-';
                nuevo[p.i][p.j] = '.';
            }

            
            nuevo[pos[0].i][pos[0].j] = '.';

            // Si B se mueve hacia la derecha, verificar si el siguiente espacio es la salida
            const destinoJ = last.j + 1;
            if (carro.valor === 'B' && destinoJ < nuevo[0].length && nuevo[last.i][destinoJ] === 'S') {
                eliminarCarroB();
                return nuevo;
            }

            
            nuevo[last.i][destinoJ] = carro.valor === 'B' ? 'B' : '>';
        }

        if (dir === 'izquierda') {
            for (let k = 0; k < pos.length; k++)
                nuevo[pos[k].i][pos[k].j] = '.';

            for (let k = 0; k < pos.length - 1; k++) {
                const p = pos[k];
                nuevo[p.i][p.j - 1] = '-';
            }

            const last = pos[pos.length - 1];
            const destinoJ = last.j - 1;

            if (carro.valor === 'B' && destinoJ >= 0 && nuevo[last.i][destinoJ] === 'S') {
                eliminarCarroB();
                return nuevo;
            }

            nuevo[last.i][destinoJ] = carro.valor === 'B' ? 'B' : '>';
        }
    }

    else {
        if (dir === 'abajo') {
            const last = pos[pos.length - 1];
            nuevo[last.i][last.j] = '.';

            for (let k = 0; k < pos.length - 1; k++) {
                const p = pos[k];
                nuevo[p.i + 1][p.j] = '|';
                nuevo[p.i][p.j] = '.';
            }

            const destinoI = last.i + 1;

            if (carro.valor === 'B' && destinoI < nuevo.length && nuevo[destinoI][last.j] === 'S') {
                eliminarCarroB();
                return nuevo;
            }

            nuevo[destinoI][last.j] = carro.valor === 'B' ? 'B' : 'v';
        }

        if (dir === 'arriba') {
            for (let k = 0; k < pos.length; k++)
                nuevo[pos[k].i][pos[k].j] = '.';

            const last = pos[pos.length - 1];
            const destinoI = last.i - 1;

            if (carro.valor === 'B' && destinoI >= 0 && nuevo[destinoI][last.j] === 'S') {
                eliminarCarroB();
                return nuevo;
            }

            nuevo[destinoI][last.j] = carro.valor === 'B' ? 'B' : 'v';

            for (let k = 0; k < pos.length - 1; k++) {
                const p = pos[k];
                nuevo[p.i - 1][p.j] = '|';
            }
        }
    }

    return nuevo;
}





// ================= Backtracking =================

const visitados = new Set()

function backtracking(tablero, movimientos = 0, limite = 2000) {
    if (movimientos > limite) return null;

    const key = tableroAString(tablero);
    if (visitados.has(key)) return null;
    visitados.add(key);

    
    const posicionesB = [];
    for (let i = 0; i < tablero.length; i++) {
        for (let j = 0; j < tablero[i].length; j++) {
            if (tablero[i][j] === 'B') posicionesB.push({ i, j });
        }
    }

    
    for (const b of posicionesB) {
        const adyacentes = [
            { i: b.i - 1, j: b.j },
            { i: b.i + 1, j: b.j },
            { i: b.i, j: b.j - 1 },
            { i: b.i, j: b.j + 1 },
        ];

        for (const pos of adyacentes) {
            if (
                pos.i >= 0 && pos.i < tablero.length &&
                pos.j >= 0 && pos.j < tablero[0].length &&
                tablero[pos.i][pos.j] === 'S'
            ) {
                console.log(`🚗 B llegó a la salida en ${movimientos} movimientos.`);

                
                const nuevoTablero = tablero.map(f => [...f]);

                
                eliminarCuerpoDeB(nuevoTablero, b.i, b.j);

                
                const quedanB = nuevoTablero.some(fila => fila.includes('B'));
                if (!quedanB) {
                    console.log(`✅ Todos los B salieron en ${movimientos} movimientos.`);
                    imprimirMatriz(nuevoTablero);
                    return movimientos;
                }

                
                return backtracking(nuevoTablero, movimientos + 1, limite);
            }
        }
    }

    let mejor = null;

    
    const carros = obtenerTodosLosCarros(tablero);

    for (const carro of carros) {
        const dirs = carro.orientacion === 'H'
            ? ['derecha', 'izquierda']
            : ['abajo', 'arriba'];

        for (const dir of dirs) {
            if (puedeMover(tablero, carro, dir)) {
                const nuevoTablero = moverCarro(tablero, carro, dir);

                console.log(`Moviendo ${carro.valor} hacia ${dir}:`);
                imprimirMatriz(nuevoTablero);
                console.log('-------------------');

                const r = backtracking(nuevoTablero, movimientos + 1, limite);
                if (r !== null && (mejor === null || r < mejor)) mejor = r;
            }
        }
    }

    return mejor;
}

function eliminarCuerpoDeB(tablero, i, j) {
    
    let orientacion = null;

    if (j + 1 < tablero[0].length && tablero[i][j + 1] === '-') orientacion = 'H';
    else if (j - 1 >= 0 && tablero[i][j - 1] === '-') orientacion = 'H';
    else if (i + 1 < tablero.length && tablero[i + 1][j] === '|') orientacion = 'V';
    else if (i - 1 >= 0 && tablero[i - 1][j] === '|') orientacion = 'V';
    else orientacion = 'H'; 
    

    tablero[i][j] = '.';

    if (orientacion === 'H') {
        
        let k = j - 1;
        while (k >= 0 && tablero[i][k] === '-') {
            tablero[i][k] = '.';
            k--;
        }
        
        k = j + 1;
        while (k < tablero[0].length && tablero[i][k] === '-') {
            tablero[i][k] = '.';
            k++;
        }
    } else {
        
        let k = i - 1;
        while (k >= 0 && tablero[k][j] === '|') {
            tablero[k][j] = '.';
            k--;
        }
        
        k = i + 1;
        while (k < tablero.length && tablero[k][j] === '|') {
            tablero[k][j] = '.';
            k++;
        }
    }
}



function obtenerTodosLosCarros(tablero) {
    const carros = [];
    const visitado = Array.from({ length: tablero.length }, () =>
        Array(tablero[0].length).fill(false)
    );

    for (let i = 0; i < tablero.length; i++) {
        for (let j = 0; j < tablero[i].length; j++) {
            if (visitado[i][j]) continue;
            const valor = tablero[i][j];
            if (valor === '.' || valor === 'S') continue;

            let orientacion, posiciones = [{ i, j }];
            visitado[i][j] = true;

            if (valor === '-' || valor === '>' || valor === 'B') { 
                orientacion = 'H';
                let col = j + 1;
                while (col < tablero[0].length) {
                    const v = tablero[i][col];
                    if (v === '-') posiciones.push({ i, j: col });
                    else if (v === '>' || v === 'B') {
                        posiciones.push({ i, j: col });
                        visitado[i][col] = true;
                        break;
                    } else break;
                    visitado[i][col] = true;
                    col++;
                }
            } else { 
                orientacion = 'V';
                let fila = i + 1;
                while (fila < tablero.length) {
                    const v = tablero[fila][j];
                    if (v === '|') posiciones.push({ i: fila, j });
                    else if (v === 'v') {
                        posiciones.push({ i: fila, j });
                        visitado[fila][j] = true;
                        break;
                    } else break;
                    visitado[fila][j] = true;
                    fila++;
                }
            }

            
            const last = posiciones[posiciones.length - 1];
            let valorCarro = tablero[last.i][last.j];

            carros.push({ valor: valorCarro, orientacion, posiciones });
        }
    }

    return carros;
}



// ================= Ejecutar =================

generarTableroResoluble(4)
insertarNodos()

console.log("Tablero inicial:")
imprimirMatriz(matriz)
const listaCarros = obtenerTodosLosCarros(matriz);



const totalMovimientos = backtracking(matriz)
if(totalMovimientos===null){
  console.log("No hay solución")
}else{
  console.log("Cantidad de movimientos realizados:", totalMovimientos)
}
