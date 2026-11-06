<?php

namespace App\Services;

use App\Contracts\CategoryRepositoryInterface;
use App\Models\Category;

class CategoryService
{
    public function __construct(
        private CategoryRepositoryInterface $repository
    ) {}

    public function getAll(): array
    {
        return $this->repository->findAll();
    }

    public function getById(int $id): ?Category
    {
        return $this->repository->findById($id);
    }

    public function create(array $data): int
    {
        $this->validate($data);

        $category = new Category(
            null,
            trim($data['nama']),
            $data['deskripsi'] ?? null
        );

        return $this->repository->save($category);
    }

    public function update(int $id, array $data): bool
    {
        $this->validate($data);

        $category = new Category(
            $id,
            trim($data['nama']),
            $data['deskripsi'] ?? null
        );

        return $this->repository->update($category);
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    private function validate(array $data): void
    {
        if (empty(trim($data['nama'] ?? ''))) {
            throw new \InvalidArgumentException(
                'Nama kategori wajib diisi',
                422
            );
        }
    }
}