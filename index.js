let container = document.getElementById('puzzleContainer');
let puzzleSizeInput = document.getElementById('puzzleSize');
let imageInput = document.getElementById('imageInput');
let puzzleArea = document.getElementById('puzzleArea');
let referenceImageArea = document.getElementById('ReferenceImageArea');
let message = document.getElementById('message');
let completedMessage = document.getElementById('completedMessage')
let puzzleSize = 3; // Default puzzle size
let correctMovesCount;
let incorrectMovesCount;

function createPuzzle() {
    correctMovesCount = 0;
    incorrectMovesCount = 0;
    puzzleArea.textContent = '';
    referenceImageArea.textContent = '';

    const inputImage = imageInput.files[0];
    if (!inputImage) {
        alert('Please select an image.');
        return;
    }

    if (puzzleSizeInput.value.trim() !== '') {
        puzzleSize = parseInt(puzzleSizeInput.value);
    }

    if (puzzleSize < 2 || puzzleSize > 14) {
        alert('Puzzle size must be at least 2x2 and max 14x14.');
        return;
    }

    const imageURL = URL.createObjectURL(inputImage);
    referenceImageArea.innerHTML = `<img src="${imageURL}" alt="Reference Image" style="max-width: 100%; max-height: 100%;">`;

    const pieces = createPuzzlePieces(puzzleSize, imageURL);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createPuzzlePieces(size, imageURL) {
    const pieces = [];

    const image = new Image();
    image.src = imageURL;
    image.style.maxWidth = '100%';
    image.style.maxHeight = '100%';
    image.onload = function () {
        
        let pieceWidth = image.width / size;
        let pieceHeight = image.height / size;
        const puzzleAreaHeight = (pieceHeight * size) + size * 5
        const puzzleAreaWidth = (pieceWidth * size) + size * 5
        puzzleArea.style.width = `${puzzleAreaWidth}px`;
        puzzleArea.style.height = `${puzzleAreaHeight}px`
        const orderValues = [...Array(size * size).keys()];
        shuffleArray(orderValues);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const piece = document.createElement('div');
                piece.className = 'puzzlePiece';
                piece.style.backgroundImage = `url(${imageURL})`;
                piece.style.width = `${pieceWidth}px`;
                piece.style.height = `${pieceHeight}px`;
                piece.style.maxWidth = "100%"
                piece.style.maxHeight = "100%"
                piece.style.backgroundPosition = `-${j * pieceWidth}px -${i * pieceHeight}px`;
                piece.id = `piece_${i}_${j}`;
                piece.style.order = orderValues[i * size + j];
                piece.draggable = true;
                piece.addEventListener('dragstart', onDragStart);
                piece.addEventListener('dragover', onDragOver);
                piece.addEventListener('drop', onDrop);
                piece.addEventListener('dragend', checkPuzzleCompletion);
                // piece.addEventListener('touchstart', onTouchStart);
                // piece.addEventListener('touchmove', onTouchMove);
                // piece.addEventListener('touchend', onTouchEnd);
                pieces.push(piece);
                puzzleArea.appendChild(piece);
            }
        }
    };
    return pieces;
}

function onTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function onTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
}

function onTouchEnd(event) {
    const sourcePiece = event.target;
    const targetPiece = getDroppedPiece(touchEndX, touchEndY);
    checkMove(sourcePiece.id, targetPiece)
    checkPuzzleCompletion()
}

function onDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
}

function onDragOver(event) {
    event.preventDefault();
}

function onDrop(event) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain');
    const targetPiece = event.target;
    checkMove(sourceId, targetPiece)
}

function checkMove(sourceId, targetPiece) {
    const sourcePiece = document.getElementById(sourceId);
    const puzzlePieces = document.querySelectorAll('.puzzlePiece');
    const [sourceI, sourceJ] = sourceId.split('_').slice(1).map(Number);

    if (targetPiece.id && parseInt(targetPiece.style.order) !== sourceI * puzzleSize + sourceJ) {
        incorrectMovesCount++;
    }
    else {
        if (sourcePiece && targetPiece) {
            const sourceOrder = sourcePiece.style.order;
            sourcePiece.style.order = targetPiece.style.order;
            targetPiece.style.order = sourceOrder;
            correctMovesCount++;
        }
    }
    updateMoveCounts();
}

function updateMoveCounts() {
    document.getElementById('correctMoves').textContent = `Correct Moves: ${correctMovesCount}`;
    document.getElementById('incorrectMoves').textContent = `Incorrect Moves: ${incorrectMovesCount}`;
}

function getDroppedPiece(x, y) {
    const elementsUnderTouch = document.elementsFromPoint(x, y);

    for (const element of elementsUnderTouch) {
        if (element.classList.contains('puzzlePiece')) {
            return element;
        }
    }

    return null;
}
function checkPuzzleCompletion() {
    const puzzlePieces = document.querySelectorAll('.puzzlePiece');
    let isCompleted = true;

    puzzlePieces.forEach(piece => {
        const [i, j] = piece.id.split('_').slice(1).map(Number);
        const expectedOrder = i * puzzleSize + j;

        if (parseInt(piece.style.order) !== expectedOrder) {
            isCompleted = false;
        }
    });

    if (isCompleted) {
        setTimeout(() => {
            alert("Congratulations! Puzzle completed!")
        }, "100");
    }
}