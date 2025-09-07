document.addEventListener('DOMContentLoaded', () => {
    // Game state variables
    let currentPlayer = 'X';
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let isComputerMode = false;
    
    // DOM elements
    const cells = document.querySelectorAll('.cell');
    const turnDisplay = document.getElementById('turn');
    const resultDisplay = document.getElementById('result');
    const resetButton = document.getElementById('reset');
    const twoPlayerModeButton = document.getElementById('two-player-mode');
    const computerModeButton = document.getElementById('computer-mode');
    const modeDescription = document.getElementById('mode-description');
    const themeToggleButton = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Winning combinations
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Initialize game
    function initGame() {
        cells.forEach(cell => {
            cell.textContent = '';
            cell.setAttribute('aria-label', 'Empty cell');
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('keydown', handleKeyDown);
        });
        
        resetButton.addEventListener('click', resetGame);
        twoPlayerModeButton.addEventListener('click', () => setGameMode(false));
        computerModeButton.addEventListener('click', () => setGameMode(true));
        themeToggleButton.addEventListener('click', toggleTheme);

        // Load theme from localStorage or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'X';
        turnDisplay.textContent = `Player ${currentPlayer}'s turn`;
        resultDisplay.textContent = '';
    }
    
    // Set game mode (two player or vs computer)
    function setGameMode(computerMode) {
        isComputerMode = computerMode;
        
        if (computerMode) {
            twoPlayerModeButton.classList.remove('active');
            twoPlayerModeButton.setAttribute('aria-pressed', 'false');
            computerModeButton.classList.add('active');
            computerModeButton.setAttribute('aria-pressed', 'true');
            modeDescription.textContent = 'Current mode: Play vs Computer';
        } else {
            computerModeButton.classList.remove('active');
            computerModeButton.setAttribute('aria-pressed', 'false');
            twoPlayerModeButton.classList.add('active');
            twoPlayerModeButton.setAttribute('aria-pressed', 'true');
            modeDescription.textContent = 'Current mode: Two Players';
        }
        
        resetGame();
    }
    
    // Handle cell click
    function handleCellClick(e) {
        const cellIndex = parseInt(e.target.getAttribute('data-index'));
        
        if (gameBoard[cellIndex] !== '' || !gameActive) return;
        
        updateCell(cellIndex);
        checkGameResult();
        
        // If game is still active and it's computer's turn
        if (gameActive && isComputerMode && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 500); // Delay for better UX
        }
    }
    
    // Handle keyboard navigation
    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.target.click();
        }
    }
    
    // Update cell with current player's mark
    function updateCell(index) {
        gameBoard[index] = currentPlayer;
        cells[index].textContent = currentPlayer;
        cells[index].setAttribute('aria-label', `Cell marked with ${currentPlayer}`);
        
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        turnDisplay.textContent = `Player ${currentPlayer}'s turn`;
    }
    
    // Computer move logic
    function makeComputerMove() {
        if (!gameActive) return;
        
        // First check if computer can win
        const winMove = findWinningMove('O');
        if (winMove !== -1) {
            updateCell(winMove);
            checkGameResult();
            return;
        }
        
        // Then check if player can win and block
        const blockMove = findWinningMove('X');
        if (blockMove !== -1) {
            updateCell(blockMove);
            checkGameResult();
            return;
        }
        
        // Take center if available
        if (gameBoard[4] === '') {
            updateCell(4);
            checkGameResult();
            return;
        }
        
        // Take any available corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => gameBoard[index] === '');
        if (availableCorners.length > 0) {
            const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
            updateCell(randomCorner);
            checkGameResult();
            return;
        }
        
        // Take any available side
        const sides = [1, 3, 5, 7];
        const availableSides = sides.filter(index => gameBoard[index] === '');
        if (availableSides.length > 0) {
            const randomSide = availableSides[Math.floor(Math.random() * availableSides.length)];
            updateCell(randomSide);
            checkGameResult();
            return;
        }
    }
    
    // Find winning move for a player
    function findWinningMove(player) {
        for (let i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i] === '') {
                // Try this move
                gameBoard[i] = player;
                
                // Check if this move would win
                const wouldWin = winningCombinations.some(combination => {
                    return combination.every(index => gameBoard[index] === player);
                });
                
                // Undo the move
                gameBoard[i] = '';
                
                if (wouldWin) {
                    return i;
                }
            }
        }
        return -1;
    }
    
    // Check for win or draw
    function checkGameResult() {
        let roundWon = false;
        
        // Check for win
        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                roundWon = true;
                break;
            }
        }
        
        if (roundWon) {
            // Previous player won (since we already switched)
            const winner = currentPlayer === 'X' ? 'O' : 'X';
            resultDisplay.textContent = `Player ${winner} wins!`;
            turnDisplay.textContent = '';
            gameActive = false;
            return;
        }
        
        // Check for draw
        if (!gameBoard.includes('')) {
            resultDisplay.textContent = "It's a draw!";
            turnDisplay.textContent = '';
            gameActive = false;
            return;
        }
    }
    
    // Reset game
    function resetGame() {
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'X';
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.setAttribute('aria-label', 'Empty cell');
        });
        
        turnDisplay.textContent = `Player ${currentPlayer}'s turn`;
        resultDisplay.textContent = '';
        
        // If computer mode is active and computer goes first (which it doesn't in this implementation)
        // you could add logic here to make the first move
    }

    // Theme toggle functions
    function toggleTheme() {
        const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            themeToggleButton.textContent = 'Switch to Light Theme';
        } else {
            body.classList.remove('dark-theme');
            themeToggleButton.textContent = 'Switch to Dark Theme';
        }
    }
    
    // Initialize the game
    initGame();
});