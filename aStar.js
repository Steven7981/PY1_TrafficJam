

class Node {
  constructor(key, valor = '.') {
    this.key = key;
    this.valor = valor;
    this.hijos = new Set();
    this.padres = new Set();
  }

  agregarHijo(hijo) {
    this.hijos.add(hijo);
    hijo.padres.add(this);
  }
}

class Grafo {
  constructor(filas, columnas) {
    this.filas = filas;
    this.columnas = columnas;
    this.nodos = new Map();
    this.crearTablero();
  }

  crearTablero() {
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        const key = `${i},${j}`;
        this.agregarNodo(key);
      }
    }
  }

  getFilas(){
    return this.filas;
  }

  getColumnas(){
    return this.columnas;
  }

  agregarNodo(key, valor = '.') {
    if (!this.nodos.has(key)) {
      this.nodos.set(key, new Node(key, valor));
    }
    return this.nodos.get(key);
  }

  getNodoValue(i, j) {
    return this.nodos.get(`${i},${j}`);
  }

  setNodoValue(i, j, valor) {
    this.nodos.get(`${i},${j}`).valor = valor;
  }

  aMatriz() {
    const matriz = [];
    for (let i = 0; i < this.filas; i++) {
      const fila = [];
      for (let j = 0; j < this.columnas; j++) {
        fila.push(this.getNodoValue(i, j).valor);
      }
      matriz.push(fila);
    }
    return matriz;
  }
}

function crearMatriz(n, m) {
  const matriz = [];
  for (let i = 0; i < n; i++) {
    const fila = [];
    for (let j = 0; j < m; j++) {
      fila.push('.'); // valor por defecto
    }
    matriz.push(fila);
  }
  return matriz;
}

// Función para convertir un grafo a una matriz
function grafoAMatriz(grafo) {
  const matriz = [];
  for (let i = 0; i < grafo.filas; i++) {
    const fila = [];
    for (let j = 0; j < grafo.columnas; j++) {
      fila.push(grafo.getNodoValue(i, j).valor);
    }
    matriz.push(fila);
  }
  return matriz;
}


function imprimirMatriz(grafo) {
  const matriz = grafo.aMatriz();
  for (const fila of matriz) console.log(fila.join(' '));
  console.log('');
}

