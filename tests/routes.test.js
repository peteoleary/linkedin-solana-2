const { ping, linkedin_token } = require( '../server/routes');

describe('Test Handlers', function () {

    test('responds to /ping', () => {
        const req = {  };

        const res = { text: '',
            send: function(input) { this.text = input } 
        };
        ping(req, res);
        
        expect(res.text).toEqual('hello world!');
    });

    test('responds to /linkedin_token', () => {
        const req = { params: { name: 'Bob' }  };

        const res = { text: '',
            send: function(input) { this.text = input } 
        };
        linkedin_token(req, res);
        
        expect(res.text).toEqual('hello Bob!');
    });

});
