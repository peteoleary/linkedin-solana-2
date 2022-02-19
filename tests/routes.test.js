const { ping, linkedin_token } = require( '../server/routes');
const superagent = require('superagent');
var config = require('./superagent-mock-config');

var superagentMock = require('superagent-mock')(superagent, config);

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
       
        const req = { params: { code: 'Bob', state: '1234567' }  };

        const res = { text: '',
            send: function(input) { this.text = input } 
        };
        return linkedin_token(req, res).then(data => {
            expect(res.text.localizedFirstName).toEqual('Bob');
        })
    });

});