// Detectar todos los carros en el grafo, incluyendo B
function obtenerTodosLosCarros(grafo) {
  const filas = grafo.filas, cols = grafo.columnas;
  const visitado = Array.from({ length: filas }, () => Array(cols).fill(false));
  const carros = [];

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < cols; j++) {
      if (visitado[i][j]) continue;
      const v = grafo.getNodoValue(i, j).valor;
      if (v === '.' || v === 'S') { 
        visitado[i][j] = true; 
        continue; 
      }

      // Carro principal B
      if (v === 'B') {
        const arriba = i > 0 ? grafo.getNodoValue(i - 1, j).valor : null;
        const izquierda = j > 0 ? grafo.getNodoValue(i, j - 1).valor : null;
        

        let orientacion = 'H';
        if (arriba === '|' || abajo === '|') orientacion = 'V';
        if (izquierda === '-' || derecha === '-') orientacion = 'H';

        const posiciones = [];
        if (orientacion === 'H') {
          let col = j - 1;
          while (col >= 0 && grafo.getNodoValue(i, col).valor === '-') {
            posiciones.unshift({ i, j: col });
            visitado[i][col] = true;
            col--;
          }
          posiciones.push({ i, j });
        } else {
          let fila = i - 1;
          while (fila >= 0 && grafo.getNodoValue(fila, j).valor === '|') {
            posiciones.unshift({ i: fila, j });
            visitado[fila][j] = true;
            fila--;
          }
          posiciones.push({ i, j });
        }

        for (const pos of posiciones) visitado[pos.i][pos.j] = true;

        carros.push({
          valor: 'B',
          orientacion,
          posiciones
        });
        continue;
      }

      // Cabeza horizontal >
      if (v === '>') {
        let left = j - 1;
        const posiciones = [];
        while (left >= 0 && grafo.getNodoValue(i, left).valor === '-') {
          posiciones.push({ i, j: left });
          visitado[i][left] = true;
          left--;
        }
        posiciones.reverse();
        posiciones.push({ i, j });
        visitado[i][j] = true;
        carros.push({ valor: v, orientacion: 'H', posiciones });
        continue;
      }

      // Cabeza vertical v
      if (v === 'v') {
        let up = i - 1;
        const posiciones = [];
        while (up >= 0 && grafo.getNodoValue(up, j).valor === '|') {
          posiciones.push({ i: up, j });
          visitado[up][j] = true;
          up--;
        }
        posiciones.reverse();
        posiciones.push({ i, j });
        visitado[i][j] = true;
        carros.push({ valor: v, orientacion: 'V', posiciones });
        continue;
      }

      // Cuerpo horizontal sin cabeza
      if (v === '-') {
        let col = j;
        const cuerpos = [];
        while (col < cols && grafo.getNodoValue(i, col).valor === '-') {
          cuerpos.push({ i, j: col });
          visitado[i][col] = true;
          col++;
        }
        if (col < cols) {
          const head = grafo.getNodoValue(i, col).valor;
          if (head === '>' || head === 'B') {
            const posiciones = [...cuerpos, { i, j: col }];
            visitado[i][col] = true;
            carros.push({ valor: head, orientacion: 'H', posiciones });
            continue;
          }
        }
        continue;
      }

      // Cuerpo vertical sin cabeza
      if (v === '|') {
        let fila = i;
        const cuerpos = [];
        while (fila < filas && grafo.getNodoValue(fila, j).valor === '|') {
          cuerpos.push({ i: fila, j });
          visitado[fila][j] = true;
          fila++;
        }
        if (fila < filas) {
          const head = grafo.getNodoValue(fila, j).valor;
          if (head === 'v' || head === 'B') {
            const posiciones = [...cuerpos, { i: fila, j }];
            visitado[fila][j] = true;
            carros.push({ valor: head, orientacion: 'V', posiciones });
            continue;
          }
        }
        continue;
      }

      visitado[i][j] = true;
    }
  }

  for (const c of carros) {
    if (c.orientacion === 'H') c.posiciones.sort((a,b) => a.j - b.j);
    else c.posiciones.sort((a,b) => a.i - b.i);
  }

  return carros;
}

function puedeMover(grafo, carro, direccion) {
  const filas = grafo.filas, cols = grafo.columnas;
  if (carro.orientacion === 'H') {
    if (direccion === 'derecha') {
      const last = carro.posiciones[carro.posiciones.length - 1];
      const nuevoI = last.i, nuevoJ = last.j + 1;
      if (nuevoJ >= cols) return false;
      const valor = grafo.getNodoValue(nuevoI, nuevoJ).valor;
      return valor === '.' || (valor === 'S' && carro.valor === 'B');
    }
    if (direccion === 'izquierda') {
      const first = carro.posiciones[0];
      const nuevoI = first.i, nuevoJ = first.j - 1;
      if (nuevoJ < 0) return false;
      return grafo.getNodoValue(nuevoI, nuevoJ).valor === '.';
    }
    return false;
  } else { // Vertical
    if (direccion === 'abajo') {
      const last = carro.posiciones[carro.posiciones.length - 1];
      const nuevoI = last.i + 1, nuevoJ = last.j;
      if (nuevoI >= filas) return false;
      const valor = grafo.getNodoValue(nuevoI, nuevoJ).valor;
      return valor === '.' || (valor === 'S' && carro.valor === 'B');
    }
    if (direccion === 'arriba') {
      const first = carro.posiciones[0];
      const nuevoI = first.i - 1, nuevoJ = first.j;
      if (nuevoI < 0) return false;
      return grafo.getNodoValue(nuevoI, nuevoJ).valor === '.';
    }
    return false;
  }
}

