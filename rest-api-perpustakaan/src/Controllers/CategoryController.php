<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\CategoryService;
use InvalidArgumentException;

class CategoryController
{
    public function __construct(private CategoryService $service) {}

    public function index(Request $request): void
    {
        try {
            Response::success(
                $this->service->getAll(),
                'Daftar kategori'
            );
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function show(Request $request, string $id): void
    {
        try {
            $category = $this->service->getById((int) $id);

            if (!$category) {
                Response::error('Kategori tidak ditemukan', 404);
                return;
            }

            Response::success($category, 'Detail kategori');
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function store(Request $request): void
    {
        try {
            $id = $this->service->create($request->body());
            $category = $this->service->getById($id);

            Response::success(
                $category,
                'Kategori berhasil dibuat',
                201
            );
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), $e->getCode() ?: 422);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function update(Request $request, string $id): void
    {
        try {
            $updated = $this->service->update(
                (int) $id,
                $request->body()
            );

            if (!$updated) {
                Response::error('Kategori tidak ditemukan', 404);
                return;
            }

            $category = $this->service->getById((int) $id);

            Response::success(
                $category,
                'Kategori berhasil diperbarui'
            );
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), $e->getCode() ?: 422);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function destroy(Request $request, string $id): void
    {
        try {
            $deleted = $this->service->delete((int) $id);

            if (!$deleted) {
                Response::error('Kategori tidak ditemukan', 404);
                return;
            }

            Response::success(null, 'Kategori berhasil dihapus');
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
