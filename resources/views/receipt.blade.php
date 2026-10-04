<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kwitansi Donasi Resmi - {{ $donation->donation_code }}</title>
    <link rel="icon" href="{{ !empty($settings['site_favicon']) ? asset('storage/' . $settings['site_favicon']) : asset('favicon-insani.svg') }}" type="image/svg+xml">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
        }

        @if(request()->has('hide_back_btn'))
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
        @endif

        body {
            background-color: #f1f5f9;
            color: #1e293b;
            padding: 30px 20px;
            display: flex;
            justify-content: center;
        }

        body.in-iframe {
            background-color: transparent;
            padding: 16px 8px;
        }

        .receipt-wrapper {
            width: 100%;
            max-width: 750px;
        }

        .receipt-card {
            background: #ffffff;
            width: 100%;
            border-radius: 16px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
            border: 1px solid #e2e8f0;
            overflow: hidden;
            position: relative;
        }

        .receipt-header {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: #ffffff;
            padding: 32px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
        }

        .receipt-brand h1 {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }

        .receipt-brand p {
            font-size: 13px;
            opacity: 0.9;
            margin-top: 4px;
        }

        .receipt-badge {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            padding: 8px 16px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .receipt-body {
            padding: 36px 40px;
        }

        .receipt-meta {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 28px;
            padding-bottom: 24px;
            border-bottom: 1px dashed #cbd5e1;
        }

        .meta-item .label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }

        .meta-item .value {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 4px;
        }

        .amount-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px 24px;
            margin-bottom: 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .amount-box .nominal-label {
            font-size: 13px;
            color: #64748b;
            font-weight: 600;
        }

        .amount-box .nominal-value {
            font-size: 26px;
            font-weight: 800;
            color: #0284c7;
            white-space: nowrap;
        }

        .detail-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
        }

        .detail-table tr {
            border-bottom: 1px solid #f1f5f9;
        }

        .detail-table td {
            padding: 12px 0;
            font-size: 14px;
        }

        .detail-table td.col-label {
            color: #64748b;
            width: 35%;
        }

        .detail-table td.col-value {
            font-weight: 600;
            color: #1e293b;
        }

        .receipt-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 24px;
            padding-top: 24px;
            border-top: 1px dashed #cbd5e1;
        }

        .qr-section {
            display: flex;
            align-items: center;
            gap: 16px;
            flex: 1 1 auto;
            max-width: 330px;
        }

        .qr-image {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            padding: 4px;
            background: #ffffff;
            flex-shrink: 0;
        }

        .qr-text p {
            font-size: 12px;
            color: #64748b;
            line-height: 1.4;
        }

        .signature-section {
            text-align: right;
            position: relative;
            flex: 0 0 auto;
            min-width: 290px;
        }

        .signature-section .legal-foundation {
            font-size: 11px;
            margin-bottom: 4px;
            color: #334155;
            font-weight: 700;
        }

        .legal-text {
            font-size: 9.5px;
            color: #64748b;
            margin-bottom: 2px;
            white-space: nowrap;
        }

        .signature-section .sign-title {
            font-size: 13.5px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 6px;
        }

        .signature-section .sign-subtitle {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
        }

        .receipt-disclaimer {
            margin-top: 20px;
            padding-top: 14px;
            border-top: 1px dashed #e2e8f0;
            font-size: 10px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            line-height: 1.45;
        }

        .actions-bar {
            margin-top: 24px;
            display: flex;
            gap: 12px;
            justify-content: center;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
        }

        .btn-primary {
            background: #0284c7;
            color: #ffffff;
        }

        .btn-primary:hover {
            background: #0369a1;
        }

        .btn-outline {
            background: #ffffff;
            color: #475569;
            border: 1px solid #cbd5e1;
        }

        .btn-outline:hover {
            background: #f8fafc;
        }

        /* Responsive Mobile Styles */
        @media (max-width: 640px) {
            body {
                padding: 10px 6px;
            }

            body.in-iframe {
                padding: 4px;
            }

            .receipt-card {
                border-radius: 14px;
                box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.05);
            }

            .receipt-header {
                padding: 18px 16px;
                gap: 10px;
            }

            .receipt-brand img {
                max-height: 32px !important;
                margin-bottom: 4px !important;
            }

            .receipt-brand h1 {
                font-size: 18px;
            }

            .receipt-brand p {
                font-size: 11px;
            }

            .receipt-badge {
                padding: 5px 10px;
                font-size: 11px;
                letter-spacing: 0.3px;
            }

            .receipt-body {
                padding: 18px 16px;
            }

            .receipt-meta {
                grid-template-columns: 1fr;
                gap: 10px;
                margin-bottom: 18px;
                padding-bottom: 14px;
            }

            .meta-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
            }

            .meta-item .label {
                font-size: 11px;
                white-space: nowrap;
            }

            .meta-item .value {
                font-size: 13.5px;
                margin-top: 0;
                text-align: right;
            }

            .amount-box {
                padding: 14px 16px;
                margin-bottom: 18px;
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }

            .amount-box .nominal-label {
                font-size: 11.5px;
            }

            .amount-box .nominal-value {
                font-size: 22px;
                margin-top: 2px;
            }

            .detail-table {
                margin-bottom: 20px;
            }

            .detail-table td {
                padding: 9px 0;
                font-size: 12.5px;
            }

            .detail-table td.col-label {
                width: 38%;
                padding-right: 8px;
                font-size: 12px;
                vertical-align: top;
                line-height: 1.35;
            }

            .detail-table td.col-value {
                font-size: 12.5px;
                text-align: right;
                word-break: break-word;
                vertical-align: top;
                line-height: 1.35;
            }

            .receipt-footer {
                flex-direction: column;
                align-items: stretch;
                gap: 20px;
                padding-top: 18px;
            }

            .signature-section {
                order: 1;
                width: 100% !important;
                min-width: 0 !important;
                text-align: right;
            }

            .signature-section .sign-box {
                height: 60px !important;
            }

            .signature-section .stamp-img {
                height: 58px !important;
                right: 15px !important;
            }

            .signature-section .signature-img {
                height: 48px !important;
            }

            .legal-text {
                font-size: 9px;
            }

            .qr-section {
                order: 2;
                width: 100%;
                max-width: 100%;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .qr-image {
                width: 60px;
                height: 60px;
            }

            .qr-text p {
                font-size: 11px;
                line-height: 1.35;
            }

            .receipt-disclaimer {
                margin-top: 16px;
                padding-top: 12px;
                font-size: 9.5px;
                flex-direction: column;
                align-items: flex-start;
                gap: 6px;
            }

            .actions-bar {
                margin-top: 16px;
                flex-direction: column;
                gap: 8px;
                padding: 0 4px;
            }

            .btn {
                width: 100%;
                justify-content: center;
                padding: 11px 16px;
                font-size: 13.5px;
            }
        }

        @media (max-width: 360px) {
            .legal-text {
                font-size: 8px;
            }
            .signature-section .legal-foundation {
                font-size: 10px;
            }
            .amount-box .nominal-value {
                font-size: 20px;
            }
        }

        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            body {
                background: none !important;
                padding: 0 !important;
            }

            .receipt-wrapper {
                max-width: 100% !important;
            }

            .receipt-card {
                box-shadow: none !important;
                border: 1px solid #cbd5e1 !important;
                max-width: 100% !important;
                border-radius: 12px !important;
            }

            .receipt-header {
                padding: 28px 36px !important;
            }

            .receipt-body {
                padding: 28px 36px !important;
            }

            .receipt-meta {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 20px !important;
                margin-bottom: 24px !important;
                padding-bottom: 20px !important;
            }

            .meta-item {
                display: block !important;
            }

            .meta-item .value {
                text-align: left !important;
                font-size: 15px !important;
                margin-top: 4px !important;
            }

            .amount-box {
                display: flex !important;
                flex-direction: row !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 16px 20px !important;
                margin-bottom: 24px !important;
            }

            .amount-box .nominal-value {
                font-size: 24px !important;
            }

            .detail-table {
                margin-bottom: 24px !important;
            }

            .detail-table td.col-label {
                width: 35% !important;
                text-align: left !important;
                font-size: 13.5px !important;
            }

            .detail-table td.col-value {
                text-align: left !important;
                font-size: 13.5px !important;
            }

            .receipt-footer {
                display: flex !important;
                flex-direction: row !important;
                justify-content: space-between !important;
                align-items: flex-end !important;
                gap: 24px !important;
                padding-top: 20px !important;
            }

            .qr-section {
                order: 1 !important;
                width: auto !important;
                max-width: 320px !important;
                background: none !important;
                border: none !important;
                padding: 0 !important;
            }

            .signature-section {
                order: 2 !important;
                width: auto !important;
                min-width: 290px !important;
                text-align: right !important;
            }

            .legal-text {
                white-space: nowrap !important;
            }

            .actions-bar {
                display: none !important;
            }
        }
    </style>