function moverCarro(grafo, carro, direccion, pasos = 1) {
  // calcula nuevas posiciones desplazando 'pasos' casillas en 'direccion'
  let nuevas = [];
  if (carro.orientacion === 'H') {
    if (direccion === 'derecha') nuevas = carro.posiciones.map(pos => ({ i: pos.i, j: pos.j + pasos }));
    else if (direccion === 'izquierda') nuevas = carro.posiciones.map(pos => ({ i: pos.i, j: pos.j - pasos }));
    else throw new Error('Dirección inválida para carro horizontal');
  } else {
    if (direccion === 'abajo') nuevas = carro.posiciones.map(pos => ({ i: pos.i + pasos, j: pos.j }));
    else if (direccion === 'arriba') nuevas = carro.posiciones.map(pos => ({ i: pos.i - pasos, j: pos.j }));
    else throw new Error('Dirección inválida para carro vertical');
  }

  // limpiar posiciones antiguas
  for (const pos of carro.posiciones) grafo.setNodoValue(pos.i, pos.j, '.');

  // colocar nuevo (mismo formato)
  for (let k = 0; k < nuevas.length; k++) {
    const pos = nuevas[k];
    if (k === nuevas.length - 1) {
      if (carro.valor === 'B') grafo.setNodoValue(pos.i, pos.j, 'B');
      else if (carro.orientacion === 'H') grafo.setNodoValue(pos.i, pos.j, '>');
      else grafo.setNodoValue(pos.i, pos.j, 'v');
    } else {
      grafo.setNodoValue(pos.i, pos.j, carro.orientacion === 'H' ? '-' : '|');
    }
  }

  return { valor: carro.valor, orientacion: carro.orientacion, posiciones: nuevas };
}


function clonarGrafo(grafo) {
  const nuevo = new Grafo(grafo.filas, grafo.columnas);
  for (let i = 0; i < grafo.filas; i++) {
    for (let j = 0; j < grafo.columnas; j++) {
      nuevo.setNodoValue(i, j, grafo.getNodoValue(i,j).valor);
    }
  }
  return nuevo;
}

//funcion para serializar el grafo, para evitar explorar estados ya vistos
function serializarGrafo(grafo) {
  return grafo.aMatriz().flat().join('');
}

//funcion para calucular cuantos pasos hay entre la cabeza del carro B hastra S
function heuristica(carroB, salida) {
  // Distancia Manhattan de la cabeza de B a su salida
  const cabeza = carroB.posiciones[carroB.posiciones.length - 1];
  return Math.abs(cabeza.i - salida.i) + Math.abs(cabeza.j - salida.j);
}

//funcion para buscar si queda algun B pendiente en el tablero
function estadoMeta(grafo) {
  
  for (let i = 0; i < grafo.filas; i++) {
    for (let j = 0; j < grafo.columnas; j++) {
      const val = grafo.getNodoValue(i, j);
      if (val.valor === 'B') return false;
    }
  }
  return true;
}

