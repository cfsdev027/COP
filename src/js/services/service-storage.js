export const ServiceStorage = {
    set: function(key,data) {
        localStorage.setItem(key,JSON.stringify(data));
    },
    get: function(key){
        try {
            return JSON.parse(localStorage.getItem(key))  
        } catch(e) {
            return null;
        };
    },
    erase: function(key) {
        localStorage.removeItem(key);
    }
};
