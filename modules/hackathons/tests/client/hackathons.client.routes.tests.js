(function () {
  'use strict';

  describe('Hackathons Route Tests', function () {
    // Initialize global variables
    var $scope,
      HackathonsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _HackathonsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      HackathonsService = _HackathonsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('hackathons');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/hackathons');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          HackathonsController,
          mockHackathon;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('hackathons.view');
          $templateCache.put('modules/hackathons/client/views/view-hackathon.client.view.html', '');

          // create mock Hackathon
          mockHackathon = new HackathonsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Hackathon Name'
          });

          // Initialize Controller
          HackathonsController = $controller('HackathonsController as vm', {
            $scope: $scope,
            hackathonResolve: mockHackathon
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:hackathonId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.hackathonResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            hackathonId: 1
          })).toEqual('/hackathons/1');
        }));

        it('should attach an Hackathon to the controller scope', function () {
          expect($scope.vm.hackathon._id).toBe(mockHackathon._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/hackathons/client/views/view-hackathon.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          HackathonsController,
          mockHackathon;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('hackathons.create');
          $templateCache.put('modules/hackathons/client/views/form-hackathon.client.view.html', '');

          // create mock Hackathon
          mockHackathon = new HackathonsService();

          // Initialize Controller
          HackathonsController = $controller('HackathonsController as vm', {
            $scope: $scope,
            hackathonResolve: mockHackathon
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.hackathonResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/hackathons/create');
        }));

        it('should attach an Hackathon to the controller scope', function () {
          expect($scope.vm.hackathon._id).toBe(mockHackathon._id);
          expect($scope.vm.hackathon._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/hackathons/client/views/form-hackathon.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          HackathonsController,
          mockHackathon;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('hackathons.edit');
          $templateCache.put('modules/hackathons/client/views/form-hackathon.client.view.html', '');

          // create mock Hackathon
          mockHackathon = new HackathonsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Hackathon Name'
          });

          // Initialize Controller
          HackathonsController = $controller('HackathonsController as vm', {
            $scope: $scope,
            hackathonResolve: mockHackathon
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:hackathonId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.hackathonResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            hackathonId: 1
          })).toEqual('/hackathons/1/edit');
        }));

        it('should attach an Hackathon to the controller scope', function () {
          expect($scope.vm.hackathon._id).toBe(mockHackathon._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/hackathons/client/views/form-hackathon.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
