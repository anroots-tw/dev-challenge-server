module.exports = function(){
    return {
        request : {
            session : {},
            query : {},
            body: {}
        },

        response : {
            send : function(data) {
                this.sent.push(data);
            },
            json : function(data) {
                this.sent.push(JSON.stringify(data));
            },
            sent : []
        }
    };
};
