document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const scoreDisplay = document.querySelector('#score')
  const startBtn = document.querySelector('#start-button')
  const pauseBtn = document.querySelector('#pause-button')
  const width = 10
  const tempoDisplay = document.querySelector('#tempo');
  let linhasEliminadas = 0; // Variável para rastrear o número de linhas eliminadas
  let segundos = 0;
  let minutos = 0;
  let timerInterval; // Variável para armazenar o ID do intervalo do cronômetro
  let nextRandom = 0
  let timerId
  let score = 0
  let isPaused = false; // Variável para controlar o estado de pausa
  const colors = [
    'orange',
    'red',
    'purple',
    'green',
    'blue'
  ]

  //The Tetrominoes
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ]

  const zTetromino = [
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1],
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1]
  ]

  const tTetromino = [
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
  ]

  const oTetromino = [
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1]
  ]

  const iTetromino = [
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3],
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3]
  ]

  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

  let currentPosition = 4
  let currentRotation = 0

  console.log(theTetrominoes[0][0])

  //randomly select a Tetromino and its first rotation
  let random = Math.floor(Math.random()*theTetrominoes.length)
  let current = theTetrominoes[random][currentRotation]

  //draw the Tetromino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino')
      squares[currentPosition + index].style.backgroundColor = colors[random]
    })
  }

  //undraw the Tetromino
  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino')
      squares[currentPosition + index].style.backgroundColor = ''

    })
  }

  //assign functions to keyCodes
  function control(e) {
    if(e.keyCode === 37) {
      moveLeft()
    } else if (e.keyCode === 38) {
      rotate()
    } else if (e.keyCode === 39) {
      moveRight()
    } else if (e.keyCode === 40) {
      moveDown()
    }
  }
  document.addEventListener('keyup', control)

  //move down function
  function moveDown() {
    undraw()
    currentPosition += width
    draw()
    freeze()
  }

  //freeze function
  function freeze() {
    if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => squares[currentPosition + index].classList.add('taken'))
      //start a new tetromino falling
      random = nextRandom
      nextRandom = Math.floor(Math.random() * theTetrominoes.length)
      current = theTetrominoes[random][currentRotation]
      currentPosition = 4
      draw()
      displayShape()
      addScore()
      gameOver()
    }
  }

  //move the tetromino left, unless is at the edge or there is a blockage
  function moveLeft() {
    undraw()
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
    if(!isAtLeftEdge) currentPosition -=1
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition +=1
    }
    draw()
  }

  //move the tetromino right, unless is at the edge or there is a blockage
  function moveRight() {
    undraw()
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
    if(!isAtRightEdge) currentPosition +=1
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition -=1
    }
    draw()
  }
  
  ///FIX ROTATION OF TETROMINOS A THE EDGE 
  function isAtRight() {
    return current.some(index=> (currentPosition + index + 1) % width === 0)  
  }
  
  function isAtLeft() {
    return current.some(index=> (currentPosition + index) % width === 0)
  }
  
  function checkRotatedPosition(P){
    P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
    if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
      if (isAtRight()){            //use actual position to check if it's flipped over to right side
        currentPosition += 1    //if so, add one to wrap it back around
        checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
        }
    }
    else if (P % width > 5) {
      if (isAtLeft()){
        currentPosition -= 1
      checkRotatedPosition(P)
      }
    }
  }
  
  //rotate the tetromino
  function rotate() {
    undraw()
    currentRotation ++
    if(currentRotation === current.length) { //if the current rotation gets to 4, make it go back to 0
      currentRotation = 0
    }
    current = theTetrominoes[random][currentRotation]
    checkRotatedPosition()
    draw()
  }
  /////////
  
  //show up-next tetromino in mini-grid display
  const displaySquares = document.querySelectorAll('.mini-grid div')
  const displayWidth = 4
  const displayIndex = 0

  //the Tetrominos without rotations
  const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
    [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
    [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
    [0, 1, displayWidth, displayWidth+1], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
  ]

  //display the shape in the mini-grid display
  function displayShape() {
    //remove any trace of a tetromino form the entire grid
    displaySquares.forEach(square => {
      square.classList.remove('tetromino')
      square.style.backgroundColor = ''
    })
    upNextTetrominoes[nextRandom].forEach( index => {
      displaySquares[displayIndex + index].classList.add('tetromino')
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
    })
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      segundos++;
      if (segundos === 60) {
        segundos = 0;
        minutos++;
      }
      tempoDisplay.textContent = (minutos < 10 ? '0' : '') + minutos + ':' + (segundos < 10 ? '0' : '') + segundos;
    }, 1000); // Atualiza o cronômetro a cada 1000 ms (1 segundo)
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  // Modifique o evento de clique no botão "Start"
  startBtn.addEventListener('click', () => {
    if (!isPaused) { // Se o jogo não estiver pausado
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      if (nextRandom === 0) {
        nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      }
      startTimer(); // Inicia o cronômetro
      timerId = setInterval(moveDown, 200);
      displayShape();
    }
  });

  // Modifique o evento de clique no botão "Pause"
  pauseBtn.addEventListener('click', () => {
    if (!isPaused) { // Se o jogo não estiver pausado
      stopTimer(); // Pára o cronômetro
      clearInterval(timerId);
      timerId = null;
      isPaused = true;
      pauseBtn.innerHTML = 'Resume'; // Altera o texto do botão "Pause" para "Resume"
      // Desabilita a função de controle do teclado
      document.removeEventListener('keyup', control);
    } else { // Se o jogo estiver pausado
      timerId = setInterval(moveDown, 200); // Resume o jogo
      isPaused = false;
      pauseBtn.innerHTML = 'Pause'; // Altera o texto do botão "Pause" para "Pause"
      // Habilita a função de controle do teclado
      document.addEventListener('keyup', control);
      startTimer(); // Continua o cronômetro
    }
  });

  //add score
  function addScore() {
    for (let i = 0; i < 199; i +=width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

      if(row.every(index => squares[index].classList.contains('taken'))) {
        score +=10
        scoreDisplay.innerHTML = score
        row.forEach(index => {
          squares[index].classList.remove('taken')
          squares[index].classList.remove('tetromino')
          squares[index].style.backgroundColor = ''
        })
        const squaresRemoved = squares.splice(i, width)
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
      }
    }
  }

  //game over
  function gameOver() {
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      startBtn.disabled = true;
      pauseBtn.disabled = true;
      stopTimer(); // Pára o cronômetro
      clearInterval(timerId)
    }
  }

  function reiniciarJogo() {
    // Limpar a grade
    squares.forEach((square, index) => {
      square.classList.remove('tetromino');
      square.style.backgroundColor = '';
      // Verifique se o bloco não faz parte dos últimos 10
      if (index < squares.length - 10) {
        square.classList.remove('taken');
      }
    });
  
    // Resto das configurações de reinicialização
    currentPosition = 4;
    currentRotation = 0;
    random = Math.floor(Math.random() * theTetrominoes.length);
    current = theTetrominoes[random][currentRotation];
    draw();
  
    // Reiniciar o temporizador (ajuste o valor do intervalo conforme necessário)
    clearInterval(timerId);
    timerId = setInterval(moveDown, 200);
  
    // Limpar a tela de pontuação (se você tiver uma)
    score = 0;
    scoreDisplay.innerHTML = score;
  
    // Reiniciar o cronômetro
    segundos = 0;
    minutos = 0;
    tempoDisplay.textContent = '00:00';
  
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    isPaused = false;
    pauseBtn.innerHTML = 'Pause'; // Altera o texto do botão "Pause" para "Pause"
    document.addEventListener('keyup', control);
    linhasEliminadas = 0;
    document.getElementById('num-linhas').textContent = 'Nº linhas: ' + linhasEliminadas; // Atualiza o número de linhas no elemento HTML
  }
  
  // Adicione um ouvinte de evento ao botão de reinício
  const restartButton = document.getElementById('restart-button');
  restartButton.addEventListener('click', () => {
    reiniciarJogo();
  });
  
  // Função para adicionar score e atualizar o número de linhas
  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

      if (row.every(index => squares[index].classList.contains('taken'))) {
        score += 10;
        scoreDisplay.innerHTML = score;
        linhasEliminadas++; // Incrementa o número de linhas eliminadas
        document.getElementById('num-linhas').textContent = 'Nº linhas: ' + linhasEliminadas; // Atualiza o número de linhas no elemento HTML
        row.forEach(index => {
          squares[index].classList.remove('taken');
          squares[index].classList.remove('tetromino');
          squares[index].style.backgroundColor = '';
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach(cell => grid.appendChild(cell));
      }
    }
  }
});

