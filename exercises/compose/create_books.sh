#!/bin/bash

echo '{"title": "Programming in goolang"}' | POST http://127.0.0.1/books/book
echo '{"title": "Java ist eine Insel"}' | POST http://127.0.0.1/books/book
