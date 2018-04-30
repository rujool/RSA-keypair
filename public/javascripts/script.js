var app = angular.module('rsaKeyPair', ['ngRoute','ngSanitize']);

app.config(function($routeProvider,$sceDelegateProvider) {
    $routeProvider
        .when('/',{
            templateUrl: 'partials/index.html',
            controller: 'mainController'
        });
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads and from random.org.
        'self',
        'https://www.random.org/**'
    ]);
});


app.controller('mainController',['$scope','numService',function($scope,numService){
    $scope.getRandomNumbers = function(){
        var url = 'https://www.random.org/integers/?num=2&min=1&max=1000000000&col=1&base=10&format=plain&rnd=new';
        var p,q,lambda,e=bigInt(65537);
        $scope.halted = false;
        $scope.buttonClicked = true;
        var counter = 0;
        numService.getNumbers(url).then(function(res){
            counter+=1;
            p = bigInt(res.split('\n')[0]);
            q = bigInt(res.split('\n')[1]);
            lambda = bigInt.lcm(p.minus(1), q.minus(1));
            if(p%2 == 0 || q%2 == 0 || !p.isProbablePrime() || !q.isProbablePrime()
              || bigInt.gcd(e, lambda).notEquals(1)){           // check gcd(lambda,e) == 1
                if(counter===Number.MAX_SAFE_INTEGER){
                    $scope.halted = true;
                    $scope.error_message = "Could not generate primes. Please try again!";
                }
                $scope.getRandomNumbers();
            }
            else{
                $scope.halted = true;
                $scope.p = p;
                $scope.q = q;
                $scope.n = p.multiply(q);
                $scope.e = e;
                $scope.d = e.modInv(lambda);
            }
        }, function(err){
            console.log(err);
        });
    };
}]);

app.factory('numService', function($http) {
    return {
        getNumbers: function(url) {     // HTTP GET for retrieving truly random numbers
            return $http.get(url).then(function(response) {
                return response.data;
            },function(err){
                return err;
            });
        }
    }
})