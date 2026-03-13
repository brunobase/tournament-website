/**
 * main.js - FA 등록 및 명단 관리 로직
 */

// 1. 상태 변수 설정
let addedPlayers = [];
let allPlayers = []; 
let currentAppliedScore = 0;
let currentUser = null;
let isAlreadyRegistered = false;

// 2. 초기화 함수
document.addEventListener('DOMContentLoaded', async () => {
    console.log("페이지 로드 완료");

    // supabaseClient가 config.js에서 정상적으로 로드되었다고 가정합니다.
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        await fetchMyInfo();
        await fetchPlayers();
        initInputs();
        initSearchBar();
    } else {
        alert("로그인이 필요합니다.");
        window.location.href = './login.html';
    }

    const submitBtn = document.getElementById('btnSubmit');
    if (submitBtn) submitBtn.addEventListener('click', handleRegistration);
    
    const addPlayerBtn = document.getElementById('btnAddPlayer');
    if (addPlayerBtn) addPlayerBtn.addEventListener('click', addPlayer);
});

// 3. FA 등록 처리 함수
async function handleRegistration() {
    if (isAlreadyRegistered) {
        alert("이미 등록된 정보가 있습니다.");
        return;
    }

    const nicknameEl = document.getElementById('userName');
    const posEl = document.querySelector('input[name="pos"]:checked');
    const memoEl = document.getElementById('memo');
    const inviteEl = document.getElementById('inviteAllowed');

    const nickname = nicknameEl ? nicknameEl.value.trim() : "";
    const memo = memoEl ? memoEl.value : "";
    const inviteAllowed = inviteEl ? inviteEl.checked : true;

    if (!nickname) return alert("이름을 입력해주세요.");
    if (addedPlayers.length === 0) return alert("Riot ID를 추가해주세요.");
    if (!posEl) return alert("포지션을 선택해주세요.");
    if (currentAppliedScore === 0) return alert("점수 계산 후 '점수 적용하기'를 눌러주세요.");

    try {
        const { error } = await supabaseClient.from('summoner').upsert([{
            id: currentUser.id,
            nickname: nickname,
            player_ids: addedPlayers,
            position: posEl.value,
            score: currentAppliedScore,
            team_name: 'FA',
            memo: memo,
            is_invite_allowed: inviteAllowed
        }]);

        if (error) throw error;
        
        alert("정상적으로 등록되었습니다!");
        window.location.reload();
    } catch (err) {
        console.error("등록 에러:", err);
        alert("등록 중 오류 발생: " + err.message);
    }
}

// 4. 플레이어 관리 함수 (추가 및 삭제)
function addPlayer() {
    const input = document.getElementById('riotIdInput');
    if (!input) return;
    const val = input.value.trim();
    if (val && val.includes('#')) {
        if (!addedPlayers.includes(val)) {
            addedPlayers.push(val);
            updatePlayerTags();
            input.value = '';
        } else { alert("이미 추가된 ID입니다."); }
    } else { alert("Riot ID(Name#Tag) 형식으로 입력해주세요."); }
}

function updatePlayerTags() {
    const box = document.getElementById('playerTagBox');
    if (!box) return;

    if (addedPlayers.length === 0) {
        box.innerHTML = `<p style="color:#999; font-size:12px;">입력된 플레이어명이 없습니다.</p>`;
        return;
    }

    box.innerHTML = addedPlayers.map((p, i) => `
        <span class="player-tag" style="display:inline-block; background:#4A89FF; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px; margin:2px;">
            ${p} 
            <i class="fa-solid fa-xmark" style="cursor:pointer; margin-left:5px;" onclick="removePlayer(${i})"></i>
        </span>
    `).join('');
}

function removePlayer(i) {
    addedPlayers.splice(i, 1);
    updatePlayerTags();
}

