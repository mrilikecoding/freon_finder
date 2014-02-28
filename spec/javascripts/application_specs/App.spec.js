// MODEL SPEC
describe('Posting model', function(){
    var p, collection;

    beforeEach(function(){
        p = new window.Posting({
            category: "TEST"
        });
        collection = {
            url: "/list"
        };
        p.collection = collection;
    });

    it('should be defined', function(){
        expect(p).toBeDefined();
    });

    describe('when instantiated', function(){
        it('should set defaults', function(){
            expect(p.get('source')).toEqual('CRAIG');
        });

        it('should exhibit attributes', function(){
            expect(p.get('category')).toEqual('TEST');
        });
    });

    describe("when no id is set", function(){
        it("should return the collection URL", function(){
           expect(p.url()).toEqual("/list");
        });
    });

    describe("when id is set", function(){
        it("should return the collection URL and ID", function(){
            p.id = 1;
            expect(p.url()).toEqual("/list/1");
        });
    });
});

//COLLECTION SPEC
describe('Postings collection', function(){

    describe('when instantiated with a model literal', function(){

        beforeEach(function(){
            this.fixture = this.fixtures.Postings.valid;
            this.server = sinon.fakeServer.create();
            this.server.respondWith(
                "GET",
                "/list",
                [
                    200,
                    {"Content-Type": "application/json"},
                    JSON.stringify(this.fixture)
                ]
            );

            this.postingStub = sinon.stub(window, "Posting");
            console.log(this);
            this.model = new Backbone.Model({
                id: 123,
                category: "TEST"
            });
            this.postingStub.returns(this.model);
            this.postings = new Postings();
            this.postings.model = Posting;
            this.postings.add({
                id: 123,
                category: "TEST"
            });
        });

        afterEach(function(){
            this.postingStub.restore();
            this.server.restore();
        });

        it("should add a model", function(){
            expect(this.postings.length).toEqual(1);
        });

        it("should find a model by id", function(){
           expect(this.postings.get(123).get("id")).toEqual(123);
        });

        it("should make the correct request", function(){
            this.postings.fetch();
            expect(this.server.requests.length).toEqual(1);
            expect(this.server.requests[0].method).toEqual("GET");
            expect(this.server.requests[0].url).toEqual("/list")

        });

        it("should parse postings from the response", function(){
            this.postings.fetch();
            this.server.respond();
            expect(this.postings.length)
                .toEqual(this.fixture.response.postings.length);
            expect(this.postings.models[0].get('category'))
                .toEqual(this.fixture.response.postings[0].category);
        });

    });
});


//ROUTER SPEC

//VIEWS SPEC