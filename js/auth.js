// Supabase 설정은 config.js에서 불러옵니다.
// HTML 파일에서 config.js를 auth.js보다 먼저 로드해야 합니다.
// <script src="../config.js"></script>
// <script src="../js/auth.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    // --- [회원가입 처리] ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('signup-name').value;
            const grade = document.getElementById('signup-grade').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            const submitBtn = signupForm.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.textContent = '가입 중...';

            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: name,
                        grade: parseInt(grade),
                    }
                }
            });

            if (error) {
                alert('회원가입 실패: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = '가입하기';
            } else {
                alert('회원가입이 성공했습니다 이메일 인증을 해주세요');
                window.location.href = './login.html';
            }
        });
    }

    // --- [로그인 처리] ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const submitBtn = loginForm.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.textContent = '로그인 중...';

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                alert('로그인 실패: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = '로그인';
            } else {
                window.location.href = './index.html';
            }
            
        });
    }
});

// --- [비밀번호 재설정 이메일 발송 처리] ---
const findPwForm = document.getElementById('find-pw-form');

if (findPwForm) {
    findPwForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('reset-email').value;
        const submitBtn = findPwForm.querySelector('button');

        submitBtn.disabled = true;
        submitBtn.textContent = '발송 중...';

        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + './update-password.html',
        });

        if (error) {
            alert('에러 발생: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = '재설정 링크 발송';
        } else {
            alert('입력하신 이메일로 재설정 링크가 전송되었습니다. 메일함을 확인해주세요!');
            window.location.href = './login.html';
        }
    });
}

// --- [새 비밀번호로 업데이트 처리] ---
const updatePwForm = document.getElementById('update-pw-form');

if (updatePwForm) {
    updatePwForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        const submitBtn = updatePwForm.querySelector('button');
        submitBtn.disabled = true;
        submitBtn.textContent = '변경 중...';

        const { data, error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });

        if (error) {
            alert("변경 실패: " + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = '비밀번호 변경 완료';
        } else {
            alert("비밀번호가 성공적으로 변경되었습니다! 다시 로그인해주세요.");
            window.location.href = './login.html';
        }
    });
}

// 로그인 상태 체크 함수 (main.html 등에서 사용 가능)
async function checkUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}
