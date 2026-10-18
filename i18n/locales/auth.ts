// Strings for the auth screens, merged into each language under `auth.*`.
export const authText = {
  ja: {
    signInTitle: 'ログイン', signUpTitle: '会員登録', resetTitle: 'パスワードの再設定',
    signInDescription: 'グループ共通の会員アカウントでログインします。', signUpDescription: '登録は無料です。ポイントとランクはグループの全館で共通です。', resetDescription: 'ご登録のメールアドレスに、パスワード再設定用のリンクをお送りします。',
    displayName: 'お名前', email: 'メールアドレス', password: 'パスワード', passwordHint: '8文字以上', confirmPassword: 'パスワード（確認）',
    signIn: 'ログイン', signUp: '登録する', sendReset: '再設定メールを送信',
    toSignUp: 'アカウントをお持ちでない方は新規登録', toSignIn: 'すでにアカウントをお持ちの方はログイン', forgotPassword: 'パスワードをお忘れの方', backToSignIn: 'ログイン画面に戻る',
    resetSent: 'ご入力のメールアドレスでアカウントが登録されている場合、パスワード再設定用のメールをお送りしました。メールをご確認ください。',
    signUpDoneTitle: 'ご登録ありがとうございます', signUpDoneMessage: '{{email}} 宛てに確認メールをお送りしました。メール内のリンクを開いて、メールアドレスの確認を完了してください。', continue: '続ける',
    signInPrompt: 'ログイン / 新規登録',
    errors: {
      displayNameRequired: 'お名前を入力してください。', emailInvalid: 'メールアドレスを正しく入力してください。', passwordRequired: 'パスワードを入力してください。', passwordTooShort: 'パスワードは8文字以上で入力してください。', passwordMismatch: 'パスワードが一致しません。',
      invalidCredential: 'メールアドレスまたはパスワードが正しくありません。', emailInUse: 'このメールアドレスはすでに登録されています。ログインするか、パスワードを再設定してください。', weakPassword: 'このパスワードは安全性が低いため使用できません。英字・数字・記号を組み合わせて、より長いパスワードにしてください。', invalidEmail: 'メールアドレスの形式が正しくありません。',
      tooManyRequests: '試行回数が多すぎます。しばらく時間をおいてからもう一度お試しください。', network: '通信できませんでした。インターネット接続をご確認のうえ、もう一度お試しください。', recentLogin: '安全のため、一度ログアウトして再度ログインしてから、もう一度お試しください。', generic: '処理を完了できませんでした。時間をおいてもう一度お試しください。',
    },
    verify: {
      title: 'メールアドレスの確認が必要です', message: '{{email}} 宛てにお送りした確認メールのリンクを開いてください。確認が完了すると、ご予約などすべての機能をご利用いただけます。', bookingMessage: 'ご予約の前に、メールアドレスの確認を完了してください。',
      resend: '確認メールを再送信', resent: '確認メールを再送信しました。', verified: '確認しました', stillUnverified: 'まだ確認が完了していません。メール内のリンクを開いてから、もう一度お試しください。',
    },
    account: {
      signedOutTitle: '会員アカウント', signedOutDescription: 'ログインすると、ご予約の確認やポイントの利用ができます。', profile: 'ログイン中のアカウント', noName: '（お名前未設定）', signOut: 'ログアウト',
      deleteAccount: 'アカウントを削除', deleteConfirm: 'アカウントを削除すると、会員情報とポイントはすべて削除され、元に戻すことはできません。すでにお申し込みのご予約は取り消されず、ホテルに引き続き保管されます（キャンセルは別途お手続きください）。本当に削除しますか？', deleteYes: '削除する', deleteNo: 'やめる',
      hotelTools: 'ホテル管理ツール', hotelToolsDescription: 'スタッフ向けの管理画面',
    },
  },
  'zh-TW': {
    signInTitle: '登入', signUpTitle: '註冊會員', resetTitle: '重設密碼',
    signInDescription: '使用集團共通的會員帳號登入。', signUpDescription: '免費註冊。點數與等級在集團旗下所有飯店皆通用。', resetDescription: '我們會將重設密碼的連結寄送到您註冊的電子郵件地址。',
    displayName: '姓名', email: '電子郵件', password: '密碼', passwordHint: '至少 8 個字元', confirmPassword: '確認密碼',
    signIn: '登入', signUp: '註冊', sendReset: '寄送重設郵件',
    toSignUp: '還沒有帳號？立即註冊', toSignIn: '已經有帳號？登入', forgotPassword: '忘記密碼？', backToSignIn: '返回登入',
    resetSent: '若此電子郵件地址已註冊帳號，我們已寄出重設密碼的郵件，請查收。',
    signUpDoneTitle: '感謝您的註冊', signUpDoneMessage: '我們已寄送確認郵件至 {{email}}，請開啟郵件中的連結以完成電子郵件驗證。', continue: '繼續',
    signInPrompt: '登入 / 註冊',
    errors: {
      displayNameRequired: '請輸入姓名。', emailInvalid: '請輸入正確的電子郵件地址。', passwordRequired: '請輸入密碼。', passwordTooShort: '密碼至少需要 8 個字元。', passwordMismatch: '兩次輸入的密碼不一致。',
      invalidCredential: '電子郵件或密碼不正確。', emailInUse: '此電子郵件地址已被註冊。請直接登入，或重設密碼。', weakPassword: '此密碼安全性不足，請組合英文字母、數字與符號，並設定更長的密碼。', invalidEmail: '電子郵件地址格式不正確。',
      tooManyRequests: '嘗試次數過多，請稍後再試。', network: '無法連線，請確認網路連線後再試一次。', recentLogin: '為了安全起見，請先登出並重新登入後再試一次。', generic: '無法完成操作，請稍後再試。',
    },
    verify: {
      title: '需要驗證電子郵件', message: '請開啟我們寄送至 {{email}} 的確認郵件中的連結。完成驗證後即可使用訂房等所有功能。', bookingMessage: '訂房前請先完成電子郵件驗證。',
      resend: '重新寄送確認郵件', resent: '已重新寄送確認郵件。', verified: '我已完成驗證', stillUnverified: '尚未完成驗證。請先開啟郵件中的連結，再試一次。',
    },
    account: {
      signedOutTitle: '會員帳號', signedOutDescription: '登入後即可查看訂房紀錄並使用點數。', profile: '目前登入的帳號', noName: '（未設定姓名）', signOut: '登出',
      deleteAccount: '刪除帳號', deleteConfirm: '刪除帳號後，會員資料與點數將全部刪除且無法復原。已完成的訂房不會被取消，將繼續由飯店保存（如需取消請另行辦理）。確定要刪除嗎？', deleteYes: '刪除', deleteNo: '取消',
      hotelTools: '飯店管理工具', hotelToolsDescription: '員工專用的管理畫面',
    },
  },
  en: {
    signInTitle: 'Sign in', signUpTitle: 'Create account', resetTitle: 'Reset password',
    signInDescription: 'Sign in with your group membership account.', signUpDescription: 'Membership is free. Points and tiers are shared across every group hotel.', resetDescription: 'We will send a password reset link to the email address you registered with.',
    displayName: 'Name', email: 'Email', password: 'Password', passwordHint: 'At least 8 characters', confirmPassword: 'Confirm password',
    signIn: 'Sign in', signUp: 'Create account', sendReset: 'Send reset email',
    toSignUp: 'New here? Create an account', toSignIn: 'Already have an account? Sign in', forgotPassword: 'Forgot your password?', backToSignIn: 'Back to sign in',
    resetSent: 'If an account exists for that email address, we have sent a password reset email. Please check your inbox.',
    signUpDoneTitle: 'Thank you for joining', signUpDoneMessage: 'We sent a verification email to {{email}}. Open the link in it to confirm your email address.', continue: 'Continue',
    signInPrompt: 'Sign in / Create account',
    errors: {
      displayNameRequired: 'Please enter your name.', emailInvalid: 'Please enter a valid email address.', passwordRequired: 'Please enter your password.', passwordTooShort: 'Your password must be at least 8 characters.', passwordMismatch: 'The passwords do not match.',
      invalidCredential: 'The email address or password is incorrect.', emailInUse: 'This email address is already registered. Sign in, or reset your password.', weakPassword: 'This password is too weak. Use a longer password that mixes letters, numbers and symbols.', invalidEmail: 'That email address is not valid.',
      tooManyRequests: 'Too many attempts. Please wait a while and try again.', network: 'We could not connect. Check your internet connection and try again.', recentLogin: 'For your security, please sign out, sign in again and then retry.', generic: 'Something went wrong. Please try again later.',
    },
    verify: {
      title: 'Please verify your email', message: 'Open the link in the email we sent to {{email}}. Once your address is verified you can use every feature, including booking.', bookingMessage: 'Please verify your email address before booking.',
      resend: 'Resend verification email', resent: 'We sent the verification email again.', verified: 'I’ve verified', stillUnverified: 'Your email is not verified yet. Open the link in the email, then try again.',
    },
    account: {
      signedOutTitle: 'Member account', signedOutDescription: 'Sign in to see your reservations and use your points.', profile: 'Signed in as', noName: '(No name set)', signOut: 'Sign out',
      deleteAccount: 'Delete account', deleteConfirm: 'Deleting your account permanently removes your membership and all of your points. This cannot be undone. Existing reservations are not cancelled and stay with the hotel (please cancel them separately if needed). Delete your account?', deleteYes: 'Delete', deleteNo: 'Keep my account',
      hotelTools: 'Hotel tools', hotelToolsDescription: 'Management screens for hotel staff',
    },
  },
} as const;
