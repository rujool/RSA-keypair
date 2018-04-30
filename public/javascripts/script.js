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
    $scope.genKeys = function(){
        var url = 'https://www.random.org/integers/?num=10000&min=1&max=1000000000&col=1&base=10&format=plain&rnd=new';
        var p,q,lambda,e=bigInt(65537);     // Fixed e
        $scope.halted = false;
        $scope.buttonClicked = true;
        var found = false;
        numService.getNumbers(url).then(function(res){
            var resArr = res.split('\n');
            for(var i = 0; i < 9999 && !found; i++){
                p = bigInt(resArr[i]);
                for(var j = i+1; j < 10000 && !found; j++){
                    q = bigInt(resArr[j]);
                    lambda = bigInt.lcm(p.minus(1), q.minus(1));
                    console.log(p,q);
                    if(p%2 == 0 || q%2 == 0 || !p.isPrime() || !q.isPrime()
                        || bigInt.gcd(e, lambda).notEquals(1)){           // check gcd(lambda,e) == 1
                        continue;
                    }
                    else{
                        $scope.halted = true;
                        $scope.p = p;
                        $scope.q = q;
                        $scope.n = p.multiply(q);
                        $scope.e = e;
                        $scope.d = e.modInv(lambda);
                        found = true;
                    }
                }
            }
            if(!found){
                $scope.getRandomNumbers();
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