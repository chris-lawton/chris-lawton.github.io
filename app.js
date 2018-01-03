(function () {
    const searchInput = document.querySelector('.search');
    const form = document.querySelector('.search-form');
    const incorrectDiv = document.querySelector('.incorrect');
    const statesList = document.querySelector('.state-list');
    const scoreHtml = document.querySelector('.score');
    const audio = document.getElementsByTagName('audio');
    const revealAll = document.querySelector('.js-reveal-all');
    const clear = document.querySelector('.js-clear');
    const targetScore = document.querySelector('.js-target-score');
    let correctGuesses = localStorage.getItem('items') ? JSON.parse(localStorage.getItem('items')) : [];

    localStorage.setItem('items', JSON.stringify(correctGuesses));
    const data = JSON.parse(localStorage.getItem('items'));

    let currentScore = data.length;
    scoreHtml.innerHTML = currentScore;

    // fetch the json file
    fetch('./states.json').then((response) => {
        // Convert to JSON
        return response.json();
    }).then((data) => {
        window.states = data;
        targetScore.innerHTML = states.length;
        searchInput.focus();
    });

    // create li and add to ul
    const liMaker = (item, customClass = 'correct') => {
        const li = document.createElement('li');
        li.classList.add(customClass);
        li.textContent = item;
        statesList.appendChild(li);
    }

    // create list items for the items in localstorage
    data.forEach(item => {
        liMaker(item);
    });

    // Clear localStorage
    clear.addEventListener('click', () => {
        localStorage.clear();
        while (statesList.firstChild) {
            statesList.removeChild(statesList.firstChild);
        };
        scoreHtml.innerHTML = 0;
        location.reload();
    });

    // Update the score
    function updateScore(){
        currentScore ++;
        if(currentScore === states.length){
            audio[0].play();
        }
        scoreHtml.classList.add('grow');
        scoreHtml.innerHTML = currentScore;
        scoreHtml.addEventListener('transitionend', () => {
            scoreHtml.classList.remove('grow');
        })
    };

    // Update localstorage with the correct guess
    function updateStorage(guess) {
        correctGuesses.push(guess);
        localStorage.setItem('items', JSON.stringify(correctGuesses));
        const data = localStorage.getItem('items');
    }

    // Capture the submit event
    form.addEventListener('submit',(e) => {

        const guess = capitaliseString(searchInput.value);

        let match = states.find(state => state.name === guess);

        // Incorrect guess
        if (match == null) {
            incorrectDiv.classList.add('show');
            setTimeout(() => {
                incorrectDiv.classList.remove('show');
            }, 1000)
            e.preventDefault();
            searchInput.value='';
            return;
        }

        // Already guessed
        if (correctGuesses.indexOf(guess) > -1) {
            statesList.childNodes.forEach((item) => {
                if(item.innerHTML === guess) {
                    item.classList.add('is-already-visible');
                    setTimeout(() => {
                        item.classList.remove('is-already-visible');
                    }, 250);
                }
            });

            e.preventDefault();
            searchInput.value='';
            return;
        }

        // Correct
        liMaker(guess);

        updateScore();
        updateStorage(guess);
        searchInput.value='';
        e.preventDefault();
    });

    // Capitalise a string
    function capitaliseString(string, foo){
        return string.replace(/\b\w/g, l => l.toUpperCase());
    }

    // Reveal the remaining
    revealAll.addEventListener('click', function(){
        // convert remaining states to an array
        let remainingStatesArr = states.map(state => state.name);

        // remove correct items from the remaining array
        let remainingStates = remainingStatesArr.filter(compareArrays);

        function compareArrays(el){
            return correctGuesses.indexOf(el) < 0;
        }

        remainingStates.forEach(item => {
            liMaker(item, 'correct-not-guessed');
        });
    });
})();
