<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pemeliharaan Sistem — Insani.id</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <meta name="robots" content="noindex, nofollow">
    <meta http-equiv="refresh" content="{{ $retryAfter ?? 45 }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary: #0080ff;
            --primary-hover: #0066cc;
            --primary-light: rgba(0, 128, 255, 0.08);
            --slate-50: #f8fafc;
            --slate-100: #f1f5f9;
            --slate-200: #e2e8f0;
            --slate-300: #cbd5e1;
            --slate-400: #94a3b8;
            --slate-500: #64748b;
            --slate-600: #475569;
            --slate-700: #334155;
            --slate-800: #1e293b;
            --slate-900: #0f172a;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--slate-50);
            color: var(--slate-800);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            padding: 24px 16px;
            position: relative;
            overflow-x: hidden;
        }

        /* Subtle modern background glow */
        body::before {
            content: '';
            position: absolute;
            top: -120px;
            left: 50%;
            transform: translateX(-50%);
            width: 600px;
            height: 400px;
            background: radial-gradient(circle, rgba(0, 128, 255, 0.12) 0%, rgba(248, 250, 252, 0) 70%);
            z-index: 0;
            pointer-events: none;
        }

        .header-brand {
            position: relative;
            z-index: 1;
            margin-top: 12px;
            margin-bottom: 24px;
            text-align: center;
        }

        .header-brand img {
            max-height: 42px;
            width: auto;
            object-fit: contain;
        }

        .card {
            position: relative;
            z-index: 1;
            background: #ffffff;
            border: 1px solid var(--slate-200);
            border-radius: 24px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.03);
            max-width: 580px;
            width: 100%;
            padding: 40px 32px;
            text-align: center;
        }

        @media (max-width: 640px) {
            .card {
                padding: 32px 20px;
                border-radius: 20px;
            }
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: var(--primary-light);
            border: 1px solid rgba(0, 128, 255, 0.2);
            color: var(--primary);
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.02em;
            padding: 6px 14px;
            border-radius: 9999px;
            margin-bottom: 20px;
        }

        .pulse-dot {
            width: 8px;
            height: 8px;
            background-color: var(--primary);
            border-radius: 50%;
            position: relative;
        }

        .pulse-dot::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 50%;
            border: 2px solid var(--primary);
            animation: pulse 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }

        @keyframes pulse {
            0% {
                transform: scale(0.95);
                opacity: 0.8;
            }
            70% {
                transform: scale(2.2);
                opacity: 0;
            }
            100% {
                transform: scale(2.2);
                opacity: 0;
            }
        }

        .icon-wrapper {
            width: 72px;
            height: 72px;
            background: linear-gradient(135deg, rgba(0, 128, 255, 0.1) 0%, rgba(0, 128, 255, 0.03) 100%);
            border: 1px solid rgba(0, 128, 255, 0.18);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px auto;
            color: var(--primary);
        }

        .icon-wrapper svg {
            width: 36px;
            height: 36px;
            stroke-width: 2.2;
        }

        h1 {
            font-size: 26px;
            font-weight: 800;
            color: var(--slate-900);
            line-height: 1.3;
            letter-spacing: -0.02em;
            margin-bottom: 12px;
        }

        @media (max-width: 640px) {
            h1 {
                font-size: 22px;
            }
        }

        p.description {
            font-size: 15px;
            color: var(--slate-600);
            line-height: 1.6;
            margin-bottom: 28px;
        }

        .notice-box {
            background-color: var(--slate-50);
            border: 1px solid var(--slate-200);
            border-radius: 14px;
            padding: 16px 18px;
            margin-bottom: 28px;
            text-align: left;
            display: flex;
            gap: 12px;
            align-items: flex-start;
        }

        .notice-icon {
            color: var(--primary);
            flex-shrink: 0;
            margin-top: 2px;
        }

        .notice-content h4 {
            font-size: 13px;
            font-weight: 700;
            color: var(--slate-800);
            margin-bottom: 3px;
        }

        .notice-content p {
            font-size: 12.5px;
            color: var(--slate-500);
            line-height: 1.5;
            margin: 0;
        }

        .action-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        @media (min-width: 640px) {
            .action-group {
                flex-direction: row;
                justify-content: center;
            }
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
            height: 46px;
        }

        .btn-primary {
            background-color: var(--primary);
            color: #ffffff;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 128, 255, 0.2);
        }

        .btn-primary:hover {
            background-color: var(--primary-hover);
            transform: translateY(-1px);
        }

        .btn-secondary {
            background-color: #ffffff;
            color: var(--slate-700);
            border: 1px solid var(--slate-300);
        }

        .btn-secondary:hover {
            background-color: var(--slate-50);
            border-color: var(--slate-400);
        }

        .countdown-text {
            font-size: 12px;
            color: var(--slate-400);
            margin-top: 20px;
        }

        .footer-legal {
            position: relative;
            z-index: 1;
            text-align: center;
            margin-top: 28px;
            color: var(--slate-500);
            font-size: 12px;
            line-height: 1.6;
            max-width: 600px;
        }

        .footer-legal strong {
            color: var(--slate-700);
            font-weight: 600;
        }
    </style>