</head>
<body class="{{ request()->has('hide_back_btn') ? 'in-iframe' : '' }}">
    <div class="receipt-wrapper">
        <div class="receipt-card">
            <div class="receipt-header">
                <div class="receipt-brand">
                    @if(!empty($settings['site_logo_white']))
                        <img src="{{ asset('storage/' . $settings['site_logo_white']) }}" alt="{{ $settings['site_name'] ?? 'Insani Indonesia' }}" style="max-height: 42px; width: auto; margin-bottom: 6px; display: block;">
                    @elseif(!empty($settings['site_logo']))
                        <img src="{{ asset('storage/' . $settings['site_logo']) }}" alt="{{ $settings['site_name'] ?? 'Insani Indonesia' }}" style="max-height: 42px; width: auto; margin-bottom: 6px; display: block;">
                    @elseif(file_exists(public_path('images/logo/logo-landscape-white.png')))
                        <img src="{{ asset('images/logo/logo-landscape-white.png') }}" alt="{{ $settings['site_name'] ?? 'Insani Indonesia' }}" style="max-height: 42px; width: auto; margin-bottom: 6px; display: block;">
                    @else
                        <h1>{{ $settings['site_name'] ?? 'Insani Indonesia' }}</h1>
                    @endif
                    <p>Bukti Tanda Terima Donasi Sah</p>
                </div>
                <div class="receipt-badge">
                    Lunas / Paid
                </div>
            </div>

            <div class="receipt-body">
                <div class="receipt-meta">
                    <div class="meta-item">
                        <div class="label">Kode Transaksi</div>
                        <div class="value">{{ $donation->donation_code }}</div>
                    </div>
                    <div class="meta-item">
                        <div class="label">Tanggal Pembayaran</div>
                        <div class="value">
                            {{ $donation->paid_at ? \Carbon\Carbon::parse($donation->paid_at)->translatedFormat('d F Y, H:i') : \Carbon\Carbon::parse($donation->created_at)->translatedFormat('d F Y, H:i') }} WIB
                        </div>
                    </div>
                </div>

                <div class="amount-box">
                    <div>
                        <div class="nominal-label">Total Donasi Diterima</div>
                        <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Terima kasih atas kebaikan Anda</div>
                    </div>
                    <div class="nominal-value">
                        Rp {{ number_format($donation->amount, 0, ',', '.') }}
                    </div>
                </div>

                <table class="detail-table">
                    <tr>
                        <td class="col-label">Nama Donatur</td>
                        <td class="col-value">{{ $donation->is_anonymous ? 'Inisiator Kebaikan' : $donation->donor_name }}</td>
                    </tr>
                    <tr>
                        <td class="col-label">Program Donasi</td>
                        <td class="col-value">
                            @php
                                $programTitle = $donation->program?->title;
                                $title = is_array($programTitle)
                                    ? ($programTitle['id'] ?? reset($programTitle))
                                    : ($programTitle ?? 'Donasi Kemanusiaan');
                            @endphp
                            {{ $title }}
                        </td>
                    </tr>
                    <tr>
                        <td class="col-label">Metode Pembayaran</td>
                        <td class="col-value">
                            {{ $payment?->payment_channel_label ?? $donation->payment_channel_label }}
                        </td>
                    </tr>
                    @if($payment?->gateway_reference_id)
                    <tr>
                        <td class="col-label">Nomor Referensi Gateway</td>
                        <td class="col-value" style="font-family: monospace;">{{ $payment->gateway_reference_id }}</td>
                    </tr>
                    @endif
                    @if($donation->message)
                    <tr>
                        <td class="col-label">Doa / Pesan Kebaikan</td>
                        <td class="col-value" style="font-style: italic;">"{{ $donation->message }}"</td>
                    </tr>
                    @endif
                </table>

                <div class="receipt-footer">
                    <div class="qr-section">
                        @php
                            $verifyUrl = route('donation.status', ['donationCode' => $donation->donation_code]);
                            $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' . urlencode($verifyUrl);
                        @endphp
                        <img src="{{ $qrCodeUrl }}" alt="QR Verifikasi" class="qr-image">
                        <div class="qr-text">
                            <p><strong>Verifikasi Kwitansi Resmi</strong></p>
                            <p>Pindai kode QR untuk memverifikasi keaslian donasi secara online.</p>
                        </div>
                    </div>

                    <div class="signature-section">
                        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-bottom: 6px;">
                            <img src="{{ asset('images/legal/kemenkumham.svg') }}" alt="Kemenkumham RI" style="height: 24px; width: auto;" title="Kemenkumham RI">
                            <img src="{{ asset('images/legal/djp-pajak.svg') }}" alt="DJP Pajak" style="height: 22px; width: auto;" title="Direktorat Jenderal Pajak">
                        </div>
                        <p class="legal-foundation">{{ $settings['legal_foundation_name'] ?? 'Yayasan Peduli Insani Indonesia' }}</p>
                        @if(!empty($settings['legal_sk_kemenkumham']))
                            <p class="legal-text">{{ $settings['legal_sk_label'] ?? 'SK Kemenkumham' }}: {{ $settings['legal_sk_kemenkumham'] }}</p>
                        @endif
                        @if(!empty($settings['legal_operational_permit']))
                            <p class="legal-text">Izin Kegiatan: {{ $settings['legal_operational_permit'] }}</p>
                        @endif
                        @if(!empty($settings['legal_npwp']))
                            <p class="legal-text">NPWP: {{ $settings['legal_npwp'] }}</p>
                        @endif
                        
                        <div class="sign-box" style="position: relative; height: 75px; margin: 4px 0; display: flex; align-items: center; justify-content: flex-end;">
                            @if(!empty($settings['receipt_stamp_image']))
                                <img src="{{ asset('storage/' . $settings['receipt_stamp_image']) }}" alt="Stempel Resmi" class="stamp-img" style="position: absolute; right: 25px; height: 70px; opacity: 0.85; z-index: 1; pointer-events: none;">
                            @endif
                            @if(!empty($settings['receipt_signature_image']))
                                <img src="{{ asset('storage/' . $settings['receipt_signature_image']) }}" alt="Tanda Tangan" class="signature-img" style="position: relative; height: 55px; z-index: 2;">
                            @endif
                        </div>

                        <div class="sign-title" style="text-decoration: underline;">
                            {{ $settings['receipt_signatory_name'] ?? 'Pengurus Yayasan' }}
                        </div>
                        <p class="sign-subtitle">
                            {{ $settings['receipt_signatory_title'] ?? 'Bagian Keuangan & Donasi' }}
                        </p>
                    </div>
                </div>

                <div class="receipt-disclaimer">
                    <div>Dokumen ini diterbitkan secara elektronik oleh sistem resmi {{ $settings['legal_foundation_name'] ?? 'Yayasan Peduli Insani Indonesia' }} dan sah tanpa tanda tangan basah.</div>
                    <div>Layanan Donatur: {{ $settings['contact_donor_support_wa'] ?? $settings['contact_whatsapp'] ?? '081319456675' }} &bull; {{ $settings['contact_email'] ?? 'sapa@insani.id' }}</div>
                </div>
            </div>
        </div>

        <div class="actions-bar">
            <button onclick="window.print()" class="btn btn-primary">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Cetak / Simpan PDF
            </button>
            @if(!request()->has('hide_back_btn'))
            <a href="{{ route('donation.status', ['donationCode' => $donation->donation_code]) }}" class="btn btn-outline">
                Kembali ke Status Donasi
            </a>
            @endif
        </div>
    </div>
</body>
</html>