//validaçao cadastrar 
document.addEventListener("DOMContentLoaded", function() {
const cadastro = document.querySelector("#cadastroForm");

cadastro.addEventListener("submit", (event) => {
    event.preventDefault();
    const nome = document.querySelector("#inputNome").value;
    const email = document.querySelector("#inputEmail").value;
    const nickName = document.querySelector("#inputNickName").value;
    const senha = document.querySelector("#inputSenha").value;
    const telefone = document.querySelector("#inputTelefone").value;
    const cpf = document.querySelector("#inputCPF").value;
    const dNasc = document.querySelector("#inputDataNascimento").value;

    if (nome === "" || email === "" || nickName === "" || senha === "" || telefone === "" || cpf === "" || dNasc === "") {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }  
    
    if (!emailValido(email.value)) {
        alert("Por favor, insira um e-mail válido.");
        return;
    }

    if (!telefoneValido(telefone.value)) {
        alert("Número de telefone inválido. Por favor, siga o formato (XX) XXXXX-XXXX.");
        return;
    }
   
  });
  
  //valiaçao editarPerfil
  const editar = document.querySelector("#editarForm");
  
  editar.addEventListener("submit", (event) => {
    event.preventDefault();
    
    const nome = document.querySelector("#inputNome").value;
    const emailCadastro = document.querySelector("#inputEmail").value;
    const nickName = document.querySelector("#inputNickName").value;
    const senha = document.querySelector("#inputSenha").value;
    const telefone = document.querySelector("#inputTelefone").value;
    
    
    if (!emailValido(emailCadastro.value)) {
      alert("Por favor, insira um e-mail válido.");
      return;
    }
    
    if (!telefoneValido(telefone.value)) {
      alert("Número de telefone inválido. Por favor, siga o formato (XX) XXXXX-XXXX.");
      return;
    }
  });
});

  //validaçao conectar