function AEstrella(grafoInicial) {
  const abiertos = [];
  const visitados = new Set();

  // lista para guardar cada movimiento que hace B con sus respectivos datos
  abiertos.push({
    grafo: clonarGrafo(grafoInicial),
    g: 0,
    h: 0,
    f: 0,
    movimientos: []
  });

  //se elige el f mas abajo, en donde f es g (costo acumulado hasta el movimiento actual, en este caso cantidad de movimientos) + h (heurisitca)
  while (abiertos.length > 0) {
    abiertos.sort((a, b) => a.f - b.f);
    const actual = abiertos.shift();

    //verificar si ya todos los B ya salieron
    if (estadoMeta(actual.grafo)) {
      console.log("Todos los B salieron del tablero");

      // Agrupar movimientos por carro para la salida tipo lista
      const movimientosPorCarro = {};

      // actual representa el estado completo del tablero en este paso, incluyendo todas las posiciones de los carros y los movimientos que llevaron a este estado.

      actual.movimientos.forEach((mov, index) => {
        if (!movimientosPorCarro[mov.carro]) movimientosPorCarro[mov.carro] = [];
        movimientosPorCarro[mov.carro].push({
          index,
          carro: mov.carro,
          direccion: mov.dir,
          g: mov.g,
          h: mov.h,
          f: mov.f
        });
      });

      // Imprimir en formato de lista
      console.log("Camino encontrado:");
      for (const [carro, lista] of Object.entries(movimientosPorCarro)) {
        console.log(`Carro ${carro}:`);
        console.log(JSON.stringify(lista, null, 2)); // con sangrías
      }

      return actual.movimientos;
    }

    //serializamos el grafo para evitar explorarlo mas adelante
    const key = serializarGrafo(actual.grafo);
    if (visitados.has(key)) continue;
    visitados.add(key);

    //obtener todos los carros e ir moviendo uno por uno
    const carros = obtenerTodosLosCarros(actual.grafo);

    for (const carro of carros) { // determinar la orientacion del carro
      const direcciones = carro.orientacion === 'H'
        ? ['izquierda', 'derecha']
        : ['arriba', 'abajo'];

        //determinar si e carro se puede mover
      for (const dir of direcciones) {
        if (!puedeMover(actual.grafo, carro, dir)) 
            continue;

        const ultimaPos = carro.posiciones[carro.posiciones.length - 1];
        let nextI = ultimaPos.i;
        let nextJ = ultimaPos.j;

        //determinar la nueva posicion de la cabeza
        if (dir === 'derecha') nextJ++;
        if (dir === 'izquierda') nextJ--;
        if (dir === 'arriba') nextI--;
        if (dir === 'abajo') nextI++;

        //revisar si el siguiente nodo es la salida (S)
        const siguienteNodo =
          nextI >= 0 && nextI < actual.grafo.filas &&
          nextJ >= 0 && nextJ < actual.grafo.columnas
            ? actual.grafo.getNodoValue(nextI, nextJ)
            : null;

        const nuevo = clonarGrafo(actual.grafo);
        const carroMovido = moverCarro(nuevo, carro, dir);

        //si fuese que el siguiente nodo es S y es un carro B, se limpia el carro B del tablero
        if (carro.valor === 'B' && siguienteNodo && siguienteNodo.valor === 'S') {
          for (const p of carroMovido.posiciones) {
            nuevo.setNodoValue(p.i, p.j, '.');
          }
        }

        const keyNuevo = serializarGrafo(nuevo);
        if (visitados.has(keyNuevo)) continue;

        //aumentamos el costo g
        const g = actual.g + 1;

        //saca una nueva lista de todos los carros pero que sean solo B para poder calcular la heuristica
        const Bs = obtenerTodosLosCarros(nuevo).filter(c => c.valor === 'B');
        let h = 0;
        if (Bs.length > 0) {
          const salidas = [];
          for (let i = 0; i < nuevo.filas; i++) { // buscamos todas las posiciones de S si fuese que hay varias y calcular el mas cercano a B
            for (let j = 0; j < nuevo.columnas; j++) {
              const val = nuevo.getNodoValue(i, j).valor;
              if (val === 'S') salidas.push({ i, j });
            }
          }
          h = Math.min(...Bs.map(b => Math.min(...salidas.map(s => heuristica(b, s)))));
        }

        const f = g + h;

        //Agrega a la lista de nodos abiertos el nuevo tablero resultante de mover un carro, 
        // con su costo acumulado g, la heurística h, la puntuación total f y el historial de movimientos hasta ese punto
        abiertos.push({
          grafo: nuevo,
          g,
          h,
          f,
          movimientos: [...actual.movimientos, { carro: carro.valor, dir, g, h, f }]
        });
      }
    }
  }

  console.log("No se encontró solución.");
  return null;
}