</head>
<body>

    <header class="header-brand">
        <img src="/images/logo/logo-landscape-color.png" alt="Insani.id" onerror="this.onerror=null; this.style.display='none'; document.getElementById('brand-fallback').style.display='block';">
        <div id="brand-fallback" style="display:none; font-size: 24px; font-weight: 800; color: #0080ff; letter-spacing: -0.03em;">
            Insani.id
        </div>
    </header>

    <main class="card">
        <div class="badge">
            <span class="pulse-dot"></span>
            Pembaruan Sistem Rutin
        </div>

        <div class="icon-wrapper">
            <!-- Representational Lucide Wrench / Settings without sparkles -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
        </div>

        <h1>Layanan Sedang Ditingkatkan</h1>

        <p class="description">
            Sistem kami sedang menjalani pemeliharaan berkala untuk meningkatkan stabilitas, kecepatan, dan keamanan transaksi donasi. Akses publik akan segera dibuka kembali dalam beberapa saat.
        </p>

        <div class="notice-box">
            <div class="notice-icon">
                <!-- Lucide ShieldCheck Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                    <path d="m9 12 2 2 4-4"/>
                </svg>
            </div>
            <div class="notice-content">
                <h4>Integritas Data & Pembayaran Aman</h4>
                <p>Seluruh riwayat donasi dan data pengguna tetap tersimpan aman. Transaksi perbankan yang sedang berlangsung akan disinkronkan otomatis setelah sistem aktif kembali.</p>
            </div>
        </div>

        <div class="action-group">
            <button onclick="window.location.reload();" class="btn btn-secondary">
                <!-- Lucide RefreshCw -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M8 16H3v5"/>
                </svg>
                Muat Ulang Halaman
            </button>

            <a href="https://wa.me/6281319456675?text=Halo%20Layanan%20Insani,%20saya%20ingin%20menanyakan%20status%20layanan%20Insani.id" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                <!-- Lucide MessageCircle -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                </svg>
                WhatsApp Bantuan
            </a>
        </div>

        <div class="countdown-text" id="auto-refresh-timer">
            Halaman ini akan otomatis diperiksa ulang dalam <span id="seconds">{{ $retryAfter ?? 45 }}</span> detik.
        </div>
    </main>

    <footer class="footer-legal">
        <p><strong>Yayasan Peduli Insani Indonesia</strong></p>
        <p>SK Kemenkumham RI: AHU-0002557.AH.01.04.Tahun 2019</p>
    </footer>

    <script>
        (function() {
            var timeLeft = parseInt("{{ $retryAfter ?? 45 }}", 10) || 45;
            var countdownEl = document.getElementById('seconds');
            if (!countdownEl) return;

            var timer = setInterval(function() {
                timeLeft--;
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    window.location.reload();
                } else {
                    countdownEl.textContent = timeLeft;
                }
            }, 1000);
        })();
    </script>
</body>
</html>
