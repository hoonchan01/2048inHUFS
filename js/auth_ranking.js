// js/auth_ranking.js (classic script using compat UMD firebase)


var authSection = document.getElementById('auth-section');
var gameSection = document.getElementById('game-section');
var welcomeMessage = document.getElementById('welcome-message');
var rankingBody = document.getElementById('ranking-body');


var allRankedUsers = []; 
var currentPage = 1;      
var itemsPerPage = 50;    
var totalPages = 1;       



function displayMessage(elementId, message, isError = false) {
    var displayElement = document.getElementById(elementId);
    if (displayElement) {
        displayElement.textContent = message;
        displayElement.style.color = isError ? 'red' : 'green';
    }
}


function renderRankingPage() {
    rankingBody.innerHTML = '';
    var start = (currentPage - 1) * itemsPerPage;
    var end = start + itemsPerPage;
    var usersOnPage = allRankedUsers.slice(start, end);

    if (usersOnPage.length === 0 && allRankedUsers.length > 0) {
        rankingBody.innerHTML = '<tr><td colspan="3">데이터를 불러오는 중...</td></tr>';
        return;
    }
    
    if (allRankedUsers.length === 0) {
        rankingBody.innerHTML = '<tr><td colspan="3">랭킹 데이터가 없습니다.</td></tr>';
        return;
    }

    var baseRank = start + 1;
    usersOnPage.forEach(function (data, index) {
        var row = '<tr><td>' + (baseRank + index) + '</td><td>' + (data.nickname || '') + '</td><td>' + (data.bestScore || 0) + '</td></tr>';
        rankingBody.insertAdjacentHTML('beforeend', row);
    });

  
    var pageDisplay = document.getElementById('page-display');
    var prevButton = document.getElementById('prev-page-button');
    var nextButton = document.getElementById('next-page-button');
    
    if (pageDisplay) pageDisplay.textContent = currentPage + ' / ' + totalPages;
    if (prevButton) prevButton.disabled = currentPage === 1;
    if (nextButton) nextButton.disabled = currentPage === totalPages;
}


function setupPaginationControls() {

    if (document.getElementById('pagination-controls')) {
        return;
    }
    
 
    var rankingTable = rankingBody.closest('table');
    if (!rankingTable) return;
    
    var controlsHtml = `
        <div id="pagination-controls" class="flex justify-center items-center p-4 space-x-4">
            <button id="prev-page-button" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded shadow" disabled>
                이전
            </button>
            <span id="page-display" class="text-lg font-semibold">1 / 1</span>
            <button id="next-page-button" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded shadow" disabled>
                다음
            </button>
        </div>
    `;
    
    rankingTable.insertAdjacentHTML('afterend', controlsHtml);
    

    document.getElementById('prev-page-button').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderRankingPage();
        }
    });

    document.getElementById('next-page-button').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            renderRankingPage();
        }
    });
}



function setupRankingListener() {
    rankingBody.innerHTML = '<tr><td colspan="3">랭킹 로딩 중...</td></tr>';
    
 
    firebase.firestore().collection('users')
        .orderBy('bestScore', 'desc')
        .limit(5000) 
        .onSnapshot(function (querySnapshot) {
            allRankedUsers = [];
            querySnapshot.forEach(function (doc) {

                allRankedUsers.push(doc.data());
            });

 
            totalPages = Math.ceil(allRankedUsers.length / itemsPerPage);
            
        
            setupPaginationControls(); 
            
            
            if (currentPage > totalPages) {
                currentPage = totalPages > 0 ? totalPages : 1;
            }

          
            renderRankingPage();

        }, function (error) {
            console.error('랭킹 실시간 로딩 실패:', error);
            rankingBody.innerHTML = '<tr><td colspan="3">랭킹 정보를 불러올 수 없습니다.</td></tr>';
        });
}


document.getElementById('signup-button').addEventListener('click', function () {
    var email = document.getElementById('signup-email').value;
    var password = document.getElementById('signup-password').value;
    var nickname = document.getElementById('signup-nickname').value;
    var errorDisplay = document.getElementById('signup-error');
    errorDisplay.textContent = '';

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function (userCredential) {
        var user = userCredential.user;
        user.updateProfile({ displayName: nickname }).catch(function(e){console.warn(e);});
        firebase.firestore().collection('users').doc(user.uid).set({
            nickname: nickname,
            bestScore: 0,
            email: email
        }).then(function(){
            displayMessage('signup-error', '회원가입 성공! 이제 로그인해주세요.', false);
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
            document.getElementById('signup-nickname').value = '';
            setTimeout(function(){ document.getElementById('show-login').click(); }, 1000);
        }).catch(function(err){
            displayMessage('signup-error', '회원가입 처리 중 오류가 발생했습니다.', true);
            console.error(err);
        });
    })
    .catch(function (error) {
        var errorMessage = '회원가입 실패: ';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage += '이미 사용 중인 이메일입니다.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage += '비밀번호는 6자 이상이어야 합니다.';
        } else {
            errorMessage += error.message;
        }
        displayMessage('signup-error', errorMessage, true);
    });
});


document.getElementById('login-button').addEventListener('click', function () {
    var email = document.getElementById('login-email').value;
    var password = document.getElementById('login-password').value;
    var errorDisplay = document.getElementById('login-error');
    errorDisplay.textContent = '';

    firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(function (error) {
        var errorMessage = '로그인 실패: ';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            errorMessage += '이메일 또는 비밀번호를 다시 확인해주세요.';
        } else {
            errorMessage += error.message;
        }
        displayMessage('login-error', errorMessage, true);
    });
});


document.getElementById('logout-button').addEventListener('click', function () {
    firebase.auth().signOut().catch(function (error) { console.error('로그아웃 실패:', error); });
});



firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        authSection.style.display = 'none';
        gameSection.style.display = 'block';
        var nickname = user.displayName || (user.email || '').split('@')[0];
        welcomeMessage.textContent = nickname + '님 환영합니다!';
 
        if (typeof start2048GameWithFirebaseScore === 'function') {
 
             if (typeof start2048Game === 'function') {
  
                 start2048Game(); 
             }
        } else if (typeof start2048Game === 'function') {
            start2048Game();
        }

    } else {
        authSection.style.display = 'block';
        gameSection.style.display = 'none';
        welcomeMessage.textContent = '';
        

    }
});


document.getElementById('show-signup').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-form').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('signup-error').textContent = '';
    document.getElementById('login-form').style.display = 'block';
});


setupRankingListener();