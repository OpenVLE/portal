document.addEventListener('DOMContentLoaded', function() {
    const cardContainer = document.getElementById('overviewCards');
    const placeholder = document.createElement('div');
    let draggedCardHeight = 0;
    let draggedCardWidth = 0;
    let draggedCard;

    placeholder.classList.add('overviewCard', 'placeholder', 'bg-blue-100', 'dark:bg-blue-900', 'border-2', 'border-dashed', 'border-blue-400', 'dark:border-blue-600', 'rounded-2xl', 'min-h-[100px]', 'transition-all', 'duration-150');
    placeholder.style.marginBottom = '0.5rem';
    placeholder.style.height = '120px';

    function dragStart(event) {
        draggedCard = this;
        draggedCardHeight = this.offsetHeight;
        draggedCardWidth = this.offsetWidth;

        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', '');
        this.classList.add('opacity-50');

        setTimeout(() => {
            this.style.display = 'none';
        }, 0);
    }

    function dragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (this === draggedCard) return;

        if (draggedCard) {
            placeholder.style.height = `${draggedCardHeight}px`;
            placeholder.style.width = `${draggedCardWidth}px`;
        }

        const rect = this.getBoundingClientRect();
        const offset = event.clientY - rect.top;

        if (offset < rect.height / 2) {
            if (this.previousSibling !== placeholder) {
                cardContainer.insertBefore(placeholder, this);
            }
        } else {
            if (this.nextSibling !== placeholder) {
                cardContainer.insertBefore(placeholder, this.nextSibling);
            }
        }
    }


    function droppedTheBall(event) { // droppedTheBall is js drop but i renamed it cos funni
        event.stopPropagation();

        if (placeholder.parentNode === cardContainer) {
            cardContainer.insertBefore(draggedCard, placeholder);
            placeholder.remove();
        }

        draggedCard.classList.remove('opacity-50');
        draggedCard.style.display = '';
        draggedCard = undefined;
        return false;
    }

    function dragEnd(event) {
        if (placeholder.parentNode) placeholder.remove();

        if (draggedCard) {
            draggedCard.classList.remove('opacity-50');
            draggedCard.style.display = '';
        }

        draggedCard = undefined;
    }

    function addEventHandlers(cards) {
        cards.forEach(card => {
            card.addEventListener('dragstart', dragStart, false);
            card.addEventListener('dragover', dragOver, false);
            card.addEventListener('drop', droppedTheBall, false);
            card.addEventListener('dragend', dragEnd, false);
        });
    }

    addEventHandlers(cardContainer.querySelectorAll('.overviewCard'));

    cardContainer.addEventListener('dragover', function(event) {
        event.preventDefault();

        if (!placeholder.parentNode) {
            cardContainer.appendChild(placeholder);
        }
    });
    
    cardContainer.addEventListener('drop', function(event) {
        event.preventDefault();

        if (draggedCard && placeholder.parentNode === cardContainer) {
            cardContainer.insertBefore(draggedCard, placeholder);
            placeholder.remove();
            draggedCard.classList.remove('opacity-50');
            draggedCard.style.display = '';
            draggedCard = undefined;
        }
    });
});