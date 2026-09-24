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
            padding: 40px 20px;
            display: flex;
            justify-content: center;
        }

        .receipt-card {
            background: #ffffff;
            width: 100%;
            max-width: 750px;
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
            padding-top: 24px;
            border-top: 1px dashed #cbd5e1;
        }

        .qr-section {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .qr-image {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            padding: 4px;
            background: #ffffff;
        }

        .qr-text p {
            font-size: 12px;
            color: #64748b;
            line-height: 1.4;
        }

        .signature-section {
            text-align: right;
        }

        .signature-section p {
            font-size: 13px;
            color: #64748b;
        }

        .signature-section .sign-title {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 40px;
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

        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            body {
                background: none;
                padding: 0;
            }

            .receipt-card {
                box-shadow: none;
                border: 1px solid #cbd5e1;
                max-width: 100%;
            }

            .actions-bar {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div style="width: 100%; max-width: 750px;">
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
                        <td class="col-value">{{ $donation->is_anonymous ? 'Hamba Allah (Anonim)' : $donation->donor_name }}</td>
                    </tr>
                    <tr>
                        <td class="col-label">Program Donasi</td>
                        <td class="col-value">
                            @php
                                $title = is_array($donation->program->title)
                                    ? ($donation->program->title['id'] ?? reset($donation->program->title))
                                    : $donation->program->title;
                            @endphp
                            {{ $title }}
                        </td>
                    </tr>
                    <tr>
                        <td class="col-label">Metode Pembayaran</td>
                        <td class="col-value">
                            {{ strtoupper($payment?->payment_channel ?? ($donation->channel === 'offline' ? 'Transfer Bank Manual' : 'Online Payment')) }}
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
                            <p><strong>Verifikasi Kwitansi</strong></p>
                            <p>Pindai kode QR untuk memverifikasi keaslian donasi secara online.</p>
                        </div>
                    </div>

                    <div class="signature-section" style="position: relative; min-width: 190px;">
                        <p style="font-size: 11px; margin-bottom: 4px; color: #475569; font-weight: 600;">{{ $settings['legal_foundation_name'] ?? 'Yayasan Peduli Insani Indonesia' }}</p>
                        @if(!empty($settings['legal_sk_kemenkumham']))
                            <p style="font-size: 9.5px; color: #64748b; margin-bottom: 2px;">{{ $settings['legal_sk_label'] ?? 'SK Kemenkumham' }}: {{ $settings['legal_sk_kemenkumham'] }}</p>
                        @endif
                        @if(!empty($settings['legal_operational_permit']))
                            <p style="font-size: 9.5px; color: #64748b; margin-bottom: 2px;">Izin Kegiatan: {{ $settings['legal_operational_permit'] }}</p>
                        @endif
                        @if(!empty($settings['legal_npwp']))
                            <p style="font-size: 9.5px; color: #64748b; margin-bottom: 2px;">NPWP: {{ $settings['legal_npwp'] }}</p>
                        @endif
                        
                        <div style="position: relative; height: 75px; margin: 4px 0; display: flex; align-items: center; justify-content: flex-end;">
                            @if(!empty($settings['receipt_stamp_image']))
                                <img src="{{ asset('storage/' . $settings['receipt_stamp_image']) }}" alt="Stempel Resmi" style="position: absolute; right: 25px; height: 70px; opacity: 0.85; z-index: 1; pointer-events: none;">
                            @endif
                            @if(!empty($settings['receipt_signature_image']))
                                <img src="{{ asset('storage/' . $settings['receipt_signature_image']) }}" alt="Tanda Tangan" style="position: relative; height: 55px; z-index: 2;">
                            @endif
                        </div>

                        <div class="sign-title" style="font-weight: 700; font-size: 13px; text-decoration: underline;">
                            {{ $settings['receipt_signatory_name'] ?? 'Pengurus Yayasan' }}
                        </div>
                        <p style="font-size: 11px; color: #64748b; margin-top: 2px;">
                            {{ $settings['receipt_signatory_title'] ?? 'Bagian Keuangan & Donasi' }}
                        </p>
                    </div>
                </div>

                <div style="margin-top: 20px; padding-top: 14px; border-top: 1px dashed #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
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
