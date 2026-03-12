<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index() {
        return Transaction::with(['bien.images', 'client', 'proprietaire'])->get();
    }

    public function store(Request $request) {
        $transaction = Transaction::create($request->all());
        return response()->json(
            $transaction->load(['bien.images', 'client', 'proprietaire']),
            201
        );
    }

    public function show($id) {
        return Transaction::with(['bien.images', 'client', 'proprietaire'])->findOrFail($id);
    }

    public function update(Request $request, $id) {
        $transaction = Transaction::findOrFail($id);
        $transaction->update($request->all());
        return response()->json(
            $transaction->load(['bien.images', 'client', 'proprietaire'])
        );
    }

    public function destroy($id) {
        Transaction::destroy($id);
        return response()->json(null, 204);
    }
}