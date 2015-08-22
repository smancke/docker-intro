var app = angular.module('books', []);

app.controller("BooksCtrl", function($scope, $http) {
    $scope.books = [];
    $http.get("/books/book/_search")
        .then(function(response) {
            console.log(response.data);
            if (response.data.hits) {
                $scope.books = response.data.hits.hits;
            }
        });
});
