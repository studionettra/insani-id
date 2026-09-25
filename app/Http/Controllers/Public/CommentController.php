<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Doa dan komentar mandiri publik telah dialihkan ke alur pembayaran donasi resmi (PaymentObserver).
     */
    public function store(Request $request, Program $program)
    {
        abort(404, 'Komentar dan doa hanya dapat dikirimkan melalui formulir transaksi donasi.');
    }
}
