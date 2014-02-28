beforeEach(function() {
    this.fixtures = {
        Postings: {
            valid: {
                "status": "OK",
                "version": "1.0",
                "response": {
                    postings:[
                        {
                            category: "TEST",
                            timestamp: null,
                            id: 123,
                            source: "CRAIG",
                            location: {},
                            external_id: "",
                            heading: "",
                            external_url: ""
                        }
                    ]
                }
            }
        }
    };
});