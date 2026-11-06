<?php

namespace App\Services;

use App\Contracts\BookRepositoryInterface;
use App\Models\Book;

class BookService
{
    public function __construct(
        private BookRepositoryInterface $repository
    ) {}

    public function list(): array
    {
        return array_map(
            fn(Book $book) => $book->toArray(),
            $this->repository->findAll()
        );
    }

    public function detail(int $id): array
    {
        $book = $this->repository->findById($id);

        if (!$book) {
            throw new \InvalidArgumentException(
                "Buku dengan ID {$id} tidak ditemukan",
                404
            );
        }

        return $book->toArray();
    }

    public function create(array $data): array
    {
        $this->validate($data);

        $book = new Book(
            null,
            trim($data['judul']),
            trim($data['penulis']),
            (int) $data['tahun'],
            (int) $data['stok']
        );

        $id = $this->repository->save($book);

        return $this->detail($id);
    }

    public function update(int $id, array $data): array
    {
        $this->detail($id);
        $this->validate($data);

        $book = new Book(
            $id,
            trim($data['judul']),
            trim($data['penulis']),
            (int) $data['tahun'],
            (int) $data['stok']
        );

        $this->repository->update($book);

        return $this->detail($id);
    }

    public function delete(int $id): void
    {
        $this->detail($id);
        $this->repository->delete($id);
    }

    private function validate(array $data): void
    {
        if (empty(trim($data['judul'] ?? ''))) {
            throw new \InvalidArgumentException(
                'Judul wajib diisi',
                422
            );
        }

        if (empty(trim($data['penulis'] ?? ''))) {
            throw new \InvalidArgumentException(
                'Penulis wajib diisi',
                422
            );
        }

        if (!isset($data['tahun']) || !is_numeric($data['tahun'])) {
            throw new \InvalidArgumentException(
                'Tahun wajib diisi dengan angka',
                422
            );
        }

        if (!isset($data['stok']) || !is_numeric($data['stok'])) {
            throw new \InvalidArgumentException(
                'Stok wajib diisi dengan angka',
                422
            );
        }
    }
}