// funcion para buscar cual es la maxima cantidad de pasos que se puede hacer una sola direccion
function maxAdvance(grafo, carro, direccion) {
  const filas = grafo.filas, cols = grafo.columnas;
  let pasos = 0;

  if (carro.orientacion === 'H') {
    // si el carro es Horizontal, se busca los movimientos hacia derecha e izq
    if (direccion === 'derecha') {
      let j = carro.posiciones[carro.posiciones.length - 1].j + 1; //j es la columna de la cabeza +1
      const i = carro.posiciones[0].i; //i es la fila en donde se encuentra
      while (j < cols) {
        const val = grafo.getNodoValue(i, j).valor;
        if (val === '.' || (val === 'S' && carro.valor === 'B')) { //mientras sea . avanza, pero si se encuentra S, para pero avanza si estamos con carro B
          pasos++;
          if (val === 'S') break; // puede entrar y terminar
          j++;
        } else break;
      }
    } else { // izquierda
      let j = carro.posiciones[0].j - 1;
      const i = carro.posiciones[0].i;
      while (j >= 0) {
        const val = grafo.getNodoValue(i, j).valor;
        if (val === '.') { pasos++; j--; }
        else break;
      }
    }
  } else { // Vertical
    if (direccion === 'abajo') {
      let i = carro.posiciones[carro.posiciones.length - 1].i + 1;
      const j = carro.posiciones[0].j;
      while (i < filas) {
        const val = grafo.getNodoValue(i, j).valor;
        if (val === '.' || (val === 'S' && carro.valor === 'B')) {
          pasos++;
          if (val === 'S') break;
          i++;
        } else break;
      }
    } else { // arriba
      let i = carro.posiciones[0].i - 1;
      const j = carro.posiciones[0].j;
      while (i >= 0) {
        const val = grafo.getNodoValue(i, j).valor;
        if (val === '.') { pasos++; i--; }
        else break;
      }
    }
  }

  return pasos; // 0 significa que no puede moverse
}
function puedeColocar(grafo, i, j, orientacion, largo) {
  if (orientacion === 'H') {
    if (j + largo - 1 >= grafo.columnas) return false;
    for (let x = 0; x < largo; x++) if (grafo.getNodoValue(i,j+x).valor !== '.') return false;
  } else {
    if (i + largo - 1 >= grafo.filas) return false;
    for (let x = 0; x < largo; x++) if (grafo.getNodoValue(i+x,j).valor !== '.') return false;
  }
  return true;
}

function colocarCarroEnGrafo(grafo, i, j, orientacion, largo, esCarroB = false) {
  if (orientacion === 'H') {
    for (let k = 0; k < largo-1; k++) grafo.setNodoValue(i,j+k,'-');
    grafo.setNodoValue(i,j+largo-1, esCarroB?'B':'>');
    return true;
  } else {
    for (let k = 0; k < largo-1; k++) grafo.setNodoValue(i+k,j,'|');
    grafo.setNodoValue(i+largo-1,j, esCarroB?'B':'v');
    return true;
  }
}