document.addEventListener("DOMContentLoaded", function() {
    const login = document.querySelector("#validaLogin");
    
    login.addEventListener("submit", (event) => {
      event.preventDefault();
    const emailLogin = document.querySelector("#inputEmailLogin");
    const senhaLogin = document.querySelector("#inputSenhaLogin");
    
    if (emailLogin.value === "" || senhaLogin.value === "") {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }
    
    if (!emailValido(emailLogin.value)) {
      alert("Por favor, insira um e-mail válido.");
      return;
    }
     
  });
});
  /*document.getElementById('cadastroForm').addEventListener("submit", function (e) {
    console.log("Evento de envio do editarForm acionado");
    if (!validarForm()) {
      e.preventDefault(); // Impede o envio do formulário se os campos não estiverem preenchidos ou o número de telefone for inválido
    }
  });*/
  
  document.getElementById('cadastroForm').addEventListener('submit', function (e) {
    var cpf = document.getElementById('inputCPF').value;
    if (!validarCPF(cpf)) {
      e.preventDefault(); // Impede o envio do formulário se o CPF for inválido
    }
  });
  
  /*document.getElementById('validaLogin').addEventListener('submit', function (e) {
    //console.log("Evento de envio do validaLogin acionado");
    if (!validarLogin()) {
      e.preventDefault(); // Impede o envio do formulário se os campos não estiverem preenchidos
    }
  });*/
  
  function emailValido(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/;
    
    if (emailRegex.test(email)) {
      return true;
    }
    
    return false;
  }
  
  function telefoneValido(telefone) {
    const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    
    if (telefoneRegex.test(telefone)) {
      return true;
    }
    
    return false;
  }
  
  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length === 1 && cpf.length !== 11) {
      alert('O CPF deve conter 11 dígitos.');
      return false;
    }
    
    return true;
  }
  