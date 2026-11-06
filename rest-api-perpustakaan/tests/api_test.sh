
#!/bin/bash

BASE_URL="http://localhost:8000/api/books"

echo "== Test 1: GET semua buku =="
curl -s "$BASE_URL" | jq .

echo ""
echo "== Test 2: POST buku baru =="
NEW=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"judul":"Bumi","penulis":"Tere Liye","tahun":2014,"stok":2}')

echo "$NEW" | jq .
ID=$(echo "$NEW" | jq -r '.data.id')
echo "ID baru: $ID"

echo ""
echo "== Test 3: GET buku ID $ID =="
curl -s "$BASE_URL/$ID" | jq .

echo ""
echo "== Test 4: PUT ubah buku =="
curl -s -X PUT "$BASE_URL/$ID" \
  -H "Content-Type: application/json" \
  -d '{"judul":"Bumi Revisi","penulis":"Tere Liye","tahun":2014,"stok":5}' | jq .

echo ""
echo "== Test 5: DELETE buku =="
curl -s -X DELETE "$BASE_URL/$ID" | jq .

echo ""
echo "== Test 6: Validasi error =="
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"judul":""}' | jq .
