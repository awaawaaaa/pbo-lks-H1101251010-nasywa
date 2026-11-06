<?php

namespace App\Models;

class Category
{
    public ?int $id;
    public string $nama;
    public ?string $deskripsi;

    public function __construct(
        ?int $id = null,
        string $nama = '',
        ?string $deskripsi = null
    ) {
        $this->id = $id;
        $this->nama = $nama;
        $this->deskripsi = $deskripsi;
    }
}