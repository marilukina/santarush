class SantasResourceRush {
    constructor() {
        this.gridSize = 8;
        this.currentLevel = 1;
        this.maxLevels = 10;
        this.lives = 3;
        this.moves = 20;
        this.collectedResources = 0;
        this.requiredResources = 3;
        this.playerPosition = { x: 0, y: 0 };
        this.targetPosition = { x: 7, y: 7 };
        this.grid = [];
        this.penaltyCells = new Set();
        this.resourceCells = new Set();
        this.isProcessingMove = false;
        
        // Get DOM elements
        this.gameContainer = document.querySelector('.game-container');
        this.gridContainer = document.querySelector('.grid-container');
        this.levelText = document.querySelector('.level-text');
        this.levelProgress = document.querySelector('.level-progress');
        this.livesDisplay = document.querySelector('.lives');
        this.movesDisplay = document.querySelector('.moves');
        this.giftsDisplay = document.querySelector('.gifts');
        this.popup = document.querySelector('.popup');
        
        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleGridClick = this.handleGridClick.bind(this);
        
        this.initializeGame();
    }

    initializeGame() {
        this.createGrid();
        this.setupLevel();
        this.setupEventListeners();
        this.updateHUD();
    }

    createGrid() {
        this.gridContainer.innerHTML = '';
        this.grid = [];

        const table = document.createElement('table');
        table.className = 'game-grid';
        table.addEventListener('click', this.handleGridClick);

        for (let y = 0; y < this.gridSize; y++) {
            const row = document.createElement('tr');
            this.grid[y] = [];
            
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('td');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Add hover handlers
                cell.addEventListener('mouseenter', () => {
                    if (this.isValidMove(x, y)) {
                        cell.classList.add('valid-move-hover');
                    }
                });

                cell.addEventListener('mouseleave', () => {
                    cell.classList.remove('valid-move-hover');
                });

                this.grid[y][x] = cell;
                row.appendChild(cell);
            }
            
            table.appendChild(row);
        }

        this.gridContainer.appendChild(table);
    }

    setupEventListeners() {
        // Remove any existing listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Add keyboard controls to document level
        document.addEventListener('keydown', this.handleKeyDown);

        // Ensure game container stays focused
        this.gameContainer.addEventListener('click', () => {
            this.gameContainer.focus();
        });

        // Prevent focus loss
        document.addEventListener('click', (e) => {
            if (!this.gameContainer.contains(e.target)) {
                this.gameContainer.focus();
            }
        });
    }

    handleGridClick(e) {
        const cell = e.target.closest('.cell');
        if (!cell || this.isProcessingMove) return;

        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);

        console.log(`Cell clicked: x=${x}, y=${y}`);
        if (this.isValidMove(x, y)) {
            console.log('Valid move detected');
            this.movePlayer(x, y);
        }
    }

    handleKeyDown(e) {
        if (this.isProcessingMove) return;

        let newX = this.playerPosition.x;
        let newY = this.playerPosition.y;
        let handled = true;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                newY--;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                newY++;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                newX--;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                newX++;
                break;
            default:
                handled = false;
        }

        if (handled) {
            e.preventDefault();
            console.log(`Key pressed: ${e.key}, New position: x=${newX}, y=${newY}`);
            if (this.isValidMove(newX, newY)) {
                console.log('Valid keyboard move detected');
                this.movePlayer(newX, newY);
            }
        }
    }

    setupLevel() {
        this.penaltyCells.clear();
        this.resourceCells.clear();
        this.collectedResources = 0;
        this.isProcessingMove = false;
        
        this.moves = 20 + (this.currentLevel * 2);
        this.requiredResources = Math.min(3 + Math.floor(this.currentLevel / 2), 8);

        this.playerPosition = { x: 0, y: 0 };
        this.targetPosition = { x: this.gridSize - 1, y: this.gridSize - 1 };

        const penaltyCellCount = Math.min(this.currentLevel + 1, 10);
        const resourceCount = this.requiredResources + Math.floor(this.currentLevel / 2);

        this.addRandomCells(penaltyCellCount, 'penalty');
        this.addRandomCells(resourceCount, 'resource');

        this.updateGridDisplay();
        this.gameContainer.focus();
    }

    addRandomCells(count, type) {
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.gridSize);
                y = Math.floor(Math.random() * this.gridSize);
            } while (
                (x === this.playerPosition.x && y === this.playerPosition.y) ||
                (x === this.targetPosition.x && y === this.targetPosition.y) ||
                this.penaltyCells.has(`${x},${y}`) ||
                this.resourceCells.has(`${x},${y}`)
            );

            const key = `${x},${y}`;
            if (type === 'penalty') {
                this.penaltyCells.add(key);
            } else {
                this.resourceCells.add(key);
            }
        }
    }

    updateGridDisplay() {
        // Clear all special cell classes
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = this.grid[y][x];
                cell.className = 'cell';
                cell.textContent = '';
                
                if (this.isValidMove(x, y)) {
                    cell.classList.add('valid-move');
                }
            }
        }

        // Mark player position
        const playerCell = this.grid[this.playerPosition.y][this.playerPosition.x];
        playerCell.classList.add('player');
        playerCell.textContent = '🎅';

        // Mark target position
        const targetCell = this.grid[this.targetPosition.y][this.targetPosition.x];
        targetCell.classList.add('target');
        targetCell.textContent = '🛷';

        // Mark penalty cells
        this.penaltyCells.forEach(pos => {
            const [x, y] = pos.split(',').map(Number);
            const cell = this.grid[y][x];
            cell.classList.add('penalty');
            cell.textContent = '❄️';
        });

        // Mark resource cells
        this.resourceCells.forEach(pos => {
            const [x, y] = pos.split(',').map(Number);
            const cell = this.grid[y][x];
            cell.textContent = '🎁';
        });

        this.updateHUD();
    }

    updateHUD() {
        this.levelText.textContent = `Level ${this.currentLevel} of ${this.maxLevels}`;
        this.livesDisplay.textContent = `❤️ x${this.lives}`;
        this.movesDisplay.textContent = `⏳ Moves: ${this.moves}`;
        this.giftsDisplay.textContent = `🎁 Collected: ${this.collectedResources}/${this.requiredResources}`;
        
        let progress = ''.padStart(this.currentLevel, '🔵').padEnd(this.maxLevels, '⚪');
        this.levelProgress.textContent = progress;
    }

    isValidMove(x, y) {
        if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
            return false;
        }

        const dx = Math.abs(x - this.playerPosition.x);
        const dy = Math.abs(y - this.playerPosition.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    async movePlayer(x, y) {
        if (this.moves <= 0 || this.isProcessingMove) return;

        console.log(`Moving player to: x=${x}, y=${y}`);
        this.isProcessingMove = true;
        this.playerPosition = { x, y };
        this.moves--;

        // Check for penalty cell
        if (this.penaltyCells.has(`${x},${y}`)) {
            this.moves = Math.max(0, this.moves - 1);
            await this.showPopup('Oops!', 'You hit an icy patch! Lost an extra move! ❄️');
        }

        // Check for resource collection
        const posKey = `${x},${y}`;
        if (this.resourceCells.has(posKey)) {
            this.collectedResources++;
            this.resourceCells.delete(posKey);
            console.log(`Collected resource. Total: ${this.collectedResources}/${this.requiredResources}`);
        }

        this.updateGridDisplay();

        // Check for target reached
        if (x === this.targetPosition.x && y === this.targetPosition.y) {
            await this.checkLevelCompletion();
        }

        // Check for game over
        if (this.moves <= 0) {
            await this.handleGameOver();
        }

        this.isProcessingMove = false;
        this.gameContainer.focus();
    }

    async checkLevelCompletion() {
        if (this.collectedResources >= this.requiredResources) {
            if (this.currentLevel === this.maxLevels) {
                await this.showVictoryPopup();
            } else {
                this.currentLevel++;
                await this.showLevelCompletePopup();
            }
        }
    }

    async handleGameOver() {
        this.lives--;
        if (this.lives <= 0) {
            await this.showGameOverPopup();
        } else {
            await this.showRetryPopup();
        }
    }

    showPopup(title, message, buttonText = 'OK') {
        return new Promise(resolve => {
            const popupTitle = this.popup.querySelector('.popup-title');
            const popupMessage = this.popup.querySelector('.popup-message');
            const popupButton = this.popup.querySelector('.popup-button');

            popupTitle.textContent = title;
            popupMessage.textContent = message;
            popupButton.textContent = buttonText;

            const handlePopupClose = () => {
                this.popup.style.display = 'none';
                popupButton.removeEventListener('click', handlePopupClose);
                this.gameContainer.focus();
                resolve();
            };

            popupButton.addEventListener('click', handlePopupClose);
            this.popup.style.display = 'flex';
            popupButton.focus();
        });
    }

    async showLevelCompletePopup() {
        await this.showPopup(
            '🎉 Level Complete!',
            `Great job! Ready for Level ${this.currentLevel}?`,
            'Next Level'
        );
        this.setupLevel();
    }

    async showVictoryPopup() {
        await this.showPopup(
            '🎄 Congratulations!',
            'You saved Christmas! Share your achievement with friends! 🎅🎁⭐',
            'Share'
        );
        alert('Thanks for playing Santa\'s Resource Rush! 🎄');
    }

    async showRetryPopup() {
        await this.showPopup(
            '❄️ Out of Moves!',
            `${this.lives} lives remaining. Try again!`,
            'Retry Level'
        );
        this.moves = 20 + (this.currentLevel * 2);
        this.setupLevel();
    }

    async showGameOverPopup() {
        await this.showPopup(
            '💔 Game Over',
            'No more lives! Starting over from Level 1',
            'Start Over'
        );
        this.currentLevel = 1;
        this.lives = 3;
        this.setupLevel();
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    console.log('Starting Santa\'s Resource Rush...');
    const game = new SantasResourceRush();
    
    // Ensure game container is focused after a short delay
    setTimeout(() => {
        game.gameContainer.focus();
    }, 100);
});