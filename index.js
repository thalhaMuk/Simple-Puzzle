const container = document.getElementById('puzzleContainer');
const puzzleSizeInput = document.getElementById('puzzleSize');
const imageInput = document.getElementById('imageInput');
const puzzleArea = document.getElementById('puzzleArea');
const referenceImageArea = document.getElementById('ReferenceImageArea');
const message = document.getElementById('message');
const completedMessage = document.getElementById('completedMessage')
const correctMoves = document.getElementById('correctMoves');
const incorrectMoves = document.getElementById('incorrectMoves');

const dataFormat = 'text/plain';
const puzzlePieceElement = 'puzzlePiece';
const puzzlePieceSelector = `.${puzzlePieceElement}`;

let puzzleSize = 3; // Default puzzle size
let correctMovesCount;
let incorrectMovesCount;

function createPuzzle() {
    correctMovesCount = 0;
    incorrectMovesCount = 0;
    puzzleArea.textContent = '';
    referenceImageArea.textContent = '';
    correctMoves.textContent = '';
    incorrectMoves.textContent = '';

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
    const MaxPercentage = '100%';
    const sizeUnit = 'px';
    
    const image = new Image();
    image.src = imageURL;
    image.style.maxWidth = MaxPercentage;
    image.style.maxHeight = MaxPercentage;
    image.onload = function () {
        if (image.width > 640) {
            const aspectRatio = image.height / image.width;
            const newWidth = 640;
            const newHeight = newWidth * aspectRatio;
            image.width = newWidth;
            image.height = newHeight;
        }
        const pieceWidth = image.width / size;
        const pieceHeight = image.height / size;
        const puzzleAreaHeight = (pieceHeight * size) + size * 5
        const puzzleAreaWidth = (pieceWidth * size) + size * 5
        puzzleArea.style.width = `${puzzleAreaWidth}${sizeUnit}`;
        puzzleArea.style.height = `${puzzleAreaHeight}${sizeUnit}`
        const orderValues = [...Array(size * size).keys()];
        shuffleArray(orderValues);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const piece = document.createElement('div');
                piece.className = puzzlePieceElement;
                piece.style.backgroundImage = `url(${imageURL})`;
                piece.style.width = `${pieceWidth}${sizeUnit}`;
                piece.style.height = `${pieceHeight}${sizeUnit}`;
                piece.style.maxWidth = MaxPercentage;
                piece.style.maxHeight = MaxPercentage;
                piece.style.backgroundPosition = `-${j * pieceWidth}${sizeUnit} -${i * pieceHeight}${sizeUnit}`;
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
    event.dataTransfer.setData(dataFormat, event.target.id);
}

function onDragOver(event) {
    event.preventDefault();
}

function onDrop(event) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData(dataFormat);
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
    correctMoves.textContent = `Correct Moves: ${correctMovesCount}`;
    incorrectMoves.textContent = `Incorrect Moves: ${incorrectMovesCount}`;
}

function getDroppedPiece(x, y) {
    const elementsUnderTouch = document.elementsFromPoint(x, y);

    for (const element of elementsUnderTouch) {
        if (element.classList.contains(puzzlePieceElement)) {
            return element;
        }
    }

    return null;
}
function checkPuzzleCompletion() {
    const puzzlePieces = document.querySelectorAll(puzzlePieceSelector);
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