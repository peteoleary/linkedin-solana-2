module.exports = [
  {
    /**
     * regular expression of URL
     */
    pattern: 'https://(.*).linkedin.com(.*)',

    /**
     * returns the data
     *
     * @param match array Result of the resolution of the regular expression
     * @param params object sent by 'send' function
     * @param headers object set by 'set' function
     * @param context object the context of running the fixtures function
     */
    fixtures: function (match, params, headers, context) {
      /**
       * Returning error codes example:
       *   request.get('https://domain.example/404').end(function(err, res){
       *     console.log(err); // 404
       *     console.log(res.notFound); // true
       *   })
       */
      if (match[1] === 'www') {
        return { 'access_token': 'abcdefgh'};
      } else if (match[1] === 'api') {
        return {
          "firstName":{
             "localized":{
                "en_US":"Bob"
             },
             "preferredLocale":{
                "country":"US",
                "language":"en"
             }
          },
          "localizedFirstName": "Bob",
          "headline":{
             "localized":{
                "en_US":"API Enthusiast at LinkedIn"
             },
             "preferredLocale":{
                "country":"US",
                "language":"en"
             }
          },
          "localizedHeadline": "API Enthusiast at LinkedIn",
          "vanityName": "bsmith",
          "id":"yrZCpj2Z12",
          "lastName":{
             "localized":{
                "en_US":"Smith"
             },
             "preferredLocale":{
                "country":"US",
                "language":"en"
             }
          },
          "localizedLastName": "Smith",
          "profilePicture": {
               "displayImage": "urn:li:digitalmediaAsset:C4D00AAAAbBCDEFGhiJ"
          }
       };
      }
      throw new Error(404);
    },

    /**
     * returns the result of the GET request
     *
     * @param match array Result of the resolution of the regular expression
     * @param data  mixed Data returns by `fixtures` attribute
     */
    get: function (match, data) {
      return {
        body: data
      };
    },

    /**
     * returns the result of the POST request
     *
     * @param match array Result of the resolution of the regular expression
     * @param data  mixed Data returns by `fixtures` attribute
     */
    post: function (match, data) {
      return {
        body: data,
        status: 201
      };
    }
  }
];