function generarCarrosAleatorios(grafo, numeroDeCarros) {
  // Limpiar tablero
  const filas = grafo.getFilas();
  const cols = grafo.getColumnas();
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < cols; j++) {
      grafo.setNodoValue(i, j, '.');
    }
  }

  const totalCarros = numeroDeCarros;
  let hayB = false;

  for (let n = 0; n < totalCarros; n++) {
    const orientacion = Math.random() < 0.5 ? 'H' : 'V';
    const longitud = Math.random() < 0.5 ? 2 : 3;

    let valor = '>';
    if (!hayB && Math.random() < 0.4) valor = 'B'; // 40% chance de ser B

    let colocado = false;
    let intentos = 0;

    while (!colocado && intentos < 100) {
      intentos++;

      const i = Math.floor(Math.random() * filas);
      const j = Math.floor(Math.random() * cols);

      //Evitar que el carro B aparezca en las esquinas 
      if (valor === 'B' && (
        (i === 0 && j === 0) || (i === 0 && j === cols - 1) ||
        (i === filas - 1 && j === 0) || (i === filas - 1 && j === cols - 1)
      )) continue;

      if (orientacion === 'H') {
        if (j + longitud - 1 >= cols) continue;

        // Verificar celdas vacías
        let libre = true;
        for (let k = 0; k < longitud; k++) {
          if (!grafo.getNodoValue(i, j + k) || grafo.getNodoValue(i, j + k).valor !== '.') {
            libre = false;
            break;
          }
        }
        if (!libre) continue;

        // Colocar carro
        for (let k = 0; k < longitud - 1; k++) grafo.setNodoValue(i, j + k, '-');
        grafo.setNodoValue(i, j + longitud - 1, valor === 'B' ? 'B' : '>');
        colocado = true;

        // Colocar salida S si es B
        if (valor === 'B') {
          let colocadoS = false;
          const lados = ['izquierda', 'derecha'];
          while (!colocadoS && lados.length > 0) {
            const lado = lados.splice(Math.floor(Math.random() * lados.length), 1)[0];
            const borde = lado === 'izquierda' ? 0 : cols - 1;
            if (grafo.getNodoValue(i, borde).valor === '.') {
              grafo.setNodoValue(i, borde, 'S');
              colocadoS = true;
            }
          }
          hayB = true;
        }

      } else { // Vertical
        if (i + longitud - 1 >= filas) continue;

        let libre = true;
        for (let k = 0; k < longitud; k++) {
          if (!grafo.getNodoValue(i + k, j) || grafo.getNodoValue(i + k, j).valor !== '.') {
            libre = false;
            break;
          }
        }
        if (!libre) continue;

        for (let k = 0; k < longitud - 1; k++) grafo.setNodoValue(i + k, j, '|');
        grafo.setNodoValue(i + longitud - 1, j, valor === 'B' ? 'B' : 'v');
        colocado = true;

        // Colocar salida S si es B
        if (valor === 'B') {
          let colocadoS = false;
          const lados = ['arriba', 'abajo'];
          while (!colocadoS && lados.length > 0) {
            const lado = lados.splice(Math.floor(Math.random() * lados.length), 1)[0];
            const borde = lado === 'arriba' ? 0 : filas - 1;
            if (grafo.getNodoValue(borde, j).valor === '.') {
              grafo.setNodoValue(borde, j, 'S');
              colocadoS = true;
            }
          }
          hayB = true;
        }
      }
    }
  }

  // Si no se colocó ningún B, forzamos que siempre haya uno
  if (!hayB) {
    const orientacion = Math.random() < 0.5 ? 'H' : 'V';
    const longitud = Math.random() < 0.5 ? 2 : 3;
    let colocado = false;
    let intentos = 0;

    while (!colocado && intentos < 200) {
      intentos++;
      const i = Math.floor(Math.random() * filas);
      const j = Math.floor(Math.random() * cols);

      // evitar que B aparezca en esquinas
      if ((i === 0 && j === 0) || (i === 0 && j === cols - 1) ||
          (i === filas - 1 && j === 0) || (i === filas - 1 && j === cols - 1)) continue;

      if (orientacion === 'H') {
        if (j + longitud - 1 >= cols) continue;
        let libre = true;
        for (let k = 0; k < longitud; k++) {
          if (!grafo.getNodoValue(i, j + k) || grafo.getNodoValue(i, j + k).valor !== '.') libre = false;
        }
        if (!libre) continue;

        for (let k = 0; k < longitud - 1; k++) grafo.setNodoValue(i, j + k, '-');
        grafo.setNodoValue(i, j + longitud - 1, 'B');

        // Colocar salida S en borde disponible
        if (grafo.getNodoValue(i, cols - 1).valor === '.') {
          grafo.setNodoValue(i, cols - 1, 'S');
        } else if (grafo.getNodoValue(i, 0).valor === '.') {
          grafo.setNodoValue(i, 0, 'S');
        }

        colocado = true;

      } else {
        if (i + longitud - 1 >= filas) 
            continue;
        let libre = true;
        for (let k = 0; k < longitud; k++) {
          if (!grafo.getNodoValue(i + k, j) || grafo.getNodoValue(i + k, j).valor !== '.') libre = false;
        }
        if (!libre) continue;

        for (let k = 0; k < longitud - 1; k++) grafo.setNodoValue(i + k, j, '|');
        grafo.setNodoValue(i + longitud - 1, j, 'B');

        // Colocar salida S en borde disponible
        if (grafo.getNodoValue(filas - 1, j).valor === '.') {
          grafo.setNodoValue(filas - 1, j, 'S');
        } else if (grafo.getNodoValue(0, j).valor === '.') {
          grafo.setNodoValue(0, j, 'S');
        }

        colocado = true;
      }
    }
  }
}



const grafo = new Grafo(6, 6);
generarCarrosAleatorios(grafo, 4);

console.log("Tablero inicial:");
imprimirMatriz(grafo);

const solucion = AEstrella(grafo);

if (!solucion) {
  console.log("No hay solución posible.");
}


