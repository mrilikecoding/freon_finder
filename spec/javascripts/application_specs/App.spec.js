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