// 5. 점수 및 모달 관련
function openScoreModal() {
    if (addedPlayers.length === 0) return alert("플레이어를 먼저 추가해주세요.");
    const modalName = document.getElementById('modalSummonerName');
    if(modalName) modalName.innerText = addedPlayers[0].split('#')[0];
    
    const scoreDisplay = document.getElementById('finalTotalScore');
    if(scoreDisplay) scoreDisplay.innerText = "665점"; 
    
    const modal = document.getElementById('scoreModal');
    if(modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('scoreModal');
    if(modal) modal.style.display = 'none';
}

function applyScore() {
    const scoreDisplay = document.getElementById('finalTotalScore');
    if (!scoreDisplay) return;
    
    const scoreText = scoreDisplay.innerText;
    currentAppliedScore = parseInt(scoreText.replace(/[^0-9]/g, "")) || 0;
    
    const descArea = document.querySelector('.calc-desc');
    if (descArea) {
        descArea.innerHTML = `산정 점수: <b style="color:#4A89FF;">${currentAppliedScore}점</b> (적용 완료)`;
    }
    closeModal();
}

// 6. 명단 조회 및 렌더링
async function fetchMyInfo() {
    const { data } = await supabaseClient.from('summoner').select('*').eq('id', currentUser.id).maybeSingle();
    const display = document.getElementById('myInfoDisplay');
    const submitBtn = document.getElementById('btnSubmit');

    if (data) {
        isAlreadyRegistered = true;
        if (submitBtn) {
            submitBtn.innerText = "등록 완료됨";
            submitBtn.style.background = "#ccc";
            submitBtn.style.cursor = "not-allowed";
        }
        
        if (display) {
            display.innerHTML = `
                <div class="player-card registered-mine" style="padding:15px; border:2px solid #4A89FF; border-radius:10px; background:#fff;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <span style="font-size:12px; color:#4A89FF; font-weight:bold;">내 등록 정보</span>
                            <h3 style="margin:5px 0;">${data.nickname} <small style="font-weight:normal; font-size:12px; color:#666;">(${data.position})</small></h3>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:18px; font-weight:bold; color:#4A89FF;">${data.score}점</div>
                        </div>
                    </div>
                </div>`;
        }
    }
}

async function fetchPlayers() {
    const { data, error } = await supabaseClient.from('summoner').select('*').order('created_at', { ascending: false });
    if (error) return;
    allPlayers = data;
    renderPlayerList(allPlayers);
}

function renderPlayerList(players) {
    const listArea = document.getElementById('playerList');
    if (!listArea) return;
    if (players.length === 0) {
        listArea.innerHTML = '<div class="no-data">등록된 소환사가 없습니다.</div>';
        return;
    }
    listArea.innerHTML = players.map((p, idx) => `
        <div class="player-card" onclick="openDetailModal(${idx})" style="display:flex; align-items:center; padding:15px; background:white; border-bottom:1px solid #eee; cursor:pointer;">
            <div class="pos-icon" style="width:40px;">
                <img src="/image/${p.position}.svg" width="24" onerror="this.src='https://via.placeholder.com/24'">
            </div>
            <div class="info" style="flex:1; margin-left:10px;">
                <div style="font-weight:bold; font-size:15px;">${p.nickname}</div>
                <div style="font-size:12px; color:#999;">${p.player_ids[0]}</div>
            </div>
            <div class="score" style="font-size:18px; font-weight:800; color:#4A89FF;">${p.score}점</div>
        </div>
    `).join('');
}

function openDetailModal(index) {
    const p = allPlayers[index];
    const detailModal = document.getElementById('detailModal');
    if (detailModal) {
        const content = document.getElementById('detailContent');
        content.innerHTML = `<h3>${p.nickname}</h3><p>포지션: ${p.position}</p><p>점수: ${p.score}</p><p>메모: ${p.memo || '없음'}</p>`;
        detailModal.style.display = 'flex';
    }
}

function closeDetailModal() {
    const detailModal = document.getElementById('detailModal');
    if (detailModal) detailModal.style.display = 'none';
}

function initInputs() { console.log("입력창 초기화"); }

function initSearchBar() {
    const searchInput = document.getElementById('streamerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = allPlayers.filter(p => p.nickname.toLowerCase().includes(val));
            renderPlayerList(filtered);
        });
    }
}

// 전역 노출 (HTML onclick에서 인식하기 위함)
window.removePlayer = removePlayer;
window.addPlayer = addPlayer;
window.openScoreModal = openScoreModal;
window.closeModal = closeModal;
window.applyScore = applyScore;
window.closeDetailModal = closeDetailModal;